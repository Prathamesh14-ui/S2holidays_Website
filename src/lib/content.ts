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
import { isOfferActive, offerEndsAt } from "./offers";
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
import { plannerDefaults } from "@/data/planner-defaults";
import type { PlannerDestination } from "./planner/types";
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

/**
 * "Now" for offer/announcement expiry. Cached together with the content (refreshed at
 * least hourly and whenever an editor publishes), so expired offers disappear within ~1 hour.
 */
async function cachedNow(): Promise<number> {
  "use cache";
  cacheLife("hours");
  cacheTag("sanity");
  return Date.now();
}

function normalizePackage(p: HolidayPackage, now: number): HolidayPackage {
  return {
    ...p,
    destinations: (p.destinations ?? []).filter(Boolean),
    offer: isOfferActive(p.offer, now) ? p.offer : undefined,
  };
}

export async function getSettings(): Promise<SiteSettings> {
  if (!isSanityConfigured) {
    return { ...sample.sampleSettings, whatsapp: envWhatsapp || undefined };
  }
  const [s, now] = await Promise.all([fetchSanity<Partial<SiteSettings> | null>(q.settingsQuery), cachedNow()]);
  const a = s?.announcement;
  const end = offerEndsAt(a?.validUntil);
  return {
    ...s,
    announcement: a && a.active !== false && a.text?.trim() && (end === null || now <= end) ? a : undefined,
    companyName: s?.companyName || "S2 Holidays",
    whatsapp: (s?.whatsapp || envWhatsapp || "").replace(/\D/g, "") || undefined,
  } as SiteSettings;
}

export async function getDestinations(region?: Region): Promise<Destination[]> {
  const all = isSanityConfigured
    ? ((await fetchSanity<Destination[] | null>(q.destinationsQuery)) ?? [])
    : sample.sampleDestinations;
  return region ? all.filter((d) => d.region === region) : all;
}

export async function getDestination(slug: string): Promise<Destination | null> {
  if (!isSanityConfigured) return sample.sampleDestinations.find((d) => d.slug === slug) ?? null;
  return fetchSanity<Destination | null>(q.destinationBySlugQuery, { slug });
}

export async function getPackages(filter?: { region?: Region; destinationSlug?: string }): Promise<HolidayPackage[]> {
  const [raw, now] = await Promise.all([
    isSanityConfigured ? fetchSanity<HolidayPackage[] | null>(q.packagesQuery) : Promise.resolve(sample.samplePackages),
    cachedNow(),
  ]);
  let all = (raw ?? []).map((p) => normalizePackage(p, now));
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

/** Packages with a live offer, soonest-ending first (for the homepage "Special offers"). */
export async function getOfferPackages(limit = 6): Promise<HolidayPackage[]> {
  const all = await getPackages();
  const end = (p: HolidayPackage) => offerEndsAt(p.offer?.validUntil) ?? Number.MAX_SAFE_INTEGER;
  return all
    .filter((p) => p.offer && p.offer.showOnHomepage !== false)
    .sort((a, b) => end(a) - end(b))
    .slice(0, limit);
}

export async function getPackage(slug: string): Promise<HolidayPackage | null> {
  if (!isSanityConfigured) return sample.samplePackages.find((p) => p.slug === slug) ?? null;
  const [p, now] = await Promise.all([fetchSanity<HolidayPackage | null>(q.packageBySlugQuery, { slug }), cachedNow()]);
  return p ? normalizePackage(p, now) : null;
}

const SERVICE_TITLES: Record<ServiceKey, { title: string; tagline: string }> = {
  "mumbai-sightseeing": { title: "Mumbai Sightseeing", tagline: "City tours in and around Mumbai" },
  "car-rental": { title: "Car Rental", tagline: "Chauffeur-driven cars for transfers, local and outstation travel" },
  "tourist-guide": { title: "Tourist Guide Services", tagline: "Local guides for sightseeing" },
};

export async function getService(key: ServiceKey): Promise<Service> {
  const all = isSanityConfigured ? ((await fetchSanity<Service[] | null>(q.servicesQuery)) ?? []) : sample.sampleServices;
  // Until the service page is created in the CMS, show a minimal page (title + enquiry form)
  // so navigation links never 404. No details are invented.
  return all.find((s) => s.key === key) ?? { _id: `service-${key}`, key, slug: key, ...SERVICE_TITLES[key] };
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return isSanityConfigured ? ((await fetchSanity<Testimonial[] | null>(q.testimonialsQuery)) ?? []) : sample.sampleTestimonials;
}

export async function getPosts(): Promise<Post[]> {
  return isSanityConfigured ? ((await fetchSanity<Post[] | null>(q.postsQuery)) ?? []) : sample.samplePosts;
}

export async function getPost(slug: string): Promise<Post | null> {
  if (!isSanityConfigured) return sample.samplePosts.find((p) => p.slug === slug) ?? null;
  return fetchSanity<Post | null>(q.postBySlugQuery, { slug });
}

export async function getFaqs(): Promise<Faq[]> {
  return isSanityConfigured ? ((await fetchSanity<Faq[] | null>(q.faqsQuery)) ?? []) : sample.sampleFaqs;
}

export async function getLegalPage(slug: "privacy-policy" | "terms"): Promise<LegalPage | null> {
  if (!isSanityConfigured) return sample.sampleLegal.find((p) => p.slug === slug) ?? null;
  return fetchSanity<LegalPage | null>(q.legalPageQuery, { slug });
}

/** Trip planner destinations from the CMS; falls back to the built-in starter data (no rates). */
export async function getPlannerDestinations(): Promise<PlannerDestination[]> {
  if (!isSanityConfigured) return plannerDefaults;
  const list = (await fetchSanity<PlannerDestination[] | null>(q.plannerQuery)) ?? [];
  const valid = list.filter((d) => d.slug && d.places?.length);
  return valid.length ? valid.map((d) => ({ ...d, places: d.places.filter((p) => p.key && p.name) })) : plannerDefaults;
}
