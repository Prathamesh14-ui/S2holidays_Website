import { defineArrayMember, defineField, defineType } from "sanity";
import { CogIcon } from "@sanity/icons/Cog";
import { imageField, richTextField } from "../helpers";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  icon: CogIcon,
  groups: [
    { name: "company", title: "Company & contact", default: true },
    { name: "home", title: "Homepage hero" },
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
    imageField("heroImage", "Hero image", { group: "home", description: "Landscape photo, at least 2400 px wide." }),
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
