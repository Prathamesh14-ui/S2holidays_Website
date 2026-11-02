import "server-only";
import { timingSafeEqual } from "node:crypto";
import { getWriteClient } from "@/sanity/lib/server-client";
import { serverEnv } from "@/lib/server-env";

/**
 * ONE-TIME: publish every draft created by the old-website import
 * (IDs "drafts.destination-*" and "drafts.package-*"). Remove after use.
 */
export function checkPassword(given: unknown): boolean {
  const expected = serverEnv.revalidateSecret;
  if (!expected || typeof given !== "string") return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

type Doc = { _id: string; _type: string; [k: string]: unknown };
type Ref = { _ref: string; _weak?: boolean; _strengthenOnPublish?: unknown; [k: string]: unknown };

function toPublished(d: Doc): Doc {
  const { _rev, _createdAt, _updatedAt, ...rest } = d as Doc & { _rev?: string; _createdAt?: string; _updatedAt?: string };
  void _rev; void _createdAt; void _updatedAt;
  return { ...rest, _id: d._id.replace(/^drafts\./, "") };
}

export async function publishImported() {
  const c = getWriteClient();
  if (!c) throw new Error("SANITY_API_WRITE_TOKEN is not configured in Vercel");
  const results: { name: string; status: string }[] = [];

  // 1) destinations first, so packages can reference them strongly
  const dests = await c.fetch<Doc[]>(`*[_id match "drafts.destination-*" && _type == "destination"]`);
  for (const d of dests) {
    const name = String(d.name ?? d._id);
    if (!d.heroImage) { results.push({ name, status: "skipped: no main image" }); continue; }
    try {
      await c.transaction().createOrReplace(toPublished(d)).delete(d._id).commit();
      results.push({ name: `Destination: ${name}`, status: "published" });
    } catch (e) {
      results.push({ name: `Destination: ${name}`, status: `error: ${(e as Error).message.slice(0, 140)}` });
    }
  }

  // 2) packages
  const pkgs = await c.fetch<Doc[]>(`*[_id match "drafts.package-*" && _type == "holidayPackage"]`);
  const refIds = [...new Set(pkgs.flatMap((p) => ((p.destinations as Ref[]) ?? []).map((r) => r._ref)))];
  const publishedIds = new Set(await c.fetch<string[]>(`*[_id in $ids]._id`, { ids: refIds }));
  for (const p of pkgs) {
    const name = String(p.title ?? p._id);
    if (!p.heroImage) { results.push({ name, status: "skipped: no main image" }); continue; }
    const destinations = ((p.destinations as Ref[]) ?? []).map((r) => {
      if (!publishedIds.has(r._ref)) return r; // target not published yet: keep weak
      const { _weak, _strengthenOnPublish, ...strong } = r;
      void _weak; void _strengthenOnPublish;
      return strong;
    });
    try {
      await c.transaction().createOrReplace(toPublished({ ...p, destinations })).delete(p._id).commit();
      results.push({ name, status: "published" });
    } catch (e) {
      results.push({ name, status: `error: ${(e as Error).message.slice(0, 140)}` });
    }
  }
  return results;
}
