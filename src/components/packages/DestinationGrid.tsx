import { DestinationCard } from "./DestinationCard";
import type { Destination, HolidayPackage } from "@/lib/types";

export function DestinationGrid({ destinations, packages }: { destinations: Destination[]; packages: HolidayPackage[] }) {
  if (!destinations.length) {
    return <p className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">Destinations will be added soon.</p>;
  }
  const count = (slug: string) => packages.filter((p) => p.destinations.some((d) => d.slug === slug)).length;
  return (
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {destinations.map((d) => (
        <li key={d._id} data-reveal>
          <DestinationCard destination={d} packageCount={count(d.slug)} className="h-full min-h-80" />
        </li>
      ))}
    </ul>
  );
}
