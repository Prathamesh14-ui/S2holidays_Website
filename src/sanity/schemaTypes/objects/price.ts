import { defineField, defineType } from "sanity";

export const price = defineType({
  name: "price",
  title: "Price",
  type: "object",
  description: "Leave the amount empty to show “Price on request”.",
  fields: [
    defineField({ name: "amount", title: "Starting price", type: "number", validation: (r) => r.min(1).precision(0) }),
    defineField({
      name: "currency",
      title: "Currency",
      type: "string",
      initialValue: "INR",
      options: { list: ["INR", "USD", "EUR", "AED"], layout: "radio", direction: "horizontal" },
    }),
    defineField({ name: "basis", title: "Price basis", type: "string", description: "e.g. “per person on twin sharing”" }),
    defineField({ name: "show", title: "Show price on website", type: "boolean", initialValue: true }),
  ],
});
