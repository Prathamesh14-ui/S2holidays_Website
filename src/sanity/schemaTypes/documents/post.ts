import { defineArrayMember, defineField, defineType } from "sanity";
import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { imageField, richTextField, seoField } from "../helpers";

export const post = defineType({
  name: "post",
  title: "Blog post",
  type: "document",
  icon: DocumentTextIcon,
  groups: [{ name: "content", title: "Content", default: true }, { name: "seo", title: "SEO" }],
  fields: [
    defineField({ name: "title", title: "Title", type: "string", group: "content", validation: (r) => r.required().max(120) }),
    defineField({ name: "slug", title: "URL slug", type: "slug", group: "content", options: { source: "title", maxLength: 96 }, validation: (r) => r.required() }),
    defineField({ name: "publishedAt", title: "Publish date", type: "datetime", group: "content", description: "Posts dated in the future stay hidden until that date (after the next site refresh).", initialValue: () => new Date().toISOString(), validation: (r) => r.required() }),
    defineField({ name: "author", title: "Author", type: "string", group: "content" }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 3, group: "content", validation: (r) => r.max(300) }),
    imageField("coverImage", "Cover image", { group: "content", required: true }),
    defineField({ name: "categories", title: "Categories", type: "array", group: "content", of: [defineArrayMember({ type: "string" })], options: { layout: "tags" } }),
    richTextField("body", "Article", "content"),
    seoField,
  ],
  orderings: [{ title: "Newest first", name: "publishedDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: { select: { title: "title", subtitle: "publishedAt", media: "coverImage" } },
});
