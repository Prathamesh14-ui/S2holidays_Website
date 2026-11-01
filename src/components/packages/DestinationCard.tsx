import Link from "next/link";
import { AppImage } from "@/components/ui/AppImage";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { cn } from "@/lib/format";
import type { Destination } from "@/lib/types";

export function DestinationCard({
  destination,
  className,
  size = "md",
  packageCount,
}: {
  destination: Destination;
  className?: string;
  size?: "md" | "lg";
  packageCount?: number;
}) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className={cn(
        "group relative isolate flex min-h-72 overflow-hidden rounded-3xl bg-ink shadow-card transition-shadow duration-500 hover:shadow-lift",
        size === "lg" && "min-h-96",
        className
      )}
    >
      <AppImage
        image={destination.heroImage}
        alt={destination.name}
        sizes="(min-width: 1024px) 40vw, (min-width: 640px) 50vw, 100vw"
        className="-z-10 transition-transform duration-[1.4s] ease-out group-hover:scale-105"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent" />
      {destination.isSample && <SampleBadge className="absolute right-4 top-4" />}
      <div className="mt-auto p-6 sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-soft">
          {destination.region === "international" ? destination.country : destination.state || "India"}
        </p>
        <h3 className={cn("mt-1 text-white", size === "lg" ? "text-4xl sm:text-5xl" : "text-3xl")}>{destination.name}</h3>
        {destination.tagline && <p className="mt-1.5 text-sm text-white/80">{destination.tagline}</p>}
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-white">
          <span className="border-b border-white/40 pb-0.5 transition-colors group-hover:border-gold">
            {packageCount ? `${packageCount} trip${packageCount > 1 ? "s" : ""}` : "Explore"}
          </span>
          <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
        </p>
      </div>
    </Link>
  );
}
