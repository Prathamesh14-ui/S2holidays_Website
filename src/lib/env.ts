/**
 * Public (browser-safe) environment configuration. Server-only secrets live in
 * `src/lib/server-env.ts` which imports "server-only" so they can never be bundled
 * into client code.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export const sanityProjectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "";
export const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const sanityApiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-10-01";

/** True when a Sanity project is configured; otherwise sample content is served. */
export const isSanityConfigured = /^[a-z0-9]+$/.test(sanityProjectId);

/** Digits-only WhatsApp number from env; CMS settings may override it. */
export const envWhatsapp = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/\D/g, "");

export const hideSampleBanner = process.env.NEXT_PUBLIC_HIDE_SAMPLE_BANNER === "true";
