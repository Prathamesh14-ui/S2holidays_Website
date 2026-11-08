"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, Tag, X } from "lucide-react";
import { PackageCard } from "./PackageCard";
import type { HolidayPackage } from "@/lib/types";
import { cn } from "@/lib/format";

const DURATIONS = [
  { value: "short", label: "Up to 4 days", test: (d: number) => d <= 4 },
  { value: "week", label: "5–7 days", test: (d: number) => d >= 5 && d <= 7 },
  { value: "long", label: "8+ days", test: (d: number) => d >= 8 },
];

/** Client-side filtering; filters are mirrored in the URL so results can be shared. */
export function PackageExplorer({ packages }: { packages: HolidayPackage[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const region = params.get("region") || "";
  const destination = params.get("destination") || "";
  const theme = params.get("theme") || "";
  const duration = params.get("duration") || "";
  const offerOnly = params.get("offer") === "1";
  const offerCount = packages.filter((p) => p.offer).length;

  const destinations = useMemo(() => {
    const m = new Map<string, string>();
    packages.forEach((p) => p.destinations.forEach((d) => (!region || d.region === region) && m.set(d.slug, d.name)));
    return [...m].sort((a, b) => a[1].localeCompare(b[1]));
  }, [packages, region]);
  const themes = useMemo(() => [...new Set(packages.flatMap((p) => p.themes || []))].sort(), [packages]);

  const results = packages.filter((p) => {
    if (offerOnly && !p.offer) return false;
    if (region && p.region !== region) return false;
    if (destination && !p.destinations.some((d) => d.slug === destination)) return false;
    if (theme && !(p.themes || []).includes(theme)) return false;
    if (duration) {
      const days = p.durationDays || (p.durationNights ? p.durationNights + 1 : 0);
      const rule = DURATIONS.find((x) => x.value === duration);
      if (rule && !rule.test(days)) return false;
    }
    return true;
  });

  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    if (key === "region") next.delete("destination");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };
  const active = region || destination || theme || duration || offerOnly;

  const select =
    "h-11 w-full cursor-pointer rounded-full border border-line bg-white px-4 text-sm text-ink focus:border-gold focus:outline-none";

  return (
    <div>
      <div className="rounded-3xl bg-white p-4 shadow-card sm:p-5">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-ink">
          <SlidersHorizontal aria-hidden className="h-4 w-4 text-gold" /> Filter packages
        </div>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Region">
          {[
            ["", "All"],
            ["domestic", "India"],
            ["international", "International"],
          ].map(([v, l]) => (
            <button
              key={v}
              type="button"
              aria-pressed={region === v}
              onClick={() => set("region", v)}
              className={cn(
                "rounded-full px-5 py-2 text-sm font-medium transition-colors",
                region === v ? "bg-ink text-white" : "bg-sand text-ink hover:bg-sand-deep"
              )}
            >
              {l}
            </button>
          ))}
          {(offerCount > 0 || offerOnly) && (
            <button
              type="button"
              aria-pressed={offerOnly}
              onClick={() => set("offer", offerOnly ? "" : "1")}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                offerOnly ? "bg-offer text-white" : "bg-offer/10 text-offer hover:bg-offer/20"
              )}
            >
              <Tag aria-hidden className="h-4 w-4" /> Offers{offerCount > 0 && ` (${offerCount})`}
            </button>
          )}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="sr-only">Destination</span>
            <select className={select} value={destination} onChange={(e) => set("destination", e.target.value)}>
              <option value="">All destinations</option>
              {destinations.map(([slug, name]) => <option key={slug} value={slug}>{name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="sr-only">Holiday type</span>
            <select className={select} value={theme} onChange={(e) => set("theme", e.target.value)}>
              <option value="">All holiday types</option>
              {themes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="sr-only">Duration</span>
            <select className={select} value={duration} onChange={(e) => set("duration", e.target.value)}>
              <option value="">Any duration</option>
              {DURATIONS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="mb-6 mt-8 flex items-center justify-between gap-4">
        <p aria-live="polite" className="text-sm text-muted">
          {results.length} {results.length === 1 ? "package" : "packages"}
        </p>
        {active && (
          <button type="button" onClick={() => router.replace(pathname, { scroll: false })} className="inline-flex items-center gap-1 text-sm font-medium text-gold hover:text-gold-deep">
            <X aria-hidden className="h-4 w-4" /> Clear filters
          </button>
        )}
      </div>

      {results.length ? (
        <ul className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((p) => <li key={p._id}><PackageCard pkg={p} /></li>)}
        </ul>
      ) : (
        <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">
          No packages match these filters. Try clearing a filter, or send us an enquiry for a custom trip.
        </p>
      )}
    </div>
  );
}
