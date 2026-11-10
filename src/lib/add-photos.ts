import "server-only";
import { timingSafeEqual } from "node:crypto";
import photos from "@/data/new-trips-photos.json";
import { getWriteClient } from "@/sanity/lib/server-client";
import { serverEnv } from "@/lib/server-env";

/**
 * ONE-TIME: adds free-licence photos from Wikimedia Commons (with the credit their licence requires)
 * to the 32 new trips and their new destinations. Only fills a photo where none is set yet, so photos
 * the owner uploaded in Studio are never replaced. Safe to re-run. Remove after use.
 */
type Photo = { url: string; alt: string; credit: string; creditUrl: string };
type Item = { kind: "package" | "destination"; key: string; label: string; photo: Photo };

const ITEMS: Item[] = [
  ...Object.entries(photos.packages as Record<string, Photo & { label: string }>).map(([key, p]) => ({ kind: "package" as const, key, label: p.label, photo: p })),
  ...Object.entries(photos.destinations as Record<string, Photo & { label: string }>).map(([key, p]) => ({ kind: "destination" as const, key, label: p.label, photo: p })),
];
export const BATCH = 2;
export const photoTotal = ITEMS.length;

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

const download = (url: string) =>
  fetch(url, { headers: { "User-Agent": "S2HolidaysWebsite/1.0 (one-time photo import)" }, signal: AbortSignal.timeout(20000) });

async function upload(url: string): Promise<string> {
  const c = client();
  const existing = await c.fetch<string | null>(`*[_type == "sanity.imageAsset" && source.id == $url][0]._id`, { url });
  if (typeof existing === "string" && existing) return existing;
  let res = await download(url);
  for (let attempt = 1; res.status === 429 && attempt <= 2; attempt++) {
    await new Promise((r) => setTimeout(r, 4000 * attempt)); // Wikimedia rate limit – wait and retry
    res = await download(url);
  }
  const type = res.headers.get("content-type") || "";
  if (!res.ok || !type.startsWith("image/")) throw new Error(`photo download failed (${res.status})`);
  const buf = Buffer.from(await res.arrayBuffer());
  const asset = await c.assets.upload("image", buf, {
    filename: decodeURIComponent(url.split("/").pop() || "photo.jpg"),
    contentType: type,
    source: { name: "wikimedia-commons", id: url, url },
  });
  return asset._id;
}

async function addOne(item: Item): Promise<string> {
  const c = client();
  const ids =
    item.kind === "package"
      ? [`kb-${item.key.toLowerCase()}`, `drafts.kb-${item.key.toLowerCase()}`]
      : await c.fetch<string[]>(`*[_type == "destination" && slug.current == $slug]._id`, { slug: item.key });
  const docs = await c.fetch<{ _id: string; has: boolean }[]>(`*[_id in $ids]{_id, "has": defined(heroImage.asset)}`, { ids });
  if (!docs.length) return item.kind === "package" ? "not found – press “Add the new trips” first" : "not found (destination)";
  const missing = docs.filter((d) => !d.has);
  if (!missing.length) return "skipped (already has a photo)";
  const assetId = await upload(item.photo.url);
  const heroImage = {
    _type: "image",
    asset: { _type: "reference", _ref: assetId },
    alt: item.photo.alt,
    credit: item.photo.credit,
    creditUrl: item.photo.creditUrl,
  };
  const tx = c.transaction();
  for (const d of missing) tx.patch(d._id, (p) => p.set({ heroImage }));
  await tx.commit();
  return "photo added";
}

export async function runBatch(offset: number) {
  const slice = ITEMS.slice(offset, offset + BATCH);
  const results: { name: string; status: string }[] = [];
  for (const item of slice) {
    try {
      results.push({ name: item.label, status: await addOne(item) });
    } catch (err) {
      results.push({ name: item.label, status: `error: ${(err as Error).message.slice(0, 160)}` });
    }
  }
  const next = offset + slice.length;
  return { results, next, done: next >= ITEMS.length };
}
