import { defineArrayMember, defineField, defineType } from "sanity";
import { EarthGlobeIcon } from "@sanity/icons/EarthGlobe";

const money = (name: string, title: string, description?: string) =>
  defineField({ name, title, type: "number", description, validation: (r) => r.min(0).precision(0) });

export const plannerDestination = defineType({
  name: "plannerDestination",
  title: "Trip planner destination",
  type: "document",
  icon: EarthGlobeIcon,
  groups: [
    { name: "basics", title: "Basics", default: true },
    { name: "places", title: "Places & sightseeing" },
    { name: "rates", title: "Rates" },
  ],
  fields: [
    defineField({ name: "title", title: "Destination name", type: "string", group: "basics", validation: (r) => r.required() }),
    defineField({ name: "slug", title: "Planner slug", type: "slug", group: "basics", options: { source: "title" }, validation: (r) => r.required() }),
    defineField({ name: "active", title: "Show in the trip planner", type: "boolean", group: "basics", initialValue: true }),
    defineField({ name: "order", title: "Order", type: "number", group: "basics" }),
    defineField({ name: "destination", title: "Destination page", type: "reference", to: [{ type: "destination" }], group: "basics", description: "Links the planner to this destination's page." }),
    defineField({ name: "intro", title: "Short description", type: "string", group: "basics" }),
    defineField({ name: "startPoint", title: "Arrival point", type: "string", group: "basics", description: "e.g. “Goa airport (Dabolim or Mopa)”" }),
    defineField({ name: "endPoint", title: "Departure point", type: "string", group: "basics" }),
    defineField({
      name: "places",
      title: "Places to stay",
      type: "array",
      group: "places",
      description: "Each place the traveller can stay in, with its sightseeing. Hotel rates for each place are on this list too.",
      of: [
        defineArrayMember({
          type: "object",
          name: "plannerPlace",
          fields: [
            defineField({ name: "name", title: "Place name", type: "string", validation: (r) => r.required() }),
            defineField({ name: "key", title: "Key", type: "slug", options: { source: (_doc, ctx) => (ctx.parent as { name?: string })?.name ?? "" }, validation: (r) => r.required(), description: "Click Generate." }),
            defineField({ name: "description", title: "Short description", type: "string" }),
            defineField({ name: "defaultNights", title: "Suggested nights", type: "number", initialValue: 2, validation: (r) => r.min(1).max(14).integer() }),
            defineField({
              name: "sightseeing",
              title: "Sightseeing options",
              type: "array",
              description: "Add “(en route)” to a name to show it on the travel day.",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "plannerSight",
                  fields: [
                    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
                    money("extraPerPerson", "Extra cost per person (₹)", "Only if tickets/activities are charged extra. Leave empty if included."),
                  ],
                  preview: { select: { title: "name", extra: "extraPerPerson" }, prepare: ({ title, extra }) => ({ title, subtitle: extra ? `+ ₹${extra} per person` : undefined }) },
                }),
              ],
            }),
            defineField({
              name: "hotelRates",
              title: "Hotel rate per room per night (₹)",
              type: "object",
              options: { columns: 3 },
              fields: [money("standard", "Standard"), money("deluxe", "Deluxe"), money("premium", "Premium")],
            }),
          ],
          preview: {
            select: { title: "name", std: "hotelRates.standard", dlx: "hotelRates.deluxe", prm: "hotelRates.premium" },
            prepare: ({ title, std, dlx, prm }) => ({ title, subtitle: std || dlx || prm ? `₹${std ?? "–"} / ₹${dlx ?? "–"} / ₹${prm ?? "–"} per room per night` : "No hotel rates yet" }),
          },
        }),
      ],
    }),
    defineField({
      name: "vehicles",
      title: "Vehicles",
      type: "array",
      group: "rates",
      of: [
        defineArrayMember({
          type: "object",
          name: "plannerVehicle",
          fields: [
            defineField({ name: "name", title: "Vehicle", type: "string", validation: (r) => r.required() }),
            defineField({ name: "seats", title: "Seats", type: "number" }),
            money("ratePerDay", "Rate per day (₹)", "Including driver, fuel, tolls and parking."),
          ],
          preview: { select: { title: "name", rate: "ratePerDay" }, prepare: ({ title, rate }) => ({ title, subtitle: rate ? `₹${rate} per day` : "No rate yet" }) },
        }),
      ],
    }),
    defineField({
      name: "mealPlans",
      title: "Meal plans",
      type: "array",
      group: "rates",
      of: [
        defineArrayMember({
          type: "object",
          name: "plannerMeal",
          fields: [
            defineField({ name: "name", title: "Meal plan", type: "string", validation: (r) => r.required() }),
            money("ratePerPersonPerNight", "Rate per person per night (₹)", "Enter 0 if included in the hotel rate."),
          ],
          preview: {
            select: { title: "name", rate: "ratePerPersonPerNight" },
            prepare: ({ title, rate }) => ({ title, subtitle: rate === 0 ? "Included in hotel rate" : rate ? `₹${rate} per person per night` : "No rate yet" }),
          },
        }),
      ],
    }),
    defineField({
      name: "seasons",
      title: "Peak seasons (hotel supplement)",
      type: "array",
      group: "rates",
      of: [
        defineArrayMember({
          type: "object",
          name: "plannerSeason",
          fields: [
            defineField({ name: "name", title: "Name", type: "string", description: "e.g. Christmas & New Year", validation: (r) => r.required() }),
            defineField({ name: "from", title: "From", type: "date", validation: (r) => r.required() }),
            defineField({ name: "to", title: "To", type: "date", validation: (r) => r.required() }),
            defineField({ name: "percent", title: "Extra % on hotel rates", type: "number", validation: (r) => r.required().min(0).max(300) }),
          ],
          preview: { select: { title: "name", from: "from", to: "to", p: "percent" }, prepare: ({ title, from, to, p }) => ({ title, subtitle: `${from} → ${to}: +${p}%` }) },
        }),
      ],
    }),
    defineField({ name: "gstPercent", title: "GST %", type: "number", group: "rates", initialValue: 5 }),
    defineField({ name: "advancePercent", title: "Advance to confirm booking (%)", type: "number", group: "rates", description: "Optional. Shown as “Pay ₹X to confirm”." }),
    defineField({
      name: "estimate",
      title: "Rough estimate (until rates are confirmed)",
      type: "object",
      group: "rates",
      description:
        "Shown as “Estimated price” while “Show calculated prices” is OFF. Price per person ≈ fixed part + amount per night × nights (Standard hotel, twin sharing). The starting values were worked out from our approved package prices.",
      fields: [
        defineField({ name: "active", title: "Show the estimate", type: "boolean", initialValue: true }),
        money("basePerPerson", "Fixed part per person (₹)"),
        money("perNightPerPerson", "Amount per night per person (₹)"),
        defineField({ name: "childPercent", title: "Child 5–11 price (% of adult)", type: "number", initialValue: 65, validation: (r) => r.min(0).max(100) }),
        defineField({ name: "basedOn", title: "Worked out from", type: "string", readOnly: true }),
      ],
    }),
    defineField({
      name: "ratesConfirmed",
      title: "Show calculated prices to customers",
      type: "boolean",
      group: "rates",
      initialValue: false,
      description: "Tick ONLY when all rates above are correct. Until then the planner shows the rough estimate below.",
    }),
  ],
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "title", active: "active", confirmed: "ratesConfirmed" },
    prepare: ({ title, active, confirmed }) => ({ title, subtitle: `${active === false ? "Hidden · " : ""}${confirmed ? "Real prices shown" : "Rough estimate shown"}` }),
  },
});
