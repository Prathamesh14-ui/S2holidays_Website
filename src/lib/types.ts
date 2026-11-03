import type { PortableTextBlock } from "@portabletext/react";

/**
 * Image reference used across the site. Either a Sanity image (asset ref + optional
 * hotspot) or a local sample illustration in /public/sample.
 */
export type SiteImage =
  | {
      kind: "sanity";
      asset: { _ref: string };
      hotspot?: { x: number; y: number };
      crop?: { top: number; bottom: number; left: number; right: number };
      alt: string;
    }
  | { kind: "local"; src: string; alt: string; isSample?: boolean };

export type RichText = PortableTextBlock[];

export type Seo = { title?: string; description?: string; image?: SiteImage; noIndex?: boolean };

export type Region = "domestic" | "international";

export type Destination = {
  _id: string;
  name: string;
  slug: string;
  region: Region;
  country?: string;
  state?: string;
  tagline?: string;
  summary?: string;
  overview?: RichText;
  heroImage?: SiteImage;
  gallery?: SiteImage[];
  bestTimeToVisit?: string;
  highlights?: string[];
  featured?: boolean;
  isSample?: boolean;
  seo?: Seo;
};

export type ItineraryDay = {
  day: number;
  title: string;
  description?: string;
  meals?: string[];
  overnight?: string;
};

export type Price = {
  amount?: number;
  currency?: "INR" | "USD" | "EUR" | "AED";
  basis?: string; // e.g. "per person on twin sharing"
  show?: boolean;
};

export type HolidayPackage = {
  _id: string;
  title: string;
  slug: string;
  region: Region;
  destinations: Pick<Destination, "_id" | "name" | "slug" | "region">[];
  themes?: string[];
  durationNights?: number;
  durationDays?: number;
  price?: Price;
  priceNote?: string;
  startingCity?: string;
  summary?: string;
  heroImage?: SiteImage;
  gallery?: SiteImage[];
  highlights?: string[];
  itinerary?: ItineraryDay[];
  inclusions?: string[];
  exclusions?: string[];
  importantNotes?: RichText;
  featuredOnHomepage?: boolean;
  homepageOrder?: number;
  isSample?: boolean;
  seo?: Seo;
};

export type ServiceOffering = { title: string; description?: string; image?: SiteImage };

export type Vehicle = {
  name: string;
  seats?: number;
  airConditioned?: boolean;
  description?: string;
  image?: SiteImage;
};

export type ServiceKey = "mumbai-sightseeing" | "car-rental" | "tourist-guide";

export type Service = {
  _id: string;
  key: ServiceKey;
  title: string;
  slug: string;
  tagline?: string;
  intro?: string;
  heroImage?: SiteImage;
  body?: RichText;
  offerings?: ServiceOffering[];
  vehicles?: Vehicle[];
  faqs?: Faq[];
  isSample?: boolean;
  seo?: Seo;
};

export type Testimonial = {
  _id: string;
  name: string;
  location?: string;
  quote: string;
  rating?: number;
  tripName?: string;
  isSample?: boolean;
};

export type Post = {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  coverImage?: SiteImage;
  author?: string;
  publishedAt: string;
  categories?: string[];
  body?: RichText;
  isSample?: boolean;
  seo?: Seo;
};

export type Faq = { _id?: string; question: string; answer: string; category?: string };

export type LegalPage = {
  _id: string;
  title: string;
  slug: string;
  body?: RichText;
  updatedAt?: string;
  isSample?: boolean;
};

export type SiteSettings = {
  companyName: string;
  legalName?: string;
  tagline?: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  address?: string;
  mapUrl?: string;
  officeHours?: string;
  socials?: { label: string; url: string }[];
  logo?: SiteImage;
  heroHeading?: string;
  heroSubheading?: string;
  heroImage?: SiteImage;
  heroSlides?: HeroSlide[];
  aboutTitle?: string;
  aboutBody?: RichText;
  aboutImage?: SiteImage;
  values?: { title: string; description?: string }[];
  isSample?: boolean;
};

export type HeroSlide = { image: SiteImage; caption?: string; href?: string };
