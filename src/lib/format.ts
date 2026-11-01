import type { HolidayPackage, Price } from "./types";

const currencyLocale: Record<string, string> = { INR: "en-IN", USD: "en-US", EUR: "en-IE", AED: "en-AE" };

/** Returns a formatted price, or null when no price should be displayed. */
export function formatPrice(price?: Price): string | null {
  if (!price || price.show === false || typeof price.amount !== "number" || price.amount <= 0) return null;
  const currency = price.currency || "INR";
  return new Intl.NumberFormat(currencyLocale[currency] || "en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price.amount);
}

export function formatDuration(p: Pick<HolidayPackage, "durationNights" | "durationDays">): string | null {
  const { durationNights: n, durationDays: d } = p;
  if (!n && !d) return null;
  const parts = [];
  if (n) parts.push(`${n} Night${n === 1 ? "" : "s"}`);
  if (d) parts.push(`${d} Day${d === 1 ? "" : "s"}`);
  return parts.join(" / ");
}

export function formatDate(iso?: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(date);
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
