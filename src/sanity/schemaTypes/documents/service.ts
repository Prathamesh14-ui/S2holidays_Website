import { defineArrayMember, defineField, defineType } from "sanity";
import { CaseIcon } from "@sanity/icons/Case";
import { imageField, richTextField, seoField } from "../helpers";

export const service = defineType({
  name: "service",
  title: "Service page",
  type: "document",
  icon: CaseIcon,
  groups: [{ name: "content", title: "Content", default: true }, { name: "seo", title: "SEO" }],
  fields: [
    defineField({
      name: "key",
      title: "Service",
      type: "string",
      group: "content",
      description: "Which page this content is for. Each service should have exactly one document.",
      options: { list: [
        { title: "Mumbai sightseeing", value: "mumbai-sightseeing" },
        { title: "Car rental", value: "car-rental" },
        { title: "Tourist guide", value: "tourist-guide" },
      ] },
      validation: (r) => r.required(),
      readOnly: ({ document }) => Boolean(document?._createdAt && document?.key),
    }),
    defineField({ name: "title", title: "Title", type: "string", group: "content", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", group: "content", options: { source: "key" }, hidden: true }),
    defineField({ name: "tagline", title: "Tagline", type: "string", group: "content" }),
    defineField({ name: "intro", title: "Introduction", type: "text", rows: 3, group: "content" }),
    imageField("heroImage", "Main image", { group: "content" }),
    richTextField("body", "Details", "content"),
    defineField({
      name: "offerings",
      title: "Tours / options",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "object", fields: [
        defineField({ name: "title", type: "string", validation: (r) => r.required() }),
        defineField({ name: "description", type: "text", rows: 3 }),
        imageField("image", "Image"),
      ] })],
    }),
    defineField({
      name: "vehicles",
      title: "Vehicles (car rental)",
      type: "array",
      group: "content",
      hidden: ({ document }) => document?.key !== "car-rental",
      of: [defineArrayMember({ type: "object", fields: [
        defineField({ name: "name", type: "string", validation: (r) => r.required() }),
        defineField({ name: "seats", type: "number" }),
        defineField({ name: "airConditioned", title: "Air-conditioned", type: "boolean", initialValue: true }),
        defineField({ name: "description", type: "text", rows: 2 }),
        imageField("image", "Photo"),
      ] })],
    }),
    defineField({
      name: "faqs",
      title: "FAQs for this service",
      type: "array",
      group: "content",
      of: [defineArrayMember({ type: "object", fields: [
        defineField({ name: "question", type: "string", validation: (r) => r.required() }),
        defineField({ name: "answer", type: "text", rows: 3, validation: (r) => r.required() }),
      ] })],
    }),
    seoField,
  ],
  preview: { select: { title: "title", subtitle: "key", media: "heroImage" } },
});
