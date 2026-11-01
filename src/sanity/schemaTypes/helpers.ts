import { defineArrayMember, defineField } from "sanity";

/** Image field with hotspot and a required alt text for accessibility/SEO. */
export const imageField = (name: string, title: string, opts: { required?: boolean; description?: string; group?: string } = {}) =>
  defineField({
    name,
    title,
    type: "image",
    group: opts.group,
    description: opts.description,
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        title: "Alternative text",
        type: "string",
        description: "Describe the image for screen readers and search engines, e.g. “Houseboat on Dal Lake at sunset”.",
        validation: (r) => r.required().max(160),
      }),
    ],
    validation: opts.required ? (r) => r.required() : undefined,
  });

export const galleryField = (group?: string) =>
  defineField({
    name: "gallery",
    title: "Photo gallery",
    type: "array",
    group,
    of: [
      defineArrayMember({
        type: "image",
        options: { hotspot: true },
        fields: [defineField({ name: "alt", title: "Alternative text", type: "string", validation: (r) => r.required() })],
      }),
    ],
    options: { layout: "grid" },
  });

/** Rich text with headings, lists and safe links. */
export const richTextField = (name: string, title: string, group?: string) =>
  defineField({
    name,
    title,
    type: "array",
    group,
    of: [
      defineArrayMember({
        type: "block",
        styles: [
          { title: "Normal", value: "normal" },
          { title: "Heading", value: "h2" },
          { title: "Sub-heading", value: "h3" },
          { title: "Quote", value: "blockquote" },
        ],
        marks: {
          annotations: [
            {
              name: "link",
              type: "object",
              title: "Link",
              fields: [
                defineField({
                  name: "href",
                  type: "url",
                  title: "URL",
                  validation: (r) => r.uri({ allowRelative: true, scheme: ["http", "https", "mailto", "tel"] }),
                }),
              ],
            },
          ],
        },
      }),
    ],
  });

export const seoField = defineField({ name: "seo", title: "SEO", type: "seo", group: "seo" });
