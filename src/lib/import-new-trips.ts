import "server-only";
import { randomUUID, timingSafeEqual } from "node:crypto";
import data from "@/data/new-trips-import.json";
import { getWriteClient } from "@/sanity/lib/server-client";
import { serverEnv } from "@/lib/server-env";

/**
 * ONE-TIME import of the 32 trips added to the knowledge base in Nov 2026 (version 3 of the Excel).
 * Creates them PUBLISHED (owner's choice) with "Show price on website" OFF – prices are proposals
 * awaiting owner approval. New destinations are created published too. No photos are included:
 * the owner adds them in Studio. Safe to re-run: existing documents are never overwritten. Remove after use.
 */
type Pkg = (typeof data.packages)[number];
type Dest = (typeof data.destinations)[number];

export const BATCH = 4;
export const newTripTotals = { packages: data.packages.length, destinations: data.destinations.length };

export function checkPassword(given: unknown): boolean {
  const expected = serverEnv.revalidateSecret;
  if (!expected || typeof given !== "string") return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const block = (text: string, style = "normal") => ({
  _type: "block",
  _key: key(),
  style,
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
});

function client() {
  const c = getWriteClient();
  if (!c) throw new Error("SANITY_API_WRITE_TOKEN is not configured");
  return c;
}

/** Published destination id for this slug – reuses an existing one (publishing it if it only exists as a draft). */
async function ensureDestination(d: Dest): Promise<{ id: string; status: string }> {
  const c = client();
  const found = await c.fetch<{ _id: string }[]>(`*[_type == "destination" && slug.current == $slug] | order(_id asc){_id}`, { slug: d.slug });
  const published = found.find((x) => !x._id.startsWith("drafts."));
  if (published) return { id: published._id, status: "existing" };
  const draft = found.find((x) => x._id.startsWith("drafts."));
  if (draft) {
    const doc = await c.getDocument(draft._id);
    if (doc) {
      const id = draft._id.replace(/^drafts\./, "");
      const rest: Record<string, unknown> = { ...doc, _id: id };
      delete rest._rev;
      delete rest._createdAt;
      delete rest._updatedAt;
      await c.transaction().createOrReplace(rest as { _id: string; _type: string }).delete(draft._id).commit();
      return { id, status: "published (was a draft)" };
    }
  }
  const id = `destination-${d.slug}`;
  await c.createIfNotExists({
    _id: id,
    _type: "destination",
    name: d.name,
    slug: { _type: "slug", current: d.slug },
    region: d.region,
    state: d.state ?? undefined,
    country: d.country ?? undefined,
    bestTimeToVisit: d.bestTimeToVisit ?? undefined,
    featured: false,
  });
  return { id, status: "created" };
}

async function importPackage(p: Pkg, destId: string): Promise<string> {
  const c = client();
  const id = `kb-${p.kbId.toLowerCase()}`;
  const exists = await c.fetch<number>(`count(*[_id in [$id, $draft]])`, { id, draft: `drafts.${id}` });
  if (exists > 0) return "skipped (already exists)";
  const notes = p.notes.flatMap((n) => [block(n.heading, "h3"), ...n.lines.map((l) => block(l))]);
  await c.createIfNotExists({
    _id: id,
    _type: "holidayPackage",
    title: p.title,
    slug: { _type: "slug", current: p.slug },
    region: p.region,
    destinations: [{ _type: "reference", _key: key(), _ref: destId }],
    themes: p.themes.length ? p.themes : undefined,
    durationNights: p.durationNights,
    durationDays: p.durationDays,
    price: p.price ? { ...p.price, show: false } : undefined,
    summary: p.summary ?? undefined,
    highlights: p.highlights.length ? p.highlights : undefined,
    itinerary: p.itinerary.map((d) => ({
      _type: "itineraryDay",
      _key: key(),
      day: d.day,
      title: d.title,
      description: d.description || undefined,
      meals: d.meals.length ? d.meals : undefined,
      overnight: d.overnight ?? undefined,
    })),
    inclusions: p.inclusions.length ? p.inclusions : undefined,
    exclusions: p.exclusions.length ? p.exclusions : undefined,
    importantNotes: notes.length ? notes : undefined,
    featuredOnHomepage: false,
  });
  return "published (price hidden, no photo yet)";
}

/** Import one batch of packages starting at `offset`. */
export async function runBatch(offset: number) {
  const slice = data.packages.slice(offset, offset + BATCH);
  const results: { name: string; status: string }[] = [];
  const destCache = new Map<string, string>();
  for (const p of slice) {
    try {
      let destId = destCache.get(p.destination);
      if (!destId) {
        const d = data.destinations.find((x) => x.slug === p.destination)!;
        const r = await ensureDestination(d);
        if (r.status !== "existing") results.push({ name: `Destination: ${d.name}`, status: r.status });
        destId = r.id;
        destCache.set(p.destination, destId);
      }
      results.push({ name: p.title, status: await importPackage(p, destId) });
    } catch (err) {
      results.push({ name: p.title, status: `error: ${(err as Error).message.slice(0, 160)}` });
    }
  }
  const next = offset + slice.length;
  return { results, next, done: next >= data.packages.length };
}
