import "server-only";
import { randomUUID, timingSafeEqual } from "node:crypto";
import data from "@/data/kb-import.json";
import { getWriteClient } from "@/sanity/lib/server-client";
import { serverEnv } from "@/lib/server-env";

/**
 * ONE-TIME import of the "S2 Holidays Travel Knowledge Base" Excel (98 packages, 34 destinations).
 * Step 1 "import": everything is created as DRAFTS (not visible on the website).
 * Step 2 "publish": publishes the new destinations + packages that have a photo, and hides
 *   (unpublishes) the 23 packages copied from the old website — they stay in the Studio as drafts.
 * Prices are imported with "Show price on website" OFF (they are proposals awaiting owner approval).
 * Safe to re-run: existing documents are never overwritten. Remove after use.
 */
type Pkg = (typeof data.packages)[number];
type Dest = (typeof data.destinations)[number];
type Doc = { _id: string; _type: string; [k: string]: unknown };
type Ref = { _ref: string; _weak?: boolean; _strengthenOnPublish?: unknown; [k: string]: unknown };

export const IMPORT_BATCH = 3;
export const PUBLISH_BATCH = 25;
export const kbTotals = { packages: data.packages.length, destinations: data.destinations.length };

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

/** Download a photo once and store it in Sanity (deduplicated by its source URL). */
async function uploadImage(url: string | null | undefined): Promise<string | null> {
  if (!url || !/^https:\/\//.test(url)) return null;
  const c = client();
  const existing = await c.fetch<string | null>(`*[_type == "sanity.imageAsset" && source.id == $url][0]._id`, { url });
  if (typeof existing === "string" && existing) return existing;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
    const type = res.headers.get("content-type") || "";
    if (!res.ok || !type.startsWith("image/")) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > 15_000_000) return null;
    const asset = await c.assets.upload("image", buf, {
      filename: `${url.split("/").pop()?.split("?")[0] || "photo"}.jpg`,
      contentType: type,
      source: { name: "s2holidays-knowledge-base", id: url, url },
    });
    return asset._id;
  } catch {
    return null;
  }
}

const imageField = (assetId: string | null, alt: string) =>
  assetId ? { _type: "image", asset: { _type: "reference", _ref: assetId }, alt } : undefined;

/** Existing destination (published or draft) by slug, else a new draft. Returns its id and photo. */
async function ensureDestination(d: Dest): Promise<{ id: string; heroAsset: string | null }> {
  const c = client();
  const found = await c.fetch<{ _id: string; asset?: string } | null>(
    `*[_type == "destination" && slug.current == $slug] | order(_id asc)[0]{_id, "asset": heroImage.asset._ref}`,
    { slug: d.slug }
  );
  if (found && typeof found._id === "string") return { id: found._id.replace(/^drafts\./, ""), heroAsset: found.asset ?? null };
  const id = `destination-${d.slug}`;
  const asset = await uploadImage(d.image);
  await c.createIfNotExists({
    _id: `drafts.${id}`,
    _type: "destination",
    name: d.name,
    slug: { _type: "slug", current: d.slug },
    region: d.region,
    state: d.state ?? undefined,
    country: d.country ?? undefined,
    bestTimeToVisit: d.bestTimeToVisit ?? undefined,
    heroImage: imageField(asset, `${d.name} — S2 Holidays`),
    featured: false,
  });
  return { id, heroAsset: asset };
}

async function importPackage(p: Pkg, dest: { id: string; heroAsset: string | null }): Promise<string> {
  const c = client();
  const id = `kb-${p.kbId.toLowerCase()}`;
  const exists = await c.fetch<number>(`count(*[_id in [$id, $draft]])`, { id, draft: `drafts.${id}` });
  if (exists > 0) return "skipped";
  const asset = (await uploadImage(p.image)) ?? dest.heroAsset;
  const notes = p.notes.flatMap((n) => [block(n.heading, "h3"), ...n.lines.map((l) => block(l))]);
  await c.createIfNotExists({
    _id: `drafts.${id}`,
    _type: "holidayPackage",
    title: p.title,
    slug: { _type: "slug", current: p.slug },
    region: p.region,
    destinations: [{ _type: "reference", _key: key(), _ref: dest.id, _weak: true, _strengthenOnPublish: { type: "destination" } }],
    themes: p.themes.length ? p.themes : undefined,
    durationNights: p.durationNights,
    durationDays: p.durationDays,
    price: p.price ?? undefined,
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
    heroImage: imageField(asset, `${p.title} — S2 Holidays`),
    featuredOnHomepage: p.featured,
  });
  return asset ? "created" : "created (no photo — add one in Studio)";
}

/** Step 1: import one batch of packages (as drafts) starting at `offset`. */
export async function runImportBatch(offset: number) {
  const slice = data.packages.slice(offset, offset + IMPORT_BATCH);
  const results: { name: string; status: string }[] = [];
  for (const p of slice) {
    try {
      const d = data.destinations.find((x) => x.slug === p.destination)!;
      results.push({ name: p.title, status: await importPackage(p, await ensureDestination(d)) });
    } catch (err) {
      results.push({ name: p.title, status: `error: ${(err as Error).message.slice(0, 160)}` });
    }
  }
  const next = offset + slice.length;
  return { results, next, done: next >= data.packages.length };
}

function toPublished(d: Doc): Doc {
  const rest: Doc = { ...d, _id: d._id.replace(/^drafts\./, "") };
  delete rest._rev;
  delete rest._createdAt;
  delete rest._updatedAt;
  return rest;
}

/**
 * Step 2 (repeat until done): publish imported destinations + packages that have a photo,
 * then hide the old-website packages (published "package-*" → back to draft).
 */
export async function runPublishBatch() {
  const c = client();
  const results: { name: string; status: string }[] = [];
  const kbDestSlugs = data.destinations.map((d) => d.slug);
  let budget = PUBLISH_BATCH;

  const dests = await c.fetch<Doc[]>(
    `*[_type == "destination" && string::startsWith(_id, "drafts.destination-") && slug.current in $slugs && defined(heroImage.asset)]`,
    { slugs: kbDestSlugs }
  );
  for (const d of dests.slice(0, budget)) {
    await c.transaction().createOrReplace(toPublished(d)).delete(d._id).commit();
    results.push({ name: `Destination: ${String(d.name)}`, status: "published" });
    budget--;
  }

  if (budget > 0) {
    const pkgs = await c.fetch<Doc[]>(`*[_type == "holidayPackage" && string::startsWith(_id, "drafts.kb-") && defined(heroImage.asset)]`);
    const refIds = [...new Set(pkgs.flatMap((p) => ((p.destinations as Ref[]) ?? []).map((r) => r._ref)))];
    const live = new Set(await c.fetch<string[]>(`*[_id in $ids]._id`, { ids: refIds }));
    for (const p of pkgs.slice(0, budget)) {
      const destinations = ((p.destinations as Ref[]) ?? []).map((r) => {
        if (!live.has(r._ref)) return r;
        const strong: Ref = { ...r };
        delete strong._weak;
        delete strong._strengthenOnPublish;
        return strong;
      });
      await c.transaction().createOrReplace(toPublished({ ...p, destinations })).delete(p._id).commit();
      results.push({ name: String(p.title), status: "published" });
      budget--;
    }
  }

  if (budget > 0) {
    const old = await c.fetch<Doc[]>(`*[_type == "holidayPackage" && string::startsWith(_id, "package-")]`);
    for (const o of old.slice(0, budget)) {
      const draft = { ...toPublished(o), _id: `drafts.${o._id}` };
      await c.transaction().createIfNotExists(draft).delete(o._id).commit();
      results.push({ name: `Old package hidden: ${String(o.title)}`, status: "hidden (kept as draft)" });
      budget--;
    }
  }

  const remaining = await c.fetch<number>(
    `count(*[(_type == "destination" && string::startsWith(_id, "drafts.destination-") && slug.current in $slugs && defined(heroImage.asset))
      || (_type == "holidayPackage" && string::startsWith(_id, "drafts.kb-") && defined(heroImage.asset))
      || (_type == "holidayPackage" && string::startsWith(_id, "package-"))])`,
    { slugs: kbDestSlugs }
  );
  const waitingForPhoto = await c.fetch<string[]>(
    `*[(_type == "holidayPackage" && string::startsWith(_id, "drafts.kb-") && !defined(heroImage.asset))
      || (_type == "destination" && string::startsWith(_id, "drafts.destination-") && slug.current in $slugs && !defined(heroImage.asset))]{"n": coalesce(title, name)}.n`,
    { slugs: kbDestSlugs }
  );
  return { results, done: remaining === 0, waitingForPhoto };
}
