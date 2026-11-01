import { defineArrayMember, defineField, defineType } from "sanity";
import { EarthGlobeIcon } from "@sanity/icons/EarthGlobe";
import { galleryField, imageField, richTextField, seoField } from "../helpers";

const RESERVED = ["domestic", "international"];

export const destination = defineType({
  name: "destination",
  title: "Destination",
  type: "document",
  icon: EarthGlobeIcon,
  groups: [{ name: "content", title: "Content", default: true }, { name: "media", title: "Images" }, { name: "seo", title: "SEO" }],
  fields: [
    defineField({ name: "name", title: "Name", type: "string", group: "content", validation: (r) => r.required().max(80) }),
    defineField({
      name: "slug",
      title: "URL slug",
      type: "slug",
      group: "content",
      options: { source: "name", maxLength: 80 },
      validation: (r) =>
        r.required().custom((v) => (v?.current && RESERVED.includes(v.current) ? "This slug is reserved — choose another" : true)),
    }),
    defineField({
      name: "region",
      title: "Region",
      type: "string",
      group: "content",
      options: { list: [{ title: "Domestic (India)", value: "domestic" }, { title: "International", value: "international" }], layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "state", title: "State / territory", type: "string", group: "content", hidden: ({ document }) => document?.region !== "domestic" }),
    defineField({ name: "country", title: "Country", type: "string", group: "content", initialValue: "India" }),
    defineField({ name: "tagline", title: "Tagline", type: "string", group: "content", validation: (r) => r.max(90) }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3, group: "content", description: "One or two sentences used on cards and search results.", validation: (r) => r.max(300) }),
    richTextField("overview", "Overview", "content"),
    defineField({ name: "bestTimeToVisit", title: "Best time to visit", type: "string", group: "content" }),
    defineField({ name: "highlights", title: "Highlights", type: "array", group: "content", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "featured", title: "Feature on homepage", type: "boolean", group: "content", initialValue: false }),
    imageField("heroImage", "Main image", { group: "media", required: true }),
    galleryField("media"),
    seoField,
  ],
  preview: {
    select: { title: "name", region: "region", media: "heroImage", featured: "featured" },
    prepare: ({ title, region, media, featured }) => ({
      title,
      subtitle: `${region === "international" ? "International" : "Domestic"}${featured ? " · ★ Featured" : ""}`,
      media,
    }),
  },
  orderings: [{ title: "Name", name: "nameAsc", by: [{ field: "name", direction: "asc" }] }],
});
