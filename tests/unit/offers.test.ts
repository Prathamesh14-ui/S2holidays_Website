import { describe, expect, it } from "vitest";
import { discountPercent, isOfferActive, offerBadge, offerEndsAt, priceView } from "@/lib/offers";

const at = (iso: string) => Date.parse(iso);

describe("isOfferActive", () => {
  const offer = { title: "Diwali Special", validUntil: "2026-11-15" };
  it("is active up to the end of the last day (India time)", () => {
    expect(isOfferActive(offer, at("2026-11-15T23:59:00+05:30"))).toBe(true);
    expect(isOfferActive(offer, at("2026-11-16T00:00:30+05:30"))).toBe(false);
  });
  it("respects the on/off switch and requires a name", () => {
    expect(isOfferActive({ ...offer, active: false }, at("2026-11-10T10:00:00Z"))).toBe(false);
    expect(isOfferActive({ title: "  " }, Date.now())).toBe(false);
    expect(isOfferActive(undefined, Date.now())).toBe(false);
  });
  it("has no end without a date, and ignores malformed dates", () => {
    expect(isOfferActive({ title: "Always on" }, at("2099-01-01T00:00:00Z"))).toBe(true);
    expect(offerEndsAt("15/11/2026")).toBeNull();
  });
});

describe("discount and badge", () => {
  const base = { price: { amount: 20000, currency: "INR" as const, show: true } };
  it("calculates the percentage saving", () => {
    expect(discountPercent({ ...base, offer: { title: "Sale", offerPrice: 17000 } })).toBe(15);
    expect(discountPercent({ ...base, offer: { title: "Sale", offerPrice: 25000 } })).toBeNull();
    expect(discountPercent({ price: { amount: 20000, show: false }, offer: { title: "Sale", offerPrice: 17000 } })).toBeNull();
  });
  it("prefers the editor's badge text, then Save X%, then the name", () => {
    expect(offerBadge({ ...base, offer: { title: "Sale", offerPrice: 17000, badge: "Free pickup" } })).toBe("Free pickup");
    expect(offerBadge({ ...base, offer: { title: "Sale", offerPrice: 17000 } })).toBe("Save 15%");
    expect(offerBadge({ offer: { title: "Monsoon deal" } })).toBe("Monsoon deal");
    expect(offerBadge({ ...base })).toBeNull();
  });
  it("shows the offer price with the normal price crossed out", () => {
    expect(priceView({ ...base, offer: { title: "Sale", offerPrice: 17000 } })).toMatchObject({ now: "₹17,000", was: "₹20,000" });
    expect(priceView({ offer: { title: "Sale", offerPrice: 9999 } })).toMatchObject({ now: "₹9,999", was: null });
    expect(priceView({ ...base })).toMatchObject({ now: "₹20,000", was: null });
  });
});

import { DEFAULT_HOME_ORDER, resolveHomeOrder } from "@/lib/homepage-sections";

describe("resolveHomeOrder", () => {
  it("uses the default order when nothing is chosen", () => {
    expect(resolveHomeOrder(undefined)).toEqual(DEFAULT_HOME_ORDER);
    expect(resolveHomeOrder([])).toEqual(DEFAULT_HOME_ORDER);
  });
  it("follows the editor's order, drops unknown/duplicate keys and hides unlisted sections", () => {
    expect(resolveHomeOrder(["offers", "featured", "bogus", "offers", null])).toEqual(["offers", "featured"]);
  });
});
