import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { getDestinations, getPackages, getPosts } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [destinations, packages, posts] = await Promise.all([getDestinations(), getPackages(), getPosts()]);
  const staticPaths = [
    ["", 1],
    ["/packages", 0.9],
    ["/plan-my-trip", 0.8],
    ["/destinations", 0.8],
    ["/destinations/domestic", 0.8],
    ["/destinations/international", 0.8],
    ["/services", 0.7],
    ["/services/mumbai-sightseeing", 0.8],
    ["/services/car-rental", 0.8],
    ["/services/tourist-guide", 0.7],
    ["/about", 0.5],
    ["/contact", 0.6],
    ["/blog", 0.6],
    ["/faq", 0.4],
    ["/privacy-policy", 0.2],
    ["/terms", 0.2],
  ] as const;
  return [
    ...staticPaths.map(([path, priority]) => ({ url: `${siteUrl}${path}`, priority })),
    ...destinations.map((d) => ({ url: `${siteUrl}/destinations/${d.slug}`, priority: 0.8 })),
    ...packages.map((p) => ({ url: `${siteUrl}/packages/${p.slug}`, priority: 0.9 })),
    ...posts.map((p) => ({ url: `${siteUrl}/blog/${p.slug}`, lastModified: p.publishedAt, priority: 0.5 })),
  ];
}
