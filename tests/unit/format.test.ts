import { describe, expect, it } from "vitest";
import { formatDuration, formatPrice } from "@/lib/format";
import { whatsappLink } from "@/lib/whatsapp";

describe("formatPrice", () => {
  it("returns null when no price should show", () => {
    expect(formatPrice(undefined)).toBeNull();
    expect(formatPrice({})).toBeNull();
    expect(formatPrice({ amount: 0 })).toBeNull();
    expect(formatPrice({ amount: 25000, show: false })).toBeNull();
  });
  it("formats INR with Indian grouping", () => {
    expect(formatPrice({ amount: 125000, currency: "INR" })).toBe("₹1,25,000");
  });
  it("formats other currencies", () => {
    expect(formatPrice({ amount: 1500, currency: "USD" })).toBe("$1,500");
  });
});

describe("formatDuration", () => {
  it("formats nights and days", () => {
    expect(formatDuration({ durationNights: 5, durationDays: 6 })).toBe("5 Nights / 6 Days");
    expect(formatDuration({ durationNights: 1, durationDays: 2 })).toBe("1 Night / 2 Days");
    expect(formatDuration({})).toBeNull();
  });
});

describe("whatsappLink", () => {
  it("builds an encoded wa.me link", () => {
    expect(whatsappLink("+91 98765-43210", "Hi & hello")).toBe("https://wa.me/919876543210?text=Hi%20%26%20hello");
  });
  it("returns null without a usable number", () => {
    expect(whatsappLink(undefined, "x")).toBeNull();
    expect(whatsappLink("123", "x")).toBeNull();
  });
});
