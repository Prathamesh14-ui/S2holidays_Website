import "server-only";
import { timingSafeEqual } from "node:crypto";
import { getWriteClient } from "@/sanity/lib/server-client";
import { serverEnv } from "@/lib/server-env";

/**
 * ONE-TIME: switch "Show price on website" ON for the 51 trips added in Nov 2026 (prices are
 * proposals shown so the owner can review them on the website). Remove after use.
 */
const NEW_TRIPS: string[] = ["kb-goa-06", "kb-pil-08", "kb-pil-09", "kb-pil-10", "kb-pil-11", "kb-pil-12", "kb-pil-13", "kb-pil-14", "kb-pil-15", "kb-pil-16", "kb-pil-17", "kb-pil-18", "kb-guj-03", "kb-guj-04", "kb-guj-05", "kb-guj-06", "kb-guj-07", "kb-guj-08", "kb-guj-09", "kb-guj-10", "kb-guj-11", "kb-guj-12", "kb-sg-03", "kb-aru-01", "kb-aru-02", "kb-aru-03", "kb-aru-04", "kb-aru-05", "kb-aru-06", "kb-aru-07", "kb-aru-08", "kb-aru-09", "kb-aru-10", "kb-lak-01", "kb-odi-01", "kb-pun-01", "kb-del-01", "kb-taj-01", "kb-up-01", "kb-ni-01", "kb-si-01", "kb-afr-01", "kb-blk-01", "kb-idn-01", "kb-mng-01", "kb-nz-01", "kb-rus-01", "kb-esp-01", "kb-ch-01", "kb-reu-01", "kb-sey-01"];

export function checkPassword(given: unknown): boolean {
  const expected = serverEnv.revalidateSecret;
  if (!expected || typeof given !== "string") return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function showNewPrices() {
  const c = getWriteClient();
  if (!c) throw new Error("SANITY_API_WRITE_TOKEN is not configured");
  const ids = NEW_TRIPS.flatMap((id) => [id, `drafts.${id}`]);
  const docs = await c.fetch<{ _id: string; title?: string; amount?: number }[]>(
    `*[_id in $ids && defined(price.amount) && price.show != true]{_id, title, "amount": price.amount}`,
    { ids }
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
