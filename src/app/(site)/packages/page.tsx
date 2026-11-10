import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { PackageExplorer } from "@/components/packages/PackageExplorer";
import { PackageCard } from "@/components/packages/PackageCard";
import { EnquiryBand } from "@/components/layout/EnquiryBand";
import { getPackages, getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Holiday Packages",
  description: "Browse domestic and international holiday packages with day-wise itineraries. Filter by destination, holiday type and duration.",
  path: "/packages",
});

export default async function PackagesPage() {
  const [packages, settings] = await Promise.all([getPackages(), getSettings()]);
  return (
    <>
      <PageHero
        title="Holiday packages"
        eyebrow="Itineraries"
        intro="Day-wise itineraries to start your planning. Every package can be tailored to your dates, hotels and pace."
        slides={settings.packagesHeroSlides?.length ? settings.packagesHeroSlides : settings.heroSlides}
        image={packages[0]?.heroImage}
        crumbs={[{ label: "Packages", href: "/packages" }]}
      />
      <section className="py-16 sm:py-20">
        <Container>
          {/* Fallback (no-JS / first paint) renders the full list; the explorer adds filtering. */}
          <Suspense
            fallback={
              <>
                <div aria-hidden className="h-[154px] rounded-3xl bg-white shadow-card max-sm:h-[262px]" />
                <p className="mb-6 mt-8 h-5 text-sm text-muted">{packages.length} packages</p>
                <ul className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
                  {packages.map((p) => <li key={p._id}><PackageCard pkg={p} /></li>)}
                </ul>
              </>
            }
          >
            <PackageExplorer packages={packages} />
          </Suspense>
        </Container>
      </section>
      <EnquiryBand whatsapp={settings.whatsapp} title="Can't see the trip you want?" text="We can plan custom itineraries for most destinations. Tell us what you have in mind." />
    </>
  );
}
