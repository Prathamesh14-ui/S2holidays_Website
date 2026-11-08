import { defineArrayMember, defineField, defineType } from "sanity";
import { CogIcon } from "@sanity/icons/Cog";
import { imageField, richTextField } from "../helpers";
import { HOME_SECTIONS } from "@/lib/homepage-sections";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "company", title: "Company & contact", default: true },
    { name: "home", title: "Homepage" },
    { name: "announcement", title: "Announcement bar" },
    { name: "about", title: "About page" },
  ],
  fields: [
    defineField({ name: "companyName", title: "Company name", type: "string", group: "company", initialValue: "S2 Holidays", validation: (r) => r.required() }),
    defineField({ name: "legalName", title: "Registered legal name", type: "string", group: "company", description: "Shown in the copyright line." }),
    defineField({ name: "tagline", title: "Tagline", type: "string", group: "company" }),
    defineField({ name: "description", title: "Short description", type: "text", rows: 3, group: "company", description: "Used for search engines and structured data." }),
    defineField({ name: "phone", title: "Phone number", type: "string", group: "company", description: "Displayed in the header, footer and contact page. Include country code, e.g. +91 98XXX XXXXX." }),
    defineField({
      name: "whatsapp",
      title: "WhatsApp number",
      type: "string",
      group: "company",
      description: "International format, digits only (e.g. 919800000000). Powers all WhatsApp buttons.",
      validation: (r) => r.regex(/^\d{8,15}$/, { name: "digits only" }),
    }),
    defineField({ name: "email", title: "Email", type: "string", group: "company", validation: (r) => r.email() }),
    defineField({ name: "address", title: "Office address", type: "text", rows: 3, group: "company" }),
    defineField({ name: "mapUrl", title: "Google Maps link", type: "url", group: "company" }),
    defineField({ name: "officeHours", title: "Office hours", type: "string", group: "company" }),
    defineField({
      name: "socials",
      title: "Social media links",
      type: "array",
      group: "company",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
            defineField({ name: "url", title: "URL", type: "url", validation: (r) => r.required() }),
          ],
        }),
      ],
    }),
    imageField("logo", "Logo", { group: "company" }),
    defineField({ name: "heroHeading", title: "Hero heading", type: "string", group: "home" }),
    defineField({ name: "heroSubheading", title: "Hero sub-heading", type: "text", rows: 2, group: "home" }),
    imageField("heroImage", "Hero image (single)", {
      group: "home",
      description: "Used only if no slideshow photos are added below. Landscape photo, at least 2400 px wide.",
    }),
    defineField({
      name: "homepageSections",
      title: "Homepage sections (order)",
      type: "array",
      group: "home",
      description:
        "Drag to change the order of the sections below the big photo. Remove a section to hide it. Leave the list empty to use the standard order. (The photo at the top and the enquiry banner at the bottom always stay.)",
      of: [
        defineArrayMember({
          type: "object",
          name: "homeSection",
          fields: [
            defineField({
              name: "section",
              title: "Section",
              type: "string",
              options: { list: HOME_SECTIONS.map((s) => ({ title: s.title, value: s.value })) },
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { section: "section" },
            prepare: ({ section }) => ({ title: HOME_SECTIONS.find((s) => s.value === section)?.title ?? "Choose a section" }),
          },
        }),
      ],
      validation: (r) =>
        r.custom((items: { section?: string }[] | undefined) => {
          const keys = (items ?? []).map((i) => i.section).filter(Boolean);
          return new Set(keys).size === keys.length ? true : "Each section can only be listed once";
        }),
    }),
    defineField({
      name: "heroSlides",
      title: "Hero slideshow photos",
      type: "array",
      group: "home",
      description:
        "2–6 landscape photos (at least 2400 px wide, without text printed on them). They fade from one to the next in random order. If empty, destination photos are used.",
      of: [
        defineArrayMember({
          type: "object",
          name: "heroSlide",
          fields: [
            imageField("image", "Photo", { required: true }),
            defineField({ name: "caption", title: "Caption", type: "string", description: "Short label shown in the corner, e.g. “Kerala backwaters”." }),
            defineField({ name: "destination", title: "Link to destination", type: "reference", to: [{ type: "destination" }] }),
          ],
          preview: { select: { title: "caption", subtitle: "destination.name", media: "image" } },
        }),
      ],
      validation: (r) => r.max(8),
    }),
    defineField({
      name: "announcement",
      title: "Announcement bar",
      type: "object",
      group: "announcement",
      description: "A thin bar at the very top of every page, e.g. for a festival sale. Hidden automatically after the “Show until” date.",
      fields: [
        defineField({ name: "active", title: "Show the bar", type: "boolean", initialValue: true }),
        defineField({ name: "text", title: "Text", type: "string", description: "e.g. “🪔 Diwali sale: up to 15% off selected holidays — book by 15 Nov”", validation: (r) => r.max(120) }),
        defineField({ name: "link", title: "Link (optional)", type: "string", description: "Page to open when clicked, e.g. /packages?offer=1 (all offers) or /packages/kerala-4n-5d" }),
        defineField({ name: "validUntil", title: "Show until", type: "date", description: "Last day to show the bar. Leave empty to show until switched off." }),
      ],
    }),
    defineField({ name: "aboutTitle", title: "About page title", type: "string", group: "about" }),
    richTextField("aboutBody", "About text", "about"),
    imageField("aboutImage", "About image", { group: "about" }),
    defineField({
      name: "values",
      title: "Our approach (3 points)",
      type: "array",
      group: "about",
      description: "Shown on the homepage and about page.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "description", type: "text", rows: 2 }),
          ],
        }),
      ],
      validation: (r) => r.max(6),
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
