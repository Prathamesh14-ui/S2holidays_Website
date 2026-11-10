import "server-only";
import { timingSafeEqual } from "node:crypto";
import { getWriteClient } from "@/sanity/lib/server-client";
import { serverEnv } from "@/lib/server-env";
import newTrips from "@/data/new-trips-import.json";

/** The 32 trips added in Nov 2026 have PROPOSED prices – never switch those on from here. */
const NOT_APPROVED = newTrips.packages.flatMap((p) => [`kb-${p.kbId.toLowerCase()}`, `drafts.kb-${p.kbId.toLowerCase()}`]);

/**
 * ONE-TIME: the owner approved the knowledge-base prices, so switch "Show price on website" ON
 * for every imported package (published "kb-*" and any "drafts.kb-*") that has a price amount.
 * Remove after use.
 */
export function checkPassword(given: unknown): boolean {
  const expected = serverEnv.revalidateSecret;
  if (!expected || typeof given !== "string") return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function showAllPrices() {
  const c = getWriteClient();
  if (!c) throw new Error("SANITY_API_WRITE_TOKEN is not configured");
  const docs = await c.fetch<{ _id: string; title?: string; amount?: number }[]>(
    `*[_type == "holidayPackage" && (string::startsWith(_id, "kb-") || string::startsWith(_id, "drafts.kb-"))
      && defined(price.amount) && price.show != true && !(_id in $skip)]{_id, title, "amount": price.amount}`,
    { skip: NOT_APPROVED }
  );
  const results: { name: string; status: string }[] = [];
  for (let i = 0; i < docs.length; i += 25) {
    const tx = c.transaction();
    for (const d of docs.slice(i, i + 25)) tx.patch(d._id, (p) => p.set({ "price.show": true }));
    await tx.commit();
    for (const d of docs.slice(i, i + 25)) {
      results.push({ name: `${d.title ?? d._id}${d._id.startsWith("drafts.") ? " (draft)" : ""}`, status: `price shown (₹${(d.amount ?? 0).toLocaleString("en-IN")})` });
    }
  }
  return results;
}
