import { defineArrayMember, defineField, defineType } from "sanity";
import { EnvelopeIcon } from "@sanity/icons/Envelope";
import { LEAD_STATUSES } from "@/lib/enquiry/schema";

/**
 * Website enquiry (lead). Created ONLY by the server-side enquiry API using a write
 * token. Lead IDs are prefixed "lead." which keeps them out of unauthenticated API
 * reads even if the dataset is public. Submitted fields are read-only in the Studio;
 * staff manage status, assignment, follow-up date and notes.
 */
const ro = { readOnly: true, group: "submission" } as const;

export const lead = defineType({
  name: "lead",
  title: "Enquiry",
  type: "document",
  icon: EnvelopeIcon,
  groups: [
    { name: "manage", title: "Manage", default: true },
    { name: "submission", title: "Submitted details" },
  ],
  fields: [
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      group: "manage",
      options: { list: LEAD_STATUSES.map((s) => ({ title: s.title, value: s.value })), layout: "radio", direction: "horizontal" },
      initialValue: "new",
      validation: (r) => r.required(),
    }),
    defineField({ name: "assignedTo", title: "Assigned to", type: "string", group: "manage" }),
    defineField({ name: "followUpDate", title: "Follow-up date", type: "date", group: "manage" }),
    defineField({
      name: "notes",
      title: "Internal notes",
      type: "array",
      group: "manage",
      description: "Add a note for each call, quote or update.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "at", title: "Date", type: "datetime", initialValue: () => new Date().toISOString() }),
            defineField({ name: "note", title: "Note", type: "text", rows: 3, validation: (r) => r.required() }),
          ],
          preview: { select: { title: "note", subtitle: "at" } },
        }),
      ],
    }),
    defineField({ name: "name", title: "Name", type: "string", ...ro }),
    defineField({ name: "email", title: "Email", type: "string", ...ro }),
    defineField({ name: "phone", title: "Phone", type: "string", ...ro }),
    defineField({ name: "enquiryType", title: "Enquiry type", type: "string", ...ro }),
    defineField({ name: "packageTitle", title: "Package", type: "string", ...ro }),
    defineField({ name: "package", title: "Package (link)", type: "reference", to: [{ type: "holidayPackage" }], weak: true, ...ro }),
    defineField({ name: "destination", title: "Destination", type: "string", ...ro }),
    defineField({ name: "travelDate", title: "Travel date", type: "date", ...ro }),
    defineField({ name: "adults", title: "Adults", type: "number", ...ro }),
    defineField({ name: "children", title: "Children", type: "number", ...ro }),
    defineField({ name: "message", title: "Message", type: "text", rows: 5, ...ro }),
    defineField({ name: "sourcePage", title: "Submitted from page", type: "string", ...ro }),
    defineField({ name: "consent", title: "Consent given", type: "boolean", ...ro }),
    defineField({ name: "submittedAt", title: "Submitted at", type: "datetime", ...ro }),
    defineField({ name: "emailNotified", title: "Email notification sent", type: "boolean", ...ro }),
  ],
  orderings: [{ title: "Newest first", name: "submittedDesc", by: [{ field: "submittedAt", direction: "desc" }] }],
  preview: {
    select: { name: "name", status: "status", pkg: "packageTitle", type: "enquiryType", at: "submittedAt" },
    prepare: ({ name, status, pkg, type, at }) => {
      const s = LEAD_STATUSES.find((x) => x.value === status)?.title ?? status;
      const when = at ? new Date(at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "";
      return { title: `${name ?? "Unknown"} — ${s}`, subtitle: [when, pkg || type].filter(Boolean).join(" · ") };
    },
  },
});
