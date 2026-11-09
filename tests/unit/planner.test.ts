import { describe, expect, it } from "vitest";
import { addDays, buildDays, calculatePrice, planText } from "@/lib/planner/engine";
import { plannerDefaults } from "@/data/planner-defaults";
import type { PlannerDestination, TripChoice } from "@/lib/planner/types";

const goa = plannerDefaults.find((d) => d.slug === "goa")!;
const choice = (over: Partial<TripChoice> = {}): TripChoice => ({
  startDate: "2026-12-28",
  adults: 2,
  children: 1,
  infants: 0,
  rooms: 1,
  hotel: "deluxe",
  meal: "Breakfast",
  vehicle: goa.vehicles[0].name,
  stops: [
    { placeKey: "north-goa", nights: 3, sights: ["Fort Aguada and lighthouse", "Calangute and Baga beaches", "Anjuna beach", "Old Goa churches (Basilica of Bom Jesus, Se Cathedral)"] },
    { placeKey: "south-goa", nights: 1, sights: ["Colva beach"] },
  ],
  ...over,
});

describe("dates", () => {
  it("adds days across month/year ends", () => {
    expect(addDays("2026-12-30", 3)).toBe("2027-01-02");
  });
});

describe("buildDays", () => {
  const days = buildDays(goa, choice());
  it("creates nights + 1 days with dates", () => {
    expect(days).toHaveLength(5);
    expect(days[0].date).toBe("2026-12-28");
    expect(days[4].date).toBe("2027-01-01");
  });
  it("arrives, spreads sightseeing over full days, transfers and departs", () => {
    expect(days[0].title).toBe("Arrive in North Goa");
    expect(days[1].lines.length + days[2].lines.length).toBe(4); // 4 sights over 2 full days
    expect(days[3].title).toBe("Travel to South Goa");
    expect(days[3].lines.join(" ")).toContain("Colva beach"); // 1-night stop: sights after check-in
    expect(days[4].title).toBe("Departure");
  });
  it("records where each night is spent and meals", () => {
    expect(days.slice(0, 4).map((d) => d.stay)).toEqual(["North Goa", "North Goa", "North Goa", "South Goa"]);
    expect(days[0].meals).toBeUndefined(); // breakfast plan: no meal on arrival day
    expect(days[2].meals).toBe("Breakfast");
  });
  it("returns nothing when no nights are chosen", () => {
    expect(buildDays(goa, choice({ stops: [] }))).toEqual([]);
  });
});

describe("calculatePrice", () => {
  it("never shows a price without owner-confirmed rates (defaults have no rates)", () => {
    expect(calculatePrice(goa, choice())).toBeNull();
    expect(calculatePrice({ ...goa, ratesConfirmed: true }, choice())).toBeNull(); // rates missing
  });

  const rated: PlannerDestination = {
    ...goa,
    ratesConfirmed: true,
    gstPercent: 5,
    advancePercent: 30,
    places: goa.places.map((p) => ({ ...p, hotelRates: { standard: 2000, deluxe: 3000, premium: 6000 } })),
    vehicles: goa.vehicles.map((v) => ({ ...v, ratePerDay: 2500 })),
    mealPlans: [{ name: "Breakfast", ratePerPersonPerNight: 0 }, { name: "Breakfast + dinner", ratePerPersonPerNight: 600 }],
    seasons: [{ name: "New Year", from: "2026-12-30", to: "2027-01-02", percent: 50 }],
  };

  it("adds hotels, season supplement, vehicle, meals and GST", () => {
    const p = calculatePrice(rated, choice())!;
    // hotels 3×3000 + 1×3000 = 12000; season: nights 30 Dec & 31 Dec = 2 × 1500 = 3000; vehicle 5 × 2500 = 12500
    expect(p.subtotal).toBe(12000 + 3000 + 12500);
    expect(p.gst).toBe(Math.round(p.subtotal * 0.05));
    expect(p.total).toBe(p.subtotal + p.gst);
    expect(p.perPerson).toBe(Math.round(p.total / 3)); // 2 adults + 1 child (5–11)
    expect(p.advance).toBe(Math.round(p.total * 0.3));
  });
  it("charges meal plans per guest per night", () => {
    const p = calculatePrice(rated, choice({ meal: "Breakfast + dinner", startDate: undefined }))!;
    expect(p.lines.find((l) => l.label.startsWith("Breakfast + dinner"))?.amount).toBe(600 * 3 * 4);
  });
  it("falls back to a quote if any needed rate is missing", () => {
    const partial = { ...rated, places: [{ ...rated.places[0] }, { ...rated.places[1], hotelRates: { standard: 2000 } }] };
    expect(calculatePrice(partial, choice())).toBeNull();
  });
});

describe("planText", () => {
  it("summarises the trip for the enquiry", () => {
    const c = choice();
    const t = planText(goa, c, buildDays(goa, c), null);
    expect(t).toContain("Goa, 4 nights / 5 days");
    expect(t).toContain("North Goa (3N) → South Goa (1N)");
    expect(t).toContain("Price: quote requested");
    expect(t).toContain("Day 5");
  });
});

import { formatDay } from "@/lib/planner/engine";
describe("formatDay", () => {
  it("formats as 'Sun, 20 Dec 2026'", () => expect(formatDay("2026-12-20")).toBe("Sun, 20 Dec 2026"));
});
