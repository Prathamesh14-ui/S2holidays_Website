import { describe, expect, it } from "vitest";
import { buildLeadEmail } from "@/lib/enquiry/notify";
import { enquirySchema } from "@/lib/enquiry/schema";

describe("buildLeadEmail", () => {
  const e = enquirySchema.parse({
    name: 'Eve <img src=x onerror="alert(1)">',
    email: "eve@example.com",
    phone: "+91 9876543210",
    consent: true,
    message: "<script>alert('x')</script>\nSecond line",
    packageTitle: "Goa\r\nBcc: attacker@example.com",
  });
  const { html, subject, text } = buildLeadEmail(e, "lead.abc");

  it("escapes HTML in user-supplied values", () => {
    expect(html).not.toContain("<script>");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;");
  });
  it("strips newlines from the subject (header injection)", () => {
    expect(subject).not.toMatch(/[\r\n]/);
  });
  it("includes a plain-text alternative", () => {
    expect(text).toContain("Phone: +91 9876543210");
  });
});
