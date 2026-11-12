import "server-only";
import { randomUUID, timingSafeEqual } from "node:crypto";
import data from "@/data/mahabaleshwar-import.json";
import { getWriteClient } from "@/sanity/lib/server-client";
import { serverEnv } from "@/lib/server-env";

/**
 * ONE-TIME: adds the Mahabaleshwar destination and 5 Mahabaleshwar packages (priced from the owner's current
 * regular-season hotel package rates), all with free-licence Wikimedia photos and credits, prices shown.
 * Also shows the existing Mahabaleshwar trips (MAH-01, MAH-02) under the new destination.
 * Never replaces a photo already set. Safe to re-run. Remove after use.
 */
type Photo = { url: string; alt: string; credit: string; creditUrl: string };
type Pkg = (typeof data.packages)[number];
type Doc = { _id: string; _type: string; [k: string]: unknown };

const photos = data.photos as Record<string, Photo>;
const STEPS: { key: string; label: string }[] = [
  { key: "D:mahabaleshwar", label: "Destination: Mahabaleshwar" },
  ...data.packages.map((p) => ({ key: p.kbId, label: p.title })),
  { key: "LINK", label: "Existing Mahabaleshwar trips" },
];
export const BATCH = 2;
export const mahabaleshwarTotal = STEPS.length;

export function checkPassword(given: unknown): boolean {
  const expected = serverEnv.revalidateSecret;
  if (!expected || typeof given !== "string") return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

function client() {
  const c = getWriteClient();
  if (!c) throw new Error("SANITY_API_WRITE_TOKEN is not configured");
  return c;
}

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const block = (text: string, style = "normal") => ({
  _type: "block",
  _key: key(),
  style,
  markDefs: [],
  children: [{ _type: "span", _key: key(), text, marks: [] }],
});
const download = (url: string) =>
  fetch(url, { headers: { "User-Agent": "S2HolidaysWebsite/1.0 (one-time photo import)" }, signal: AbortSignal.timeout(20000) });

async function heroImage(k: string) {
  const p = photos[k];
  const c = client();
  let assetId = await c.fetch<string | null>(`*[_type == "sanity.imageAsset" && source.id == $url][0]._id`, { url: p.url });
  if (!assetId) {
    let res = await download(p.url);
    for (let attempt = 1; res.status === 429 && attempt <= 2; attempt++) {
      await new Promise((r) => setTimeout(r, 4000 * attempt)); // Wikimedia rate limit – wait and retry
      res = await download(p.url);
    }
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !type.startsWith("image/")) throw new Error(`photo download failed (${res.status}) – press the button again in a minute`);
    const asset = await c.assets.upload("image", Buffer.from(await res.arrayBuffer()), {
      filename: decodeURIComponent(p.url.split("/").pop() || "photo.jpg"),
      contentType: type,
      source: { name: "wikimedia-commons", id: p.url, url: p.url },
    });
    assetId = asset._id;
  }
  return { _type: "image", asset: { _type: "reference", _ref: assetId }, alt: p.alt, credit: p.credit, creditUrl: p.creditUrl };
}

/** Photo, or undefined if Wikimedia is busy (pressing the button again fills it in). */
async function tryHeroImage(k: string) {
  try {
    return await heroImage(k);
  } catch {
    return undefined;
  }
}
const hasImg = (d: Doc | null | undefined) => !!(d?.heroImage as { asset?: unknown } | undefined)?.asset;
const PENDING = " (photo pending – press the button again in a minute)";

function published(d: Doc): Doc {
  const rest: Doc = { ...d, _id: d._id.replace(/^drafts\./, "") };
  delete rest._rev;
  delete rest._createdAt;
  delete rest._updatedAt;
  return rest;
}

async function destinationId(): Promise<string | null> {
  const ids = await client().fetch<string[]>(`*[_type == "destination" && slug.current == "mahabaleshwar"]._id`);
  const pub = ids.find((i) => !i.startsWith("drafts."));
  return pub ?? null;
}

async function doDestination(): Promise<string> {
  const c = client();
  const docs = await c.fetch<Doc[]>(`*[_type == "destination" && slug.current == "mahabaleshwar"] | order(_id asc)`);
  const pub = docs.find((d) => !d._id.startsWith("drafts."));
  const draft = docs.find((d) => d._id.startsWith("drafts."));
  if (pub && !draft) {
    if (hasImg(pub)) return "already live";
    const img = await tryHeroImage("D:mahabaleshwar");
    if (!img) return "live" + PENDING;
    await c.patch(pub._id).set({ heroImage: img }).commit();
    return "photo added";
  }
  if (draft) {
    const doc = published(draft);
    if (!hasImg(doc)) doc.heroImage = await tryHeroImage("D:mahabaleshwar");
    await c.transaction().createOrReplace(doc).delete(draft._id).commit();
    return hasImg(doc) ? "published with photo" : "published" + PENDING;
  }
  const d = data.destination;
  await c.createIfNotExists({
    _id: "destination-mahabaleshwar",
    _type: "destination",
    name: d.name,
    slug: { _type: "slug", current: d.slug },
    region: d.region,
    state: d.state ?? undefined,
    country: d.country ?? undefined,
    bestTimeToVisit: d.bestTimeToVisit ?? undefined,
    heroImage: await tryHeroImage("D:mahabaleshwar"),
    featured: false,
  });
  return "created";
}

/** Show the older Mahabaleshwar trips (published or still drafts) under the new destination too. */
async function linkExisting(): Promise<string> {
  const c = client();
  const destId = await destinationId();
  if (!destId) return "error: destination not published yet – press the button again";
  const done: string[] = [];
  for (const id of ["kb-mah-01", "drafts.kb-mah-01", "kb-mah-02", "drafts.kb-mah-02"]) {
    const doc = await c.getDocument<{ _id: string; destinations?: { _ref: string }[] }>(id);
    if (!doc || (doc.destinations ?? []).some((r) => r._ref === destId)) continue;
    await c.patch(id).setIfMissing({ destinations: [] }).append("destinations", [{ _type: "reference", _key: key(), _ref: destId }]).commit();
    done.push(id.replace("drafts.", "") + (id.startsWith("drafts.") ? " (hidden draft)" : ""));
  }
  return done.length ? `linked: ${done.join(", ")}` : "already linked";
}

async function doNew(p: Pkg): Promise<string> {
  const c = client();
  const id = `kb-${p.kbId.toLowerCase()}`;
  const existing = await c.getDocument<Doc>(id);
  if (existing) {
    if (hasImg(existing)) return "already live";
    const img = await tryHeroImage(p.kbId);
    if (!img) return "live" + PENDING;
    await c.patch(id).set({ heroImage: img }).commit();
    return "photo added";
  }
  const destId = await destinationId();
  if (!destId) return "error: destination not published yet – press the button again";
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
    heroImage: await tryHeroImage(p.kbId),
    featuredOnHomepage: false,
  });
  const created = await c.getDocument<Doc>(id);
  return hasImg(created) ? "added with photo and price" : "added with price" + PENDING;
}

export async function runBatch(offset: number) {
  const slice = STEPS.slice(offset, offset + BATCH);
  const results: { name: string; status: string }[] = [];
  for (const s of slice) {
    try {
      const status =
        s.key === "D:mahabaleshwar"
          ? await doDestination()
          : s.key === "LINK"
            ? await linkExisting()
            : await doNew(data.packages.find((p) => p.kbId === s.key)!);
      results.push({ name: s.label, status });
    } catch (err) {
      results.push({ name: s.label, status: `error: ${(err as Error).message.slice(0, 160)}` });
    }
  }
  const next = offset + slice.length;
  return { results, next, done: next >= STEPS.length };
}
