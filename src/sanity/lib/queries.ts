import { defineQuery } from "next-sanity";

/** Shared GROQ projection that turns a Sanity image field into our SiteImage shape. */
const IMG = `{"kind": "sanity", asset, hotspot, crop, "alt": coalesce(alt, ""), credit, creditUrl}`;
const SEO = `seo{title, description, noIndex, "image": image${IMG}}`;

const DEST_FIELDS = `_id, name, "slug": slug.current, region, country, state, tagline, summary, overview,
  "heroImage": heroImage${IMG}, "gallery": gallery[]${IMG}, bestTimeToVisit, highlights, featured, ${SEO}`;

const PKG_FIELDS = `_id, title, "slug": slug.current,
  "region": coalesce(region, destinations[0]->region),
  "destinations": destinations[]->{_id, name, "slug": slug.current, region},
  themes, durationNights, durationDays, price, priceNote, startingCity, summary,
  "heroImage": heroImage${IMG}, "gallery": gallery[]${IMG}, highlights,
  itinerary[]{day, title, description, meals, overnight}, inclusions, exclusions, importantNotes,
  featuredOnHomepage, homepageOrder, offer{active, title, offerPrice, badge, details, validUntil, showOnHomepage}, ${SEO}`;

const POST_FIELDS = `_id, title, "slug": slug.current, excerpt, "coverImage": coverImage${IMG}, author, publishedAt, categories, ${SEO}`;

export const settingsQuery = defineQuery(`*[_type == "siteSettings"][0]{
  companyName, legalName, tagline, description, phone, whatsapp, email, address, mapUrl, officeHours, socials,
  "logo": logo${IMG}, heroHeading, heroSubheading, "heroImage": heroImage${IMG},
  "heroSlides": heroSlides[defined(image.asset)]{"image": image${IMG}, caption, "href": select(defined(destination->slug.current) => "/destinations/" + destination->slug.current)},
  "packagesHeroSlides": packagesHeroSlides[defined(image.asset)]{"image": image${IMG}, caption, "href": select(defined(destination->slug.current) => "/destinations/" + destination->slug.current)},
  announcement{active, text, link, validUntil}, "homepageSections": homepageSections[].section, aboutTitle, aboutBody, "aboutImage": aboutImage${IMG}, values
}`);

export const destinationsQuery = defineQuery(`*[_type == "destination" && defined(slug.current)] | order(featured desc, name asc){${DEST_FIELDS}}`);
export const destinationBySlugQuery = defineQuery(`*[_type == "destination" && slug.current == $slug][0]{${DEST_FIELDS}}`);

export const packagesQuery = defineQuery(`*[_type == "holidayPackage" && defined(slug.current)] | order(coalesce(homepageOrder, 999) asc, title asc){${PKG_FIELDS}}`);
export const packageBySlugQuery = defineQuery(`*[_type == "holidayPackage" && slug.current == $slug][0]{${PKG_FIELDS}}`);

export const servicesQuery = defineQuery(`*[_type == "service" && defined(key)]{
  _id, key, title, "slug": slug.current, tagline, intro, "heroImage": heroImage${IMG}, body,
  offerings[]{title, description, "image": image${IMG}},
  vehicles[]{name, seats, airConditioned, description, "image": image${IMG}},
  faqs[]{question, answer}, ${SEO}
}`);

export const testimonialsQuery = defineQuery(`*[_type == "testimonial" && consentConfirmed == true] | order(_createdAt desc){
  _id, name, location, quote, rating, tripName
}`);

export const postsQuery = defineQuery(`*[_type == "post" && defined(slug.current) && publishedAt <= now()] | order(publishedAt desc){${POST_FIELDS}}`);
export const postBySlugQuery = defineQuery(`*[_type == "post" && slug.current == $slug && publishedAt <= now()][0]{${POST_FIELDS}, body}`);

export const faqsQuery = defineQuery(`*[_type == "faq"] | order(coalesce(order, 999) asc){_id, question, answer, category}`);

export const legalPageQuery = defineQuery(`*[_type == "legalPage" && slug.current == $slug][0]{_id, title, "slug": slug.current, body, "updatedAt": _updatedAt}`);

export const plannerQuery = defineQuery(`*[_type == "plannerDestination" && active != false] | order(coalesce(order, 99) asc, title asc){
  "slug": slug.current, title, intro, "destinationSlug": destination->slug.current, startPoint, endPoint,
  "places": places[]{"key": key.current, name, description, defaultNights, sightseeing[]{name, extraPerPerson}, hotelRates},
  "vehicles": coalesce(vehicles[]{name, seats, ratePerDay}, []), "mealPlans": coalesce(mealPlans[]{name, ratePerPersonPerNight}, []),
  seasons[]{name, from, to, percent}, gstPercent, advancePercent, ratesConfirmed,
  estimate{active, basePerPerson, perNightPerPerson, childPercent, basedOn}
}`);

/** Every main photo that carries a credit (for the Photo credits page). */
export const photoCreditsQuery = defineQuery(`*[_type in ["holidayPackage", "destination"] && defined(heroImage.credit)] | order(_type desc, coalesce(title, name) asc){
  _type, "name": coalesce(title, name), "slug": slug.current, "credit": heroImage.credit, "creditUrl": heroImage.creditUrl
}`);
