/**
 * Content access layer. Every page reads data through these functions.
 *
 * - If a Sanity project is configured, content comes from the CMS.
 * - Otherwise the clearly-labelled sample content in src/data/sample.ts is used,
 *   so the site can be developed and reviewed before CMS credentials exist.
 *
 * Results are cached with 'use cache' and tagged "sanity"; the Sanity webhook
 * (/api/revalidate) expires the tag whenever an editor publishes a change.
 */
import { cacheLife, cacheTag } from "next/cache";
import { isSanityConfigured, envWhatsapp } from "./env";
import type {
  Destination,
  Faq,
  HolidayPackage,
  LegalPage,
  Post,
  Region,
  Service,
  ServiceKey,
  SiteSettings,
  Testimonial,
} from "./types";
import * as sample from "@/data/sample";
import { getReadClient } from "@/sanity/lib/server-client";
import * as q from "@/sanity/lib/queries";

async function fetchSanity<T>(query: string, params: Record<string, unknown> = {}): Promise<T> {
  "use cache";
  cacheLife("hours");
  cacheTag("sanity");
  const c = getReadClient();
  if (!c) throw new Error("Sanity client not configured");
  return c.fetch<T>(query, params);
}

export const usingSampleContent = !isSanityConfigured;

export async function getSettings(): Promise<SiteSettings> {
  if (!isSanityConfigured) {
    return { ...sample.sampleSettings, whatsapp: envWhatsapp || undefined };
  }
  const s = await fetchSanity<Partial<SiteSettings> | null>(q.settingsQuery);
  return {
    ...s,
    companyName: s?.companyName || "S2 Holidays",
    whatsapp: (s?.whatsapp || envWhatsapp || "").replace(/\D/g, "") || undefined,
  } as SiteSettings;
}

export async function getDestinations(region?: Region): Promise<Destination[]> {
  const all = isSanityConfigured
    ? await fetchSanity<Destination[]>(q.destinationsQuery)
    : sample.sampleDestinations;
  return region ? all.filter((d) => d.region === region) : all;
}

export async function getDestination(slug: string): Promise<Destination | null> {
  if (!isSanityConfigured) return sample.sampleDestinations.find((d) => d.slug === slug) ?? null;
  return fetchSanity<Destination | null>(q.destinationBySlugQuery, { slug });
}

export async function getPackages(filter?: { region?: Region; destinationSlug?: string }): Promise<HolidayPackage[]> {
  let all = isSanityConfigured ? await fetchSanity<HolidayPackage[]>(q.packagesQuery) : sample.samplePackages;
  all = all.map((p) => ({ ...p, destinations: p.destinations ?? [] }));
  if (filter?.region) all = all.filter((p) => p.region === filter.region);
  if (filter?.destinationSlug) all = all.filter((p) => p.destinations.some((d) => d.slug === filter.destinationSlug));
  return all;
}

export async function getFeaturedPackages(limit = 6): Promise<HolidayPackage[]> {
  const all = await getPackages();
  const featured = all
    .filter((p) => p.featuredOnHomepage)
    .sort((a, b) => (a.homepageOrder ?? 999) - (b.homepageOrder ?? 999));
  return (featured.length ? featured : all).slice(0, limit);
}

export async function getPackage(slug: string): Promise<HolidayPackage | null> {
  if (!isSanityConfigured) return sample.samplePackages.find((p) => p.slug === slug) ?? null;
  const p = await fetchSanity<HolidayPackage | null>(q.packageBySlugQuery, { slug });
  return p ? { ...p, destinations: p.destinations ?? [] } : null;
}

export async function getService(key: ServiceKey): Promise<Service | null> {
  const all = isSanityConfigured ? await fetchSanity<Service[]>(q.servicesQuery) : sample.sampleServices;
  return all.find((s) => s.key === key) ?? null;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return isSanityConfigured ? fetchSanity<Testimonial[]>(q.testimonialsQuery) : sample.sampleTestimonials;
}

export async function getPosts(): Promise<Post[]> {
  return isSanityConfigured ? fetchSanity<Post[]>(q.postsQuery) : sample.samplePosts;
}

export async function getPost(slug: string): Promise<Post | null> {
  if (!isSanityConfigured) return sample.samplePosts.find((p) => p.slug === slug) ?? null;
  return fetchSanity<Post | null>(q.postBySlugQuery, { slug });
}

export async function getFaqs(): Promise<Faq[]> {
  return isSanityConfigured ? fetchSanity<Faq[]>(q.faqsQuery) : sample.sampleFaqs;
}

export async function getLegalPage(slug: "privacy-policy" | "terms"): Promise<LegalPage | null> {
  if (!isSanityConfigured) return sample.sampleLegal.find((p) => p.slug === slug) ?? null;
  return fetchSanity<LegalPage | null>(q.legalPageQuery, { slug });
}
