import Link from "next/link";
import { CalendarDays, MapPin } from "lucide-react";
import { AppImage } from "@/components/ui/AppImage";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { formatDuration, formatPrice } from "@/lib/format";
import type { HolidayPackage } from "@/lib/types";

export function PackageCard({ pkg, priority }: { pkg: HolidayPackage; priority?: boolean }) {
  const price = formatPrice(pkg.price);
  const duration = formatDuration(pkg);
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-all duration-500 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden">
        <AppImage
          image={pkg.heroImage}
          alt={pkg.title}
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="transition-transform duration-[1.2s] ease-out group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink backdrop-blur">
            {pkg.region === "international" ? "International" : "India"}
          </span>
          {pkg.isSample && <SampleBadge />}
        </div>
        {duration && (
          <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1 text-xs font-medium text-white backdrop-blur">
            <CalendarDays aria-hidden className="h-3.5 w-3.5" /> {duration}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {!!pkg.destinations.length && (
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-gold">
            <MapPin aria-hidden className="h-3.5 w-3.5" /> {pkg.destinations.map((d) => d.name).join(" · ")}
          </p>
        )}
        <h3 className="mt-2 text-2xl leading-tight text-ink">
          <Link href={`/packages/${pkg.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {pkg.title}
          </Link>
        </h3>
        {pkg.summary && <p className="mb-5 mt-2 line-clamp-2 text-sm leading-relaxed text-muted">{pkg.summary}</p>}
        <div className="mt-auto flex items-end justify-between gap-4 border-t border-line pt-4">
          <div>
            {price ? (
              <>
                <p className="text-[11px] uppercase tracking-wider text-muted">From</p>
                <p className="text-xl font-semibold text-ink">
                  {price}
                  {pkg.price?.basis && <span className="ml-1 text-xs font-normal text-muted">{pkg.price.basis}</span>}
                </p>
              </>
            ) : (
              <p className="text-sm font-medium text-ink">Price on request</p>
            )}
          </div>
          <span className="text-sm font-medium text-gold transition-transform group-hover:translate-x-1">View trip →</span>
        </div>
      </div>
    </article>
  );
}
