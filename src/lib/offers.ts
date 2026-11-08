import type { HolidayPackage, PackageOffer } from "./types";
import { formatPrice } from "./format";

/** End of the given day in India (offers run until 23:59 IST on their "valid until" date). */
export function offerEndsAt(validUntil?: string): number | null {
  if (!validUntil || !/^\d{4}-\d{2}-\d{2}$/.test(validUntil)) return null;
  const t = Date.parse(`${validUntil}T23:59:59+05:30`);
  return Number.isNaN(t) ? null : t;
}

/** An offer shows only when switched on, named, and not past its end date. */
export function isOfferActive(offer: PackageOffer | null | undefined, now: number): offer is PackageOffer {
  if (!offer || offer.active === false || !offer.title?.trim()) return false;
  const end = offerEndsAt(offer.validUntil);
  return end === null || now <= end;
}

/** Discount % when both the normal price and a lower offer price are set. */
export function discountPercent(pkg: Pick<HolidayPackage, "price" | "offer">): number | null {
  const normal = pkg.price?.amount;
  const offer = pkg.offer?.offerPrice;
  if (!normal || !offer || offer >= normal || pkg.price?.show === false) return null;
  return Math.round(((normal - offer) / normal) * 100);
}

/** Short text for the badge: the editor's badge text, else "Save X%", else the offer name. */
export function offerBadge(pkg: Pick<HolidayPackage, "price" | "offer">): string | null {
  if (!pkg.offer) return null;
  if (pkg.offer.badge?.trim()) return pkg.offer.badge.trim();
  const pct = discountPercent(pkg);
  return pct ? `Save ${pct}%` : pkg.offer.title;
}

/** What to show in a price slot: current price, optional crossed-out normal price. */
export function priceView(pkg: Pick<HolidayPackage, "price" | "offer">): { now: string | null; was: string | null; basis?: string } {
  const offerPrice = pkg.offer?.offerPrice;
  if (offerPrice) {
    const now = formatPrice({ ...pkg.price, amount: offerPrice, show: true });
    const was = pkg.price?.amount && pkg.price.amount > offerPrice ? formatPrice(pkg.price) : null;
    return { now, was, basis: pkg.price?.basis };
  }
  return { now: formatPrice(pkg.price), was: null, basis: pkg.price?.basis };
}
