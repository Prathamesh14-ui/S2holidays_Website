import { describe, expect, it } from "vitest";
import { enquirySchema } from "@/lib/enquiry/schema";

const valid = { name: "Asha Patel", email: "Asha@Example.com ", phone: "+91 98765 43210", consent: true };

describe("enquirySchema", () => {
  it("accepts a minimal valid enquiry and normalises values", () => {
    const r = enquirySchema.parse(valid);
    expect(r.email).toBe("asha@example.com");
    expect(r.adults).toBe(2);
    expect(r.children).toBe(0);
    expect(r.enquiryType).toBe("general");
  });

  it("coerces numeric strings from form data", () => {
    const r = enquirySchema.parse({ ...valid, adults: "3", children: "1" });
    expect(r.adults).toBe(3);
    expect(r.children).toBe(1);
  });

  it.each([
    ["name", { name: "A" }],
    ["email", { email: "not-an-email" }],
    ["phone", { phone: "abc" }],
    ["phone", { phone: "123" }],
    ["consent", { consent: false }],
    ["travelDate", { travelDate: "01/02/2026" }],
    ["adults", { adults: 0 }],
    ["children", { children: 99 }],
    ["packageSlug", { packageSlug: "../../etc" }],
    ["enquiryType", { enquiryType: "admin" }],
  ])("rejects invalid %s", (field, patch) => {
    const r = enquirySchema.safeParse({ ...valid, ...patch });
    expect(r.success).toBe(false);
    expect(r.error!.issues[0].path[0]).toBe(field);
  });

  it("rejects overly long messages", () => {
    expect(enquirySchema.safeParse({ ...valid, message: "x".repeat(2001) }).success).toBe(false);
  });

  it("flags a filled honeypot", () => {
    const r = enquirySchema.safeParse({ ...valid, website: "http://spam" });
    expect(r.success).toBe(false);
    expect(r.error!.issues[0].path[0]).toBe("website");
  });

  it("accepts an empty travel date", () => {
    expect(enquirySchema.safeParse({ ...valid, travelDate: "" }).success).toBe(true);
  });
});
