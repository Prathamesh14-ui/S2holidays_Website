import "server-only";
import { randomUUID, timingSafeEqual } from "node:crypto";
import data from "@/data/old-site-export.json";
import { getWriteClient } from "@/sanity/lib/server-client";
import { serverEnv } from "@/lib/server-env";

/**
 * ONE-TIME FIX for imported packages: the first import cut the old site's "Tour information"
 * tab short, leaving a fragment of raw HTML in "Important notes" and losing the end of the
 * cancellation terms. This re-applies the corrected text ONLY where the broken fragment is
 * still present, and fills inclusions/exclusions ONLY where they are still empty.
 * Editor changes are never overwritten. Remove after use.
 */
export function checkPassword(given: unknown): boolean {
  const expected = serverEnv.revalidateSecret;
  if (!expected || typeof given !== "string") return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const block = (text: string, style = "normal") => ({
  _type: "block", _key: key(), style, markDefs: [], children: [{ _type: "span", _key: key(), text, marks: [] }],
});
type Block = { children?: { text?: string }[] };
const BROKEN = /<(div|span|ul|li|p|strong)\b|style="/i;
const isBroken = (blocks: unknown) =>
  Array.isArray(blocks) && (blocks as Block[]).some((b) => b.children?.some((c) => BROKEN.test(c.text || "")));
const empty = (v: unknown) => !Array.isArray(v) || v.length === 0;

export async function fixImported() {
  const c = getWriteClient();
  if (!c) throw new Error("SANITY_API_WRITE_TOKEN is not configured in Vercel");
  const ids = data.packages.flatMap((p) => [`package-${p.slug}`, `drafts.package-${p.slug}`]);
  const docs = await c.fetch<{ _id: string; title?: string; importantNotes?: unknown; inclusions?: unknown; exclusions?: unknown }[]>(
    `*[_id in $ids]{_id, title, importantNotes, inclusions, exclusions}`,
    { ids }
  );
  const results: { name: string; status: string }[] = [];
  for (const d of docs) {
    const slug = d._id.replace(/^drafts\./, "").replace(/^package-/, "");
    const src = data.packages.find((p) => p.slug === slug);
    if (!src) continue;
    const set: Record<string, unknown> = {};
    if (isBroken(d.importantNotes)) set.importantNotes = src.notes.flatMap((n) => [block(n.heading, "h3"), ...n.lines.map((l) => block(l))]);
    if (empty(d.inclusions) && src.inclusions.length) set.inclusions = src.inclusions;
    if (empty(d.exclusions) && src.exclusions.length) set.exclusions = src.exclusions;
    const label = `${d.title ?? slug}${d._id.startsWith("drafts.") ? " (draft)" : ""}`;
    if (!Object.keys(set).length) { results.push({ name: label, status: "already fine" }); continue; }
    try {
      await c.patch(d._id).set(set).commit();
      results.push({ name: label, status: `fixed: ${Object.keys(set).join(", ")}` });
    } catch (e) {
      results.push({ name: label, status: `error: ${(e as Error).message.slice(0, 140)}` });
    }
  }
  return results;
}
