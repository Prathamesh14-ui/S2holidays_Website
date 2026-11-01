import type { Metadata } from "next";
import { siteUrl } from "./env";
import type { Seo, SiteImage } from "./types";
import { imageUrl } from "@/sanity/lib/image";

export const SITE_NAME = "S2 Holidays";

/** Build page metadata with canonical URL and Open Graph/Twitter cards. */
export function pageMetadata({
  title,
  description,
  path,
  image,
  seo,
  type = "website",
}: {
  title: string;
  description?: string;
  path: string;
  image?: SiteImage;
  seo?: Seo;
  type?: "website" | "article";
}): Metadata {
  const t = seo?.title || title;
  const d = seo?.description || description;
  const img = seo?.image || image;
  const ogUrl = img?.kind === "sanity" ? imageUrl(img, 1200, 630) : undefined;
  return {
    title: t,
    description: d,
    alternates: { canonical: path },
    robots: seo?.noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type,
      title: t,
      description: d,
      url: `${siteUrl}${path}`,
      siteName: SITE_NAME,
      locale: "en_IN",
      ...(ogUrl ? { images: [{ url: ogUrl, width: 1200, height: 630, alt: img?.alt }] } : {}),
    },
    twitter: { card: ogUrl ? "summary_large_image" : "summary", title: t, description: d },
  };
}
