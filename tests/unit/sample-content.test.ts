import { describe, expect, it } from "vitest";
import * as s from "@/data/sample";

describe("sample content safety", () => {
  it("contains no prices", () => {
    for (const p of s.samplePackages) expect(p.price?.amount).toBeUndefined();
  });
  it("contains no fabricated testimonials", () => {
    expect(s.sampleTestimonials).toHaveLength(0);
  });
  it("does not invent company contact details", () => {
    expect(s.sampleSettings.phone).toBeUndefined();
    expect(s.sampleSettings.email).toBeUndefined();
    expect(s.sampleSettings.address).toBeUndefined();
  });
  it("marks all sample records as samples", () => {
    for (const x of [...s.samplePackages, ...s.sampleDestinations, ...s.sampleServices, ...s.samplePosts, ...s.sampleLegal]) {
      expect(x.isSample).toBe(true);
    }
  });
  it("has unique slugs and valid destination references", () => {
    const slugs = s.samplePackages.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const destSlugs = new Set(s.sampleDestinations.map((d) => d.slug));
    for (const p of s.samplePackages) for (const d of p.destinations) expect(destSlugs.has(d.slug)).toBe(true);
  });
  it("itinerary days are sequential", () => {
    for (const p of s.samplePackages) p.itinerary?.forEach((d, i) => expect(d.day).toBe(i + 1));
  });
});
