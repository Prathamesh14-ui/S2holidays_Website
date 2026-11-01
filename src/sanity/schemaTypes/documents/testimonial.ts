import { defineField, defineType } from "sanity";
import { CommentIcon } from "@sanity/icons/Comment";

export const testimonial = defineType({
  name: "testimonial",
  title: "Testimonial",
  type: "document",
  icon: CommentIcon,
  description: "Only genuine reviews from real customers who have agreed to publication.",
  fields: [
    defineField({ name: "name", title: "Customer name", type: "string", description: "As the customer agreed to be credited, e.g. “Priya S.”", validation: (r) => r.required() }),
    defineField({ name: "location", title: "City", type: "string" }),
    defineField({ name: "quote", title: "Review", type: "text", rows: 5, validation: (r) => r.required().max(600) }),
    defineField({ name: "rating", title: "Rating (1–5)", type: "number", validation: (r) => r.integer().min(1).max(5) }),
    defineField({ name: "tripName", title: "Trip", type: "string" }),
    defineField({ name: "source", title: "Source", type: "string", description: "Where the review came from (e.g. Google review, email). Internal only." }),
    defineField({
      name: "consentConfirmed",
      title: "Customer consent confirmed",
      type: "boolean",
      description: "Tick only if the customer agreed to this review being published. Unticked testimonials never appear on the website.",
      initialValue: false,
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: "name", subtitle: "quote", consent: "consentConfirmed" },
    prepare: ({ title, subtitle, consent }) => ({ title: `${consent ? "" : "⚠ Not shown — "}${title}`, subtitle }),
  },
});
