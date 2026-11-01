import { defineArrayMember, defineField, defineType } from "sanity";

export const itineraryDay = defineType({
  name: "itineraryDay",
  title: "Itinerary day",
  type: "object",
  fields: [
    defineField({ name: "day", title: "Day number", type: "number", validation: (r) => r.required().integer().min(1).max(60) }),
    defineField({ name: "title", title: "Title", type: "string", description: "e.g. “Arrive in Srinagar”", validation: (r) => r.required().max(120) }),
    defineField({ name: "description", title: "Description", type: "text", rows: 4 }),
    defineField({
      name: "meals",
      title: "Meals included",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      options: { list: ["Breakfast", "Lunch", "Dinner"], layout: "grid" },
    }),
    defineField({ name: "overnight", title: "Overnight stay", type: "string", description: "e.g. “Srinagar (houseboat)”" }),
  ],
  preview: {
    select: { day: "day", title: "title", overnight: "overnight" },
    prepare: ({ day, title, overnight }) => ({ title: `Day ${day ?? "?"}: ${title ?? ""}`, subtitle: overnight ? `Overnight: ${overnight}` : undefined }),
  },
});
