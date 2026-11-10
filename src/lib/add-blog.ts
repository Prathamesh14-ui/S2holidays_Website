import "server-only";
import { randomUUID, timingSafeEqual } from "node:crypto";
import posts from "@/data/blog-import.json";
import { getWriteClient } from "@/sanity/lib/server-client";
import { serverEnv } from "@/lib/server-env";

/**
 * ONE-TIME: adds 8 original travel-guide blog posts. Each post's cover photo is the photo of the
 * destination it is about (with the same photo credit). If that destination has no photo yet, the
 * post is saved as a draft so a cover can be added in Studio. Safe to re-run. Remove after use.
 */
type Line = [string, string] | [string, string, string];
type Post = { slug: string; dest: string; date: string; title: string; excerpt: string; categories: string[]; body: Line[] };

export function checkPassword(given: unknown): boolean {
  const expected = serverEnv.revalidateSecret;
  if (!expected || typeof given !== "string") return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);
const span = (text: string, marks: string[] = []) => ({ _type: "span", _key: key(), text, marks });

function toBlocks(lines: Line[]) {
  return lines.map(([kind, text, href]) => {
    if (kind === "link") {
      const mark = key();
      return { _type: "block", _key: key(), style: "normal", markDefs: [{ _type: "link", _key: mark, href }], children: [span(`${text} →`, [mark])] };
    }
    if (kind === "li") return { _type: "block", _key: key(), style: "normal", listItem: "bullet", level: 1, markDefs: [], children: [span(text)] };
    return { _type: "block", _key: key(), style: kind === "h2" ? "h2" : "normal", markDefs: [], children: [span(text)] };
  });
}

export async function addBlog() {
  const c = getWriteClient();
  if (!c) throw new Error("SANITY_API_WRITE_TOKEN is not configured");
  const results: { name: string; status: string }[] = [];
  for (const p of posts as Post[]) {
    const id = `post-${p.slug}`;
    const exists = await c.fetch<number>(`count(*[_id in [$id, $draft] || (_type == "post" && slug.current == $slug)])`, { id, draft: `drafts.${id}`, slug: p.slug });
    if (exists > 0) {
      results.push({ name: p.title, status: "already exists" });
      continue;
    }
    const img = await c.fetch<{ asset?: { _ref: string }; alt?: string; credit?: string; creditUrl?: string } | null>(
      `*[_type == "destination" && slug.current == $slug && !(_id in path("drafts.**"))][0].heroImage`,
      { slug: p.dest }
    );
    const coverImage = img?.asset?._ref
      ? { _type: "image", asset: { _type: "reference", _ref: img.asset._ref }, alt: img.alt || p.title, credit: img.credit || undefined, creditUrl: img.creditUrl || undefined }
      : undefined;
    const doc = {
      _id: coverImage ? id : `drafts.${id}`,
      _type: "post",
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      publishedAt: `${p.date}T09:00:00.000Z`,
      author: "S2 Holidays team",
      excerpt: p.excerpt,
      coverImage,
      categories: p.categories,
      body: toBlocks(p.body),
    };
    await c.createIfNotExists(doc);
    results.push({ name: p.title, status: coverImage ? "published" : "saved as draft – add a cover photo in Studio, then Publish" });
  }
  return results;
}
