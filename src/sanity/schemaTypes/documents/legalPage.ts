import { defineField, defineType } from "sanity";
import { LockIcon } from "@sanity/icons/Lock";
import { richTextField } from "../helpers";

export const legalPage = defineType({
  name: "legalPage",
  title: "Policy page",
  type: "document",
  icon: LockIcon,
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Page",
      type: "slug",
      description: "Use “privacy-policy” or “terms”.",
      validation: (r) => r.required().custom((v) => (v?.current && ["privacy-policy", "terms"].includes(v.current) ? true : "Must be privacy-policy or terms")),
    }),
    richTextField("body", "Content"),
  ],
});
