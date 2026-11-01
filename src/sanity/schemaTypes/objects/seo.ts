import { defineField, defineType } from "sanity";

export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  description: "Optional. Overrides the default search-engine title, description and social sharing image.",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: "title", title: "Meta title", type: "string", validation: (r) => r.max(70).warning("Keep under ~60 characters") }),
    defineField({ name: "description", title: "Meta description", type: "text", rows: 3, validation: (r) => r.max(170).warning("Keep under ~160 characters") }),
    defineField({
      name: "image",
      title: "Social sharing image",
      type: "image",
      description: "1200 × 630 px recommended.",
      fields: [defineField({ name: "alt", title: "Alternative text", type: "string" })],
    }),
    defineField({ name: "noIndex", title: "Hide from search engines", type: "boolean", initialValue: false }),
  ],
});
