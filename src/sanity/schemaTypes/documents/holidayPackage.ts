import { defineArrayMember, defineField, defineType } from "sanity";
import { PackageIcon } from "@sanity/icons/Package";
import { galleryField, imageField, richTextField, seoField } from "../helpers";

export const holidayPackage = defineType({
  name: "holidayPackage",
  title: "Holiday package",
  type: "document",
  icon: PackageIcon,
  groups: [
    { name: "content", title: "Overview", default: true },
    { name: "pricing", title: "Price" },
    { name: "offer", title: "Offer" },
    { name: "itinerary", title: "Itinerary" },
    { name: "details", title: "Inclusions" },
    { name: "media", title: "Images" },
    { name: "homepage", title: "Homepage" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "title", title: "Package name", type: "string", group: "content", validation: (r) => r.required().max(100) }),
    defineField({ name: "slug", title: "URL slug", type: "slug", group: "content", options: { source: "title", maxLength: 96 }, validation: (r) => r.required() }),
    defineField({
      name: "destinations",
      title: "Destinations",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "reference", to: [{ type: "destination" }] })],
      validation: (r) => r.required().min(1).unique(),
    }),
    defineField({
      name: "region",
      title: "Region",
      type: "string",
      group: "content",
      description: "Defaults to the first destination's region if left empty.",
      options: { list: [{ title: "Domestic (India)", value: "domestic" }, { title: "International", value: "international" }], layout: "radio" },
    }),
    defineField({
      name: "themes",
      title: "Holiday types",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "string" })],
      options: { list: ["Family", "Honeymoon", "Couples", "Friends", "Group tour", "Adventure", "Beach", "Heritage", "Nature", "Pilgrimage", "Weekend getaway", "Budget", "City tour", "Shopping", "Luxury", "Wildlife"] },
    }),
    defineField({ name: "durationNights", title: "Nights", type: "number", group: "content", validation: (r) => r.integer().min(0).max(60) }),
    defineField({ name: "durationDays", title: "Days", type: "number", group: "content", validation: (r) => r.integer().min(1).max(61) }),
    defineField({ name: "startingCity", title: "Starting city", type: "string", group: "content" }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3, group: "content", validation: (r) => r.max(300) }),
    defineField({ name: "highlights", title: "Highlights", type: "array", group: "content", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "price", title: "Price", type: "price", group: "pricing" }),
    defineField({ name: "priceNote", title: "Price note", type: "string", group: "pricing", description: "e.g. “Prices vary by travel dates and hotel category.”" }),
    defineField({
      name: "offer",
      title: "Special offer",
      type: "object",
      group: "offer",
      description:
        "Optional limited-time offer. It shows on the website only while “Offer is on” is ticked and until the end of the “Valid until” date (India time). Leave empty for no offer.",
      fields: [
        defineField({ name: "active", title: "Offer is on", type: "boolean", initialValue: true, description: "Untick to hide the offer without deleting it." }),
        defineField({ name: "title", title: "Offer name", type: "string", description: "e.g. “Diwali Special” or “Early-bird offer”.", validation: (r) => r.max(60) }),
        defineField({
          name: "offerPrice",
          title: "Offer price",
          type: "number",
          description: "The discounted starting price. If a normal price is also set (Price tab), it is shown crossed out next to this.",
          validation: (r) =>
            r.min(1).precision(0).custom((v, ctx) => {
              const normal = (ctx.document as { price?: { amount?: number } } | undefined)?.price?.amount;
              return v && normal && v >= normal ? "The offer price should be lower than the normal price" : true;
            }),
        }),
        defineField({ name: "badge", title: "Badge text", type: "string", description: "Short label on the package photo, e.g. “Save 15%” or “Free airport pickup”. If empty, “Save X%” is calculated automatically.", validation: (r) => r.max(30) }),
        defineField({ name: "details", title: "Offer details", type: "text", rows: 3, description: "e.g. “Book before 15 Nov. Valid for travel till 31 Dec. Minimum 2 adults.”" }),
        defineField({ name: "validUntil", title: "Valid until", type: "date", description: "Last day of the offer. Leave empty for no end date." }),
        defineField({ name: "showOnHomepage", title: "Show in “Special offers” on the homepage", type: "boolean", initialValue: true }),
      ],
      validation: (r) =>
        r.custom((o: { title?: string; offerPrice?: number; badge?: string; details?: string } | undefined) =>
          o && !o.title && (o.offerPrice || o.badge || o.details) ? "Give the offer a name (Offer name)" : true
        ),
    }),
    defineField({
      name: "itinerary",
      title: "Day-wise itinerary",
      type: "array",
      group: "itinerary",
      of: [defineArrayMember({ type: "itineraryDay" })],
      description: "Drag to reorder days.",
    }),
    defineField({ name: "inclusions", title: "Inclusions", type: "array", group: "details", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "exclusions", title: "Exclusions", type: "array", group: "details", of: [defineArrayMember({ type: "string" })] }),
    richTextField("importantNotes", "Important notes / terms", "details"),
    imageField("heroImage", "Main image", { group: "media", required: true }),
    galleryField("media"),
    defineField({ name: "featuredOnHomepage", title: "Feature on homepage", type: "boolean", group: "homepage", initialValue: false }),
    defineField({
      name: "homepageOrder",
      title: "Homepage position",
      type: "number",
      group: "homepage",
      description: "Lower numbers appear first.",
      hidden: ({ document }) => !document?.featuredOnHomepage,
    }),
    seoField,
  ],
  preview: {
    select: { title: "title", nights: "durationNights", days: "durationDays", amount: "price.amount", featured: "featuredOnHomepage", media: "heroImage", offer: "offer.title", offerOn: "offer.active" },
    prepare: ({ title, nights, days, amount, featured, media, offer, offerOn }) => ({
      title,
      subtitle: [nights && days ? `${nights}N/${days}D` : null, amount ? `₹${amount}` : "Price on request", featured ? "★ Homepage" : null, offer && offerOn !== false ? `🏷 ${offer}` : null].filter(Boolean).join(" · "),
      media,
    }),
  },
});
