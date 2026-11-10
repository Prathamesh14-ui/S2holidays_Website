import "server-only";
import { randomUUID, timingSafeEqual } from "node:crypto";
import data from "@/data/mumbai-goa-import.json";
import { getWriteClient } from "@/sanity/lib/server-client";
import { serverEnv } from "@/lib/server-env";

/**
 * ONE-TIME: adds the "Mumbai to Goa" destination (no photo yet – the owner will send photos),
 * its 2 new cruise trips (MG-01, MG-02) with prices shown, and links the existing
 * Mumbai – Goa – Mumbai cruise (GOA-06) to the new destination. Safe to re-run. Remove after use.
 */
type Pkg = (typeof data.packages)[number];

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

export async function addMumbaiGoa() {
  const c = getWriteClient();
  if (!c) throw new Error("SANITY_API_WRITE_TOKEN is not configured");
  const results: { name: string; status: string }[] = [];
  const d = data.destinations[0];

  // 1. Destination (published, no photo)
  const ids = await c.fetch<string[]>(`*[_type == "destination" && slug.current == $slug]._id`, { slug: d.slug });
  let destId = ids.find((i) => !i.startsWith("drafts."));
  if (destId) results.push({ name: `Destination: ${d.name}`, status: "already exists" });
  else {
    destId = `destination-${d.slug}`;
    await c.createIfNotExists({
      _id: destId,
      _type: "destination",
      name: d.name,
      slug: { _type: "slug", current: d.slug },
      region: d.region,
      country: d.country ?? undefined,
      tagline: "Sail to Goa from Mumbai",
      bestTimeToVisit: d.bestTimeToVisit ?? undefined,
      featured: false,
    });
    results.push({ name: `Destination: ${d.name}`, status: "created (add a photo in Studio later)" });
  }

  // 2. New trips (published, price shown)
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

  // 3. Link the existing round-trip cruise (GOA-06) to the new destination as well
  for (const id of ["kb-goa-06", "drafts.kb-goa-06"]) {
    const doc = await c.getDocument<{ _id: string; destinations?: { _ref: string }[] }>(id);
    if (!doc) continue;
    if ((doc.destinations ?? []).some((r) => r._ref === destId)) {
      results.push({ name: "Mumbai – Goa – Mumbai Cruise 2N/3D", status: "already linked" });
      continue;
    }
    await c.patch(id).setIfMissing({ destinations: [] }).append("destinations", [{ _type: "reference", _key: key(), _ref: destId }]).commit();
    results.push({ name: `Mumbai – Goa – Mumbai Cruise 2N/3D${id.startsWith("drafts.") ? " (draft)" : ""}`, status: "linked to Mumbai to Goa" });
  }
  return results;
}
