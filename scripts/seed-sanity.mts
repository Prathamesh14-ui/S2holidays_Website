/**
 * OPTIONAL: copy the bundled SAMPLE content into a Sanity dataset so editors can see
 * a worked example of every content type. Every seeded item is still labelled as
 * sample text and MUST be replaced or deleted before launch.
 *
 *   NEXT_PUBLIC_SANITY_PROJECT_ID=xxx SANITY_API_WRITE_TOKEN=yyy \
 *     node scripts/seed-sanity.mts --confirm
 *
 * Requires Node 22.18+ (built-in TypeScript type stripping).
 * Safe to re-run: documents use fixed IDs and are replaced.
 */
import { createClient } from "@sanity/client";
import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  sampleDestinations,
  sampleFaqs,
  sampleLegal,
  samplePackages,
  samplePosts,
  sampleServices,
  sampleSettings,
} from "../src/data/sample.ts";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId || !token) {
  console.error("Set NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN first.");
  process.exit(1);
}
if (!process.argv.includes("--confirm")) {
  console.error(`This will write SAMPLE content into ${projectId}/${dataset}. Re-run with --confirm.`);
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2025-10-01", useCdn: false });
const root = path.resolve(import.meta.dirname, "..");
const assetCache = new Map<string, string>();
let k = 0;
const key = () => `k${(++k).toString(36)}`;

type LocalImage = { kind: string; src?: string; alt: string } | undefined;

async function image(img: LocalImage) {
  if (!img || img.kind !== "local" || !img.src) return undefined;
  let ref = assetCache.get(img.src);
  if (!ref) {
    const file = await readFile(path.join(root, "public", img.src));
    const asset = await client.assets.upload("image", file, { filename: path.basename(img.src), contentType: "image/svg+xml" });
    ref = asset._id;
    assetCache.set(img.src, ref);
  }
  return { _type: "image", asset: { _type: "reference", _ref: ref }, alt: img.alt };
}

const strings = (xs?: string[]) => xs?.filter(Boolean);
const withKeys = <T extends object>(xs?: T[]) => xs?.map((x) => ({ _key: key(), ...x }));

async function main() {
  const tx = client.transaction();

  tx.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    companyName: sampleSettings.companyName,
    tagline: sampleSettings.tagline,
    description: sampleSettings.description,
    heroHeading: sampleSettings.heroHeading,
    heroSubheading: sampleSettings.heroSubheading,
    heroImage: await image(sampleSettings.heroImage),
    aboutTitle: sampleSettings.aboutTitle,
    aboutBody: sampleSettings.aboutBody,
    aboutImage: await image(sampleSettings.aboutImage),
    values: withKeys(sampleSettings.values),
  });

  for (const d of sampleDestinations) {
    tx.createOrReplace({
      _id: `destination-${d.slug}`,
      _type: "destination",
      name: d.name,
      slug: { _type: "slug", current: d.slug },
      region: d.region,
      state: d.state,
      country: d.country,
      tagline: d.tagline,
      summary: d.summary,
      overview: d.overview,
      bestTimeToVisit: d.bestTimeToVisit,
      highlights: strings(d.highlights),
      featured: d.featured ?? false,
      heroImage: await image(d.heroImage),
    });
  }

  for (const p of samplePackages) {
    tx.createOrReplace({
      _id: `package-${p.slug}`,
      _type: "holidayPackage",
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      region: p.region,
      destinations: p.destinations.map((d) => ({ _type: "reference", _key: key(), _ref: `destination-${d.slug}` })),
      themes: strings(p.themes),
      durationNights: p.durationNights,
      durationDays: p.durationDays,
      startingCity: p.startingCity,
      summary: p.summary,
      highlights: strings(p.highlights),
      priceNote: p.priceNote,
      itinerary: p.itinerary?.map((day) => ({ _type: "itineraryDay", _key: key(), ...day })),
      inclusions: strings(p.inclusions),
      exclusions: strings(p.exclusions),
      importantNotes: p.importantNotes,
      heroImage: await image(p.heroImage),
      featuredOnHomepage: p.featuredOnHomepage ?? false,
      homepageOrder: p.homepageOrder,
    });
  }

  for (const s of sampleServices) {
    tx.createOrReplace({
      _id: `service-${s.key}`,
      _type: "service",
      key: s.key,
      title: s.title,
      slug: { _type: "slug", current: s.slug },
      tagline: s.tagline,
      intro: s.intro,
      heroImage: await image(s.heroImage),
      offerings: withKeys(s.offerings?.map(({ title, description }) => ({ title, description }))),
      vehicles: withKeys(s.vehicles?.map(({ name, seats, airConditioned, description }) => ({ name, seats, airConditioned, description }))),
      faqs: withKeys(s.faqs?.map(({ question, answer }) => ({ question, answer }))),
    });
  }

  for (const p of samplePosts) {
    tx.createOrReplace({
      _id: `post-${p.slug}`,
      _type: "post",
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      excerpt: p.excerpt,
      author: p.author,
      publishedAt: new Date(p.publishedAt).toISOString(),
      categories: strings(p.categories),
      coverImage: await image(p.coverImage),
      body: p.body,
    });
  }

  sampleFaqs.forEach((f, i) =>
    tx.createOrReplace({ _id: `faq-${i + 1}`, _type: "faq", question: f.question, answer: f.answer, category: f.category, order: i + 1 })
  );

  for (const l of sampleLegal) {
    tx.createOrReplace({ _id: `legal-${l.slug}`, _type: "legalPage", title: l.title, slug: { _type: "slug", current: l.slug }, body: l.body });
  }

  const res = await tx.commit();
  console.log(`Seeded ${res.results.length} documents and ${assetCache.size} images into ${projectId}/${dataset}.`);
  console.log("Reminder: all seeded content is SAMPLE content — replace it before launch.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
