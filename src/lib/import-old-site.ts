import "server-only";
import { randomUUID, timingSafeEqual } from "node:crypto";
import data from "@/data/import/old-site.json";
import { getWriteClient } from "@/sanity/lib/server-client";
import { serverEnv } from "@/lib/server-env";

/**
 * ONE-TIME import of content copied from the old www.s2holidays.com website.
 * Everything is created as a DRAFT (not visible on the website until an editor
 * publishes it in the Studio). Safe to re-run: existing documents are never overwritten.
 * Remove this file, the API route and the page once the import is done.
 */
type Pkg = (typeof data.packages)[number];
type Dest = (typeof data.destinations)[number];

export const IMPORT_BATCH = 4;
export const importTotals = { packages: data.packages.length, destinations: data.destinations.length };

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
  if (!c) throw new Error("SANITY_API_WRITE_TOKEN is not configured in Vercel");
  return c;
}

/** Upload an image from the old website once (deduplicated by source URL). */
async function imageFor(url: string | null | undefined, alt: string) {
  if (!url) return undefined;
  const c = client();
  let assetId = await c.fetch<string | null>(`*[_type == "sanity.imageAsset" && source.id == $url][0]._id`, { url });
  if (typeof assetId !== "string" || !assetId) {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !type.startsWith("image/")) return undefined;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 15_000_000) return undefined;
    const filename = decodeURIComponent(url.split("/").pop() || "image.jpg").replace(/\.jpg\d+\.jpg$/, ".jpg");
    const asset = await c.assets.upload("image", buf, {
      filename,
      contentType: type,
      source: { name: "s2holidays-old-website", id: url, url },
    });
    assetId = asset._id;
  }
  return { _type: "image", asset: { _type: "reference", _ref: assetId }, alt };
}

/** Find an existing destination (published or draft) by slug; otherwise create a draft. */
async function ensureDestination(d: Dest): Promise<{ id: string; created: boolean }> {
  const c = client();
  const existing = await c.fetch<string | null>(
    `*[_type == "destination" && slug.current == $slug] | order(_id asc)[0]._id`,
    { slug: d.slug }
  );
  if (typeof existing === "string" && existing) return { id: existing.replace(/^drafts\./, ""), created: false };
  const id = `destination-${d.slug}`;
  await c.createIfNotExists({
    _id: `drafts.${id}`,
    _type: "destination",
    name: d.name,
    slug: { _type: "slug", current: d.slug },
    region: d.region,
    state: d.state,
    country: d.country,
    heroImage: await imageFor(d.image, `${d.name} — S2 Holidays`),
  });
  return { id, created: true };
}

async function importPackage(p: Pkg, destId: string): Promise<"created" | "skipped"> {
  const c = client();
  const id = `package-${p.slug}`;
  const exists = await c.fetch<number>(`count(*[_id in [$id, $draft]])`, { id, draft: `drafts.${id}` });
  if (exists > 0) return "skipped";
  const notes = p.notes.flatMap((n) => [block(n.heading, "h3"), ...n.lines.map((l) => block(l))]);
  await c.createIfNotExists({
    _id: `drafts.${id}`,
    _type: "holidayPackage",
    title: p.title,
    slug: { _type: "slug", current: p.slug },
    region: p.region,
    destinations: [
      // weak + strengthenOnPublish lets a draft package point at a draft destination
      { _type: "reference", _key: key(), _ref: destId, _weak: true, _strengthenOnPublish: { type: "destination" } },
    ],
    themes: p.themes.length ? p.themes : undefined,
    durationNights: p.durationNights ?? undefined,
    durationDays: p.durationDays ?? undefined,
    price: p.price ?? undefined,
    priceNote: p.priceNote ?? undefined,
    itinerary: p.itinerary.map((d) => ({
      _type: "itineraryDay",
      _key: key(),
      day: d.day,
      title: d.title,
      description: d.description || undefined,
      meals: d.meals.length ? d.meals : undefined,
    })),
    inclusions: p.inclusions.length ? p.inclusions : undefined,
    exclusions: p.exclusions.length ? p.exclusions : undefined,
    importantNotes: notes.length ? notes : undefined,
    heroImage: await imageFor(p.image, `${p.title} — S2 Holidays`),
    featuredOnHomepage: false,
  });
  return "created";
}

/** Import one batch of packages starting at `offset`. Destinations are ensured as needed. */
export async function runImportBatch(offset: number) {
  const slice = data.packages.slice(offset, offset + IMPORT_BATCH);
  const results: { title: string; status: string }[] = [];
  const destIds = new Map<string, string>();
  for (const p of slice) {
    try {
      let destId = destIds.get(p.destination);
      if (!destId) {
        const d = data.destinations.find((x) => x.slug === p.destination)!;
        const r = await ensureDestination(d);
        destId = r.id;
        destIds.set(p.destination, destId);
      }
      results.push({ title: p.title, status: await importPackage(p, destId) });
    } catch (err) {
      results.push({ title: p.title, status: `error: ${(err as Error).message.slice(0, 160)}` });
    }
  }
  const next = offset + slice.length;
  return { results, next, done: next >= data.packages.length };
}
