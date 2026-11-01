import { z } from "zod";

/** Shared enquiry schema. The server ALWAYS re-validates with this; the client uses it for instant feedback. */
const trimmed = (max: number) => z.string().trim().max(max);

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(80, "Name is too long"),
  email: z.string().trim().toLowerCase().max(120).pipe(z.email({ message: "Please enter a valid email address" })),
  phone: z
    .string()
    .trim()
    .min(7, "Please enter a valid phone number")
    .max(20, "Please enter a valid phone number")
    .regex(/^\+?[0-9 ()-]{7,20}$/, "Please enter a valid phone number"),
  travelDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Please choose a valid date")
    .optional()
    .or(z.literal("")),
  adults: z.coerce.number().int().min(1, "At least 1 adult").max(50).default(2),
  children: z.coerce.number().int().min(0).max(20).default(0),
  destination: trimmed(100).optional(),
  packageSlug: z.string().trim().regex(/^[a-z0-9-]*$/).max(120).optional(),
  packageTitle: trimmed(160).optional(),
  enquiryType: z.enum(["package", "general", "mumbai-sightseeing", "car-rental", "tourist-guide"]).default("general"),
  budget: trimmed(60).optional(),
  message: trimmed(2000).optional(),
  consent: z.literal(true, { message: "Please agree so we can contact you about your enquiry" }),
  sourcePage: trimmed(200).optional(),
  // Anti-spam: honeypot must stay empty; startedAt is when the form was rendered (ms epoch)
  website: z.string().max(0).optional().or(z.literal("")),
  startedAt: z.coerce.number().optional(),
});

export type EnquiryInput = z.input<typeof enquirySchema>;
export type Enquiry = z.output<typeof enquirySchema>;

export const LEAD_STATUSES = [
  { value: "new", title: "New" },
  { value: "contacted", title: "Contacted" },
  { value: "quoted", title: "Quote sent" },
  { value: "follow-up", title: "Follow-up" },
  { value: "booked", title: "Booked" },
  { value: "lost", title: "Not proceeding" },
  { value: "spam", title: "Spam" },
] as const;
