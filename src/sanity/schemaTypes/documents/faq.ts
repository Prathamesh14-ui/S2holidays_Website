import { defineField, defineType } from "sanity";
import { HelpCircleIcon } from "@sanity/icons/HelpCircle";

export const faq = defineType({
  name: "faq",
  title: "FAQ",
  type: "document",
  icon: HelpCircleIcon,
  fields: [
    defineField({ name: "question", title: "Question", type: "string", validation: (r) => r.required() }),
    defineField({ name: "answer", title: "Answer", type: "text", rows: 5, validation: (r) => r.required() }),
    defineField({ name: "category", title: "Category", type: "string", options: { list: ["Booking", "Payments", "Travel", "Services", "General"] }, initialValue: "General" }),
    defineField({ name: "order", title: "Order", type: "number", description: "Lower numbers appear first." }),
  ],
  preview: { select: { title: "question", subtitle: "category" } },
});
