import "server-only";
import { randomUUID, timingSafeEqual } from "node:crypto";
import data from "@/data/ne-import.json";
import { getWriteClient } from "@/sanity/lib/server-client";
import { serverEnv } from "@/lib/server-env";

/**
 * ONE-TIME: completes the North East section (no photos – the owner will send them later).
 * 1. Publishes the North East destination (it was a draft waiting for a photo).
 * 2. Publishes the two existing North East trips (NE-01, NE-02; drafts waiting for photos).
 * 3. Adds 8 new North East trips (NE-03 to NE-10), published with prices shown.
 * Safe to re-run. Remove after use.
 */
type Pkg = (typeof data.packages)[number];
type Doc = { _id: string; _type: string; [k: string]: unknown };
type Ref = { _ref: string; _weak?: boolean; _strengthenOnPublish?: unknown; [k: string]: unknown };

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

function published(d: Doc): Doc {
  const rest: Doc = { ...d, _id: d._id.replace(/^drafts\./, "") };
  delete rest._rev;
  delete rest._createdAt;
  delete rest._updatedAt;
  return rest;
}

export async function addNorthEast() {
  const c = getWriteClient();
  if (!c) throw new Error("SANITY_API_WRITE_TOKEN is not configured");
  const results: { name: string; status: string }[] = [];
  const d = data.destinations[0];

  // 1. Destination
  const dests = await c.fetch<Doc[]>(`*[_type == "destination" && slug.current == $slug] | order(_id asc)`, { slug: d.slug });
  let destId = dests.find((x) => !x._id.startsWith("drafts."))?._id;
  const destDraft = dests.find((x) => x._id.startsWith("drafts."));
  if (destDraft) {
    const doc = published(destDraft);
    await c.transaction().createOrReplace(doc).delete(destDraft._id).commit();
    destId = doc._id;
    results.push({ name: `Destination: ${d.name}`, status: "published" });
  } else if (destId) {
    results.push({ name: `Destination: ${d.name}`, status: "already live" });
  } else {
    destId = `destination-${d.slug}`;
    await c.createIfNotExists({
      _id: destId,
      _type: "destination",
      name: d.name,
      slug: { _type: "slug", current: d.slug },
      region: d.region,
      state: d.state ?? undefined,
      country: d.country ?? undefined,
      bestTimeToVisit: d.bestTimeToVisit ?? undefined,
      featured: false,
    });
    results.push({ name: `Destination: ${d.name}`, status: "created" });
  }

  // 2. Existing trips waiting as drafts
  for (const code of ["ne-01", "ne-02"]) {
    const draft = await c.getDocument<Doc>(`drafts.kb-${code}`);
    if (!draft) {
      results.push({ name: code.toUpperCase(), status: (await c.getDocument(`kb-${code}`)) ? "already live" : "not found (skipped)" });
      continue;
    }
    const doc = published(draft);
    doc.destinations = ((doc.destinations as Ref[]) ?? []).map((r) => {
      const strong: Ref = { ...r };
      delete strong._weak;
      delete strong._strengthenOnPublish;
      return strong;
    });
    await c.transaction().createOrReplace(doc).delete(draft._id).commit();
    results.push({ name: String(doc.title ?? code), status: "published" });
  }

  // 3. New trips
  for (const p of data.packages as Pkg[]) {
    const id = `kb-${p.kbId.toLowerCase()}`;
    const exists = await c.fetch<number>(`count(*[_id in [$id, $draft]])`, { id, draft: `drafts.${id}` });
    if (exists > 0) {
      results.push({ name: p.title, status: "already exists" });
      continue;
    }
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
    results.push({ name: p.title, status: `added with price (₹${(p.price?.amount ?? 0).toLocaleString("en-IN")})` });
  }
  return results;
}
