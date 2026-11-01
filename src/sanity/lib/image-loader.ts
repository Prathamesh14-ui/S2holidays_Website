"use client";

/**
 * next/image loader. Sanity images are resized and format-converted by Sanity's
 * own image CDN (no double processing / no Vercel optimisation quota used).
 * Local files in /public are served as-is.
 */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (src.startsWith("https://cdn.sanity.io/")) {
    const url = new URL(src);
    const w = Number(url.searchParams.get("w"));
    const h = Number(url.searchParams.get("h"));
    if (w && h) url.searchParams.set("h", String(Math.round((h * width) / w))); // keep crop aspect ratio
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality || 75));
    url.searchParams.set("auto", "format");
    if (!url.searchParams.has("fit")) url.searchParams.set("fit", "max");
    return url.toString();
  }
  return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
}
