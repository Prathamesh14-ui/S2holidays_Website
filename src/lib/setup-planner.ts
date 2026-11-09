import "server-only";
import { randomUUID, timingSafeEqual } from "node:crypto";
import { plannerDefaults } from "@/data/planner-defaults";
import { getWriteClient } from "@/sanity/lib/server-client";
import { serverEnv } from "@/lib/server-env";

/**
 * ONE-TIME: copy the 6 starter trip-planner destinations into the Studio (Trip planner),
 * so the owner can add rates there. No prices are included and "Show calculated prices"
 * stays OFF. Existing planner documents are never overwritten. Remove after use.
 */
export function checkPassword(given: unknown): boolean {
  const expected = serverEnv.revalidateSecret;
  if (!expected || typeof given !== "string") return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const k = () => randomUUID().replace(/-/g, "").slice(0, 12);

export async function setupPlanner() {
  const c = getWriteClient();
  if (!c) throw new Error("SANITY_API_WRITE_TOKEN is not configured");
  const results: { name: string; status: string }[] = [];
  for (const [i, d] of plannerDefaults.entries()) {
    const id = `planner-${d.slug}`;
    const exists = await c.fetch<number>(`count(*[_id in [$id, $draft]])`, { id, draft: `drafts.${id}` });
    if (exists > 0) {
      results.push({ name: d.title, status: "already set up" });
      continue;
    }
    const destId = d.destinationSlug
      ? await c.fetch<string | null>(`*[_type == "destination" && slug.current == $s && !(_id in path("drafts.**"))][0]._id`, { s: d.destinationSlug })
      : null;
    await c.createIfNotExists({
      _id: id,
      _type: "plannerDestination",
      title: d.title,
      slug: { _type: "slug", current: d.slug },
      active: true,
      order: i + 1,
      ...(typeof destId === "string" ? { destination: { _type: "reference", _ref: destId } } : {}),
      intro: d.intro,
      startPoint: d.startPoint,
      endPoint: d.endPoint,
      places: d.places.map((p) => ({
        _type: "plannerPlace",
        _key: k(),
        name: p.name,
        key: { _type: "slug", current: p.key },
        description: p.description,
        defaultNights: p.defaultNights,
        sightseeing: (p.sightseeing ?? []).map((s) => ({ _type: "plannerSight", _key: k(), name: s.name })),
      })),
      vehicles: d.vehicles.map((v) => ({ _type: "plannerVehicle", _key: k(), name: v.name, seats: v.seats })),
      mealPlans: d.mealPlans.map((m) => ({ _type: "plannerMeal", _key: k(), name: m.name })),
      gstPercent: d.gstPercent,
      ratesConfirmed: false,
    });
    results.push({ name: d.title, status: "set up (add rates in Studio → Trip planner)" });
  }
  return results;
}
