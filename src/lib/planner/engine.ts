import type { PlanDay, PlannerDestination, PriceBreakdown, PriceLine, TripChoice } from "./types";
import { HOTEL_CATEGORIES } from "./types";

const DAY = 86_400_000;

/** Add `n` days to a YYYY-MM-DD date (UTC-safe). */
export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d) + n * DAY).toISOString().slice(0, 10);
}

export function formatDay(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, d))
  ).replace(/,\s(\d{4})$/, " $1"); // "Sun, 20 Dec 2026"
}

export const totalNights = (c: TripChoice) => c.stops.reduce((n, s) => n + Math.max(0, s.nights), 0);
export const chargeablePax = (c: TripChoice) => Math.max(1, c.adults + c.children);

const isEnRoute = (name: string) => /\(en route\)/i.test(name);
const listJoin = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

function mealsFor(meal: string | undefined, kind: "first" | "middle" | "last"): string | undefined {
  if (!meal) return undefined;
  const m = meal.toLowerCase();
  const bf = m.includes("breakfast") || m.includes("all");
  const dinner = m.includes("dinner") || m.includes("all");
  if (kind === "first") return dinner ? "Dinner" : undefined;
  if (kind === "last") return bf ? "Breakfast" : undefined;
  return meal;
}

/** Build the day-by-day plan from the visitor's choices. */
export function buildDays(dest: PlannerDestination, c: TripChoice): PlanDay[] {
  const stops = c.stops.filter((s) => s.nights > 0);
  const nights = stops.reduce((n, s) => n + s.nights, 0);
  if (!nights) return [];
  const place = (key: string) => dest.places.find((p) => p.key === key);
  const nightStop: number[] = stops.flatMap((s, i) => Array.from({ length: s.nights }, () => i));
  const days: PlanDay[] = Array.from({ length: nights + 1 }, (_, i) => ({
    day: i + 1,
    date: c.startDate ? addDays(c.startDate, i) : undefined,
    title: "",
    lines: [],
  }));

  let firstNight = 0;
  stops.forEach((stop, si) => {
    const p = place(stop.placeKey);
    const name = p?.name ?? stop.placeKey;
    const chosen = (p?.sightseeing ?? []).map((x) => x.name).filter((n) => stop.sights.includes(n));
    const enRoute = chosen.filter(isEnRoute);
    const visits = chosen.filter((n) => !isEnRoute(n));
    const arrival = days[firstNight];
    if (si === 0) {
      arrival.title = `Arrive in ${name}`;
      arrival.lines.push(`Arrive at ${dest.startPoint || name} and transfer to your hotel in ${name}.`);
    } else {
      arrival.title = `Travel to ${name}`;
      arrival.lines.push(`Check out after breakfast and travel to ${name}. Check in at your hotel.`);
    }
    if (enRoute.length) arrival.lines.push(`On the way: ${listJoin(enRoute.map((n) => n.replace(/\s*\(en route\)/i, "")))}.`);
    arrival.stay = name;

    const fullDays = days.slice(firstNight + 1, firstNight + stop.nights);
    fullDays.forEach((d) => (d.stay = name));
    if (!fullDays.length) {
      if (visits.length) arrival.lines.push(`After check-in: ${listJoin(visits)}.`);
      else arrival.lines.push("Evening at leisure.");
    } else {
      if (si === 0 || !visits.length) arrival.lines.push("Rest of the day at leisure.");
      const per = Math.max(1, Math.ceil(visits.length / fullDays.length));
      fullDays.forEach((d, i) => {
        const todays = visits.slice(i * per, (i + 1) * per);
        if (todays.length) {
          d.title = todays.length > 1 ? `${todays[0]} and more` : todays[0];
          d.lines.push(...todays);
        } else {
          d.title = `Day at leisure in ${name}`;
          d.lines.push(`Free day to explore ${name} at your own pace, or add optional activities.`);
        }
      });
    }
    firstNight += stop.nights;
  });

  const last = days[days.length - 1];
  last.title = "Departure";
  last.lines.push(`Check out and transfer to ${dest.endPoint || dest.startPoint || "the airport / station"} for your onward journey.`);
  days.forEach((d, i) => {
    d.meals = mealsFor(c.meal, i === 0 ? "first" : i === days.length - 1 ? "last" : "middle");
    if (i < nightStop.length && !d.stay) d.stay = place(stops[nightStop[i]].placeKey)?.name;
  });
  return days;
}

/**
 * Calculate the estimated price. Returns null (→ "free quote") unless the owner has ticked
 * "rates confirmed" AND every rate needed for this choice has been entered.
 */
export function calculatePrice(dest: PlannerDestination, c: TripChoice): PriceBreakdown | null {
  if (!dest.ratesConfirmed) return null;
  const stops = c.stops.filter((s) => s.nights > 0);
  const nights = stops.reduce((n, s) => n + s.nights, 0);
  if (!nights || c.rooms < 1) return null;
  const pax = chargeablePax(c);
  const lines: PriceLine[] = [];
  const catLabel = HOTEL_CATEGORIES.find((h) => h.value === c.hotel)?.label ?? c.hotel;

  // Hotels (with seasonal supplements per night)
  let nightIndex = 0;
  let seasonExtra = 0;
  for (const s of stops) {
    const p = dest.places.find((x) => x.key === s.placeKey);
    const rate = p?.hotelRates?.[c.hotel];
    if (!p || !rate || rate <= 0) return null;
    lines.push({ label: `${p.name}: ${s.nights} night${s.nights > 1 ? "s" : ""}, ${c.rooms} room${c.rooms > 1 ? "s" : ""}, ${catLabel}`, amount: rate * s.nights * c.rooms });
    for (let i = 0; i < s.nights; i++, nightIndex++) {
      if (!c.startDate) continue;
      const night = addDays(c.startDate, nightIndex);
      const season = (dest.seasons ?? []).find((z) => z.from <= night && night <= z.to);
      if (season) seasonExtra += (rate * c.rooms * season.percent) / 100;
    }
  }
  if (seasonExtra > 0) lines.push({ label: "Peak-season hotel supplement", amount: Math.round(seasonExtra) });

  // Vehicle
  if (dest.vehicles.length) {
    const v = dest.vehicles.find((x) => x.name === c.vehicle);
    if (!v || !v.ratePerDay || v.ratePerDay <= 0) return null;
    lines.push({ label: `${v.name} for ${nights + 1} days`, amount: v.ratePerDay * (nights + 1) });
  }

  // Meals
  if (c.meal) {
    const m = dest.mealPlans.find((x) => x.name === c.meal);
    if (!m || m.ratePerPersonPerNight === undefined || m.ratePerPersonPerNight === null) return null;
    if (m.ratePerPersonPerNight > 0) lines.push({ label: `${m.name} for ${pax} guest${pax > 1 ? "s" : ""}, ${nights} nights`, amount: m.ratePerPersonPerNight * pax * nights });
  }

  // Paid sightseeing extras
  let extras = 0;
  for (const s of stops) {
    const p = dest.places.find((x) => x.key === s.placeKey);
    for (const sight of p?.sightseeing ?? []) if (s.sights.includes(sight.name) && sight.extraPerPerson) extras += sight.extraPerPerson * pax;
  }
  if (extras > 0) lines.push({ label: "Sightseeing tickets and activities", amount: extras });

  const subtotal = lines.reduce((t, l) => t + l.amount, 0);
  const gstPercent = dest.gstPercent ?? 0;
  const gst = Math.round((subtotal * gstPercent) / 100);
  const total = subtotal + gst;
  return {
    lines,
    subtotal,
    gstPercent,
    gst,
    total,
    perPerson: Math.round(total / pax),
    advance: dest.advancePercent ? Math.round((total * dest.advancePercent) / 100) : undefined,
  };
}

/**
 * Rough estimate (used until real rates are confirmed): per-person price from the destination's
 * package-price model, Standard hotel, twin sharing. Children 5–11 at childPercent; under-5s free.
 */
export function estimatePrice(dest: PlannerDestination, c: TripChoice): PriceBreakdown | null {
  const e = dest.estimate;
  const nights = totalNights(c);
  if (!e || e.active === false || !nights || e.perNightPerPerson <= 0) return null;
  const round100 = (n: number) => Math.round(n / 100) * 100;
  const adultPP = round100(e.basePerPerson + e.perNightPerPerson * nights);
  const childPP = round100((adultPP * (e.childPercent ?? 65)) / 100);
  const lines: PriceLine[] = [{ label: `${c.adults} adult${c.adults > 1 ? "s" : ""} × ${inr(adultPP)}`, amount: adultPP * c.adults }];
  if (c.children) lines.push({ label: `${c.children} child${c.children > 1 ? "ren" : ""} (5–11) × ${inr(childPP)}`, amount: childPP * c.children });
  const subtotal = lines.reduce((t, l) => t + l.amount, 0);
  const gstPercent = dest.gstPercent ?? 0;
  const gst = Math.round((subtotal * gstPercent) / 100);
  const total = subtotal + gst;
  return { lines, subtotal, gstPercent, gst, total, perPerson: Math.round(total / chargeablePax(c)), estimate: true };
}

/** Confirmed-rate price if available, otherwise the rough estimate, otherwise null (free quote). */
export function tripPrice(dest: PlannerDestination, c: TripChoice): PriceBreakdown | null {
  return calculatePrice(dest, c) ?? estimatePrice(dest, c);
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** Plain-text summary used for the enquiry, WhatsApp and the PDF title. */
export function planText(dest: PlannerDestination, c: TripChoice, days: PlanDay[], price: PriceBreakdown | null, opts: { short?: boolean } = {}): string {
  const nights = totalNights(c);
  const route = c.stops.filter((s) => s.nights > 0).map((s) => `${dest.places.find((p) => p.key === s.placeKey)?.name ?? s.placeKey} (${s.nights}N)`).join(" → ");
  const head = [
    `Trip planner: ${dest.title}, ${nights} nights / ${nights + 1} days`,
    c.startDate ? `Start date: ${formatDay(c.startDate)}` : "Start date: flexible",
    `Travellers: ${c.adults} adult(s)${c.children ? `, ${c.children} child(ren) 5–11` : ""}${c.infants ? `, ${c.infants} under 5` : ""}; ${c.rooms} room(s)`,
    `Route: ${route}`,
    `Hotel: ${HOTEL_CATEGORIES.find((h) => h.value === c.hotel)?.label}${c.meal ? ` · Meals: ${c.meal}` : ""}${c.vehicle ? ` · Vehicle: ${c.vehicle}` : ""}`,
    price
      ? `${price.estimate ? "Rough estimate (Standard hotel)" : "Estimated total"}: ${inr(price.total)} incl. GST (${inr(price.perPerson)} per person)`
      : "Price: quote requested",
  ];
  if (opts.short) return head.join("\n");
  const body = days.map((d) => `Day ${d.day}${d.date ? ` (${formatDay(d.date)})` : ""}: ${d.title}${d.lines.length ? ` — ${d.lines.join("; ")}` : ""}`);
  return [...head, "", ...body].join("\n");
}
