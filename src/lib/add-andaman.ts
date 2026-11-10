import "server-only";
import { randomUUID, timingSafeEqual } from "node:crypto";
import data from "@/data/andaman-import.json";
import { getWriteClient } from "@/sanity/lib/server-client";
import { serverEnv } from "@/lib/server-env";

/**
 * ONE-TIME: completes the Andaman section.
 * 1. Publishes the Andaman destination (it was a draft waiting for a photo) with a Wikimedia photo.
 * 2. Publishes the two existing Andaman trips (AND-01, AND-02; drafts waiting for photos) with photos.
 * 3. Adds 4 new Andaman trips (AND-03 to AND-06), published, with photos and prices shown.
 * Photos carry the credit their licence requires. Never replaces a photo already set. Safe to re-run. Remove after use.
 */
type Photo = { url: string; alt: string; credit: string; creditUrl: string };
type Pkg = (typeof data.packages)[number];
type Doc = { _id: string; _type: string; [k: string]: unknown };
type Ref = { _ref: string; _weak?: boolean; _strengthenOnPublish?: unknown; [k: string]: unknown };

const photos = data.photos as Record<string, Photo>;
const STEPS: { key: string; label: string }[] = [
  { key: "D:andaman", label: "Destination: Andaman Islands" },
  { key: "AND-01", label: "Andaman Islands Explorer 4N/5D (existing)" },
  { key: "AND-02", label: "Andaman Honeymoon Island Hopping 5N/6D (existing)" },
  ...data.packages.map((p) => ({ key: p.kbId, label: p.title })),
];
export const BATCH = 2;
export const andamanTotal = STEPS.length;

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
  const ids = await client().fetch<string[]>(`*[_type == "destination" && slug.current == "andaman"]._id`);
  const pub = ids.find((i) => !i.startsWith("drafts."));
  return pub ?? null;
}

async function doDestination(): Promise<string> {
  const c = client();
  const docs = await c.fetch<Doc[]>(`*[_type == "destination" && slug.current == "andaman"] | order(_id asc)`);
  const pub = docs.find((d) => !d._id.startsWith("drafts."));
  const draft = docs.find((d) => d._id.startsWith("drafts."));
  if (pub && !draft) {
    if (hasImg(pub)) return "already live";
    const img = await tryHeroImage("D:andaman");
    if (!img) return "live" + PENDING;
    await c.patch(pub._id).set({ heroImage: img }).commit();
    return "photo added";
  }
  if (draft) {
    const doc = published(draft);
    if (!hasImg(doc)) doc.heroImage = await tryHeroImage("D:andaman");
    await c.transaction().createOrReplace(doc).delete(draft._id).commit();
    return hasImg(doc) ? "published with photo" : "published" + PENDING;
  }
  const d = data.destination;
  await c.createIfNotExists({
    _id: "destination-andaman",
    _type: "destination",
    name: d.name,
    slug: { _type: "slug", current: d.slug },
    region: d.region,
    state: d.state ?? undefined,
    country: d.country ?? undefined,
    bestTimeToVisit: d.bestTimeToVisit ?? undefined,
    heroImage: await tryHeroImage("D:andaman"),
    featured: false,
  });
  return "created";
}

async function doExisting(code: string): Promise<string> {
  const c = client();
  const id = `kb-${code.toLowerCase()}`;
  const destId = await destinationId();
  if (!destId) return "error: destination not published yet – press the button again";
  const draft = await c.getDocument<Doc>(`drafts.${id}`);
  const pub = await c.getDocument<Doc>(id);
  if (!draft && !pub) return "not found (skipped)";
  if (!draft && pub) {
    if (hasImg(pub)) return "already live";
    const img = await tryHeroImage(code);
    if (!img) return "live" + PENDING;
    await c.patch(id).set({ heroImage: img }).commit();
    return "photo added";
  }
  const doc = published(draft!);
  if (!hasImg(doc)) doc.heroImage = await tryHeroImage(code);
  doc.destinations = ((doc.destinations as Ref[]) ?? []).map((r) => {
    const strong: Ref = { ...r };
    delete strong._weak;
    delete strong._strengthenOnPublish;
    return strong;
  });
  await c.transaction().createOrReplace(doc).delete(draft!._id).commit();
  return hasImg(doc) ? "published with photo" : "published" + PENDING;
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
        s.key === "D:andaman"
          ? await doDestination()
          : s.key === "AND-01" || s.key === "AND-02"
            ? await doExisting(s.key)
            : await doNew(data.packages.find((p) => p.kbId === s.key)!);
      results.push({ name: s.label, status });
    } catch (err) {
      results.push({ name: s.label, status: `error: ${(err as Error).message.slice(0, 160)}` });
    }
  }
  const next = offset + slice.length;
  return { results, next, done: next >= STEPS.length };
}
