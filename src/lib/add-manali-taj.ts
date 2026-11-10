import "server-only";
import { randomUUID, timingSafeEqual } from "node:crypto";
import data from "@/data/manali-taj-import.json";
import { getWriteClient } from "@/sanity/lib/server-client";
import { serverEnv } from "@/lib/server-env";

/**
 * ONE-TIME: adds the "Kullu Manali" and "Taj Mahal" destinations (no photos yet), 13 new trips with
 * prices shown, and links existing trips so each destination shows the full set:
 *   Kullu Manali = 10 new + HIM-01..HIM-04;  Taj Mahal = 3 new + TAJ-01, GT-01, GT-02.
 * Safe to re-run. Remove after use.
 */
type Pkg = (typeof data.packages)[number];
type Dest = (typeof data.destinations)[number];

const LINKS: Record<string, string[]> = {
  "kullu-manali": ["kb-him-01", "kb-him-02", "kb-him-03", "kb-him-04"],
  "taj-mahal": ["kb-taj-01", "kb-gt-01", "kb-gt-02"],
};

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

async function ensureDestination(d: Dest, results: { name: string; status: string }[]): Promise<string> {
  const c = client();
  const ids = await c.fetch<string[]>(`*[_type == "destination" && slug.current == $slug]._id`, { slug: d.slug });
  const pub = ids.find((i) => !i.startsWith("drafts."));
  if (pub) {
    results.push({ name: `Destination: ${d.name}`, status: "already exists" });
    return pub;
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
  results.push({ name: `Destination: ${d.name}`, status: "created (add a photo in Studio later)" });
  return id;
}

async function addPackage(p: Pkg, destId: string): Promise<string> {
  const c = client();
  const id = `kb-${p.kbId.toLowerCase()}`;
  const exists = await c.fetch<number>(`count(*[_id in [$id, $draft]])`, { id, draft: `drafts.${id}` });
  if (exists > 0) return "already exists";
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
    price: p.price ? { ...p.price, show: true } : undefined,
    summary: p.summary ?? undefined,
    highlights: p.highlights.length ? p.highlights : undefined,
    itinerary: p.itinerary.map((day) => ({
      _type: "itineraryDay",
      _key: key(),
      day: day.day,
      title: day.title,
      description: day.description || undefined,
      meals: day.meals.length ? day.meals : undefined,
      overnight: day.overnight ?? undefined,
    })),
    inclusions: p.inclusions.length ? p.inclusions : undefined,
    exclusions: p.exclusions.length ? p.exclusions : undefined,
    importantNotes: notes.length ? notes : undefined,
    featuredOnHomepage: false,
  });
  return `added with price (₹${(p.price?.amount ?? 0).toLocaleString("en-IN")})`;
}

async function linkExisting(baseId: string, destId: string, destName: string): Promise<{ name: string; status: string }[]> {
  const c = client();
  const out: { name: string; status: string }[] = [];
  for (const id of [baseId, `drafts.${baseId}`]) {
    const doc = await c.getDocument<{ _id: string; title?: string; destinations?: { _ref: string }[] }>(id);
    if (!doc) continue;
    const name = `${doc.title ?? baseId}${id.startsWith("drafts.") ? " (draft)" : ""}`;
    if ((doc.destinations ?? []).some((r) => r._ref === destId)) {
      out.push({ name, status: `already shown under ${destName}` });
      continue;
    }
    await c.patch(id).setIfMissing({ destinations: [] }).append("destinations", [{ _type: "reference", _key: key(), _ref: destId }]).commit();
    out.push({ name, status: `now also shown under ${destName}` });
  }
  if (!out.length) out.push({ name: baseId.toUpperCase(), status: "not found (skipped)" });
  return out;
}

export async function addManaliTaj() {
  const results: { name: string; status: string }[] = [];
  for (const d of data.destinations) {
    const destId = await ensureDestination(d, results);
    for (const p of data.packages.filter((x) => x.destination === d.slug)) {
      try {
        results.push({ name: p.title, status: await addPackage(p, destId) });
      } catch (err) {
        results.push({ name: p.title, status: `error: ${(err as Error).message.slice(0, 160)}` });
      }
    }
    for (const id of LINKS[d.slug] ?? []) results.push(...(await linkExisting(id, destId, d.name)));
  }
  return results;
}
