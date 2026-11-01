import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { DestinationGrid } from "@/components/packages/DestinationGrid";
import { PackageCard } from "@/components/packages/PackageCard";
import { EnquiryBand } from "@/components/layout/EnquiryBand";
import { getDestinations, getPackages, getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Domestic Holidays",
  description: "Hill stations, beaches, heritage circuits and backwaters — holidays across India.",
  path: "/destinations/domestic",
});

export default async function Page() {
  const [destinations, packages, settings] = await Promise.all([
    getDestinations("domestic"),
    getPackages({ region: "domestic" }),
    getSettings(),
  ]);
  return (
    <>
      <PageHero
        title="Domestic Holidays"
        eyebrow="Discover India"
        intro="Hill stations, beaches, heritage circuits and backwaters — holidays across India."
        image={destinations[0]?.heroImage}
        crumbs={[{ label: "Destinations", href: "/destinations" }, { label: "Domestic Holidays", href: "/destinations/domestic" }]}
      />
      <section className="py-20">
        <Container>
          <SectionHeading eyebrow="Destinations" title="Choose a destination" className="mb-10" />
          <DestinationGrid destinations={destinations} packages={packages} />
        </Container>
      </section>
      {packages.length > 0 && (
        <section className="pb-24">
          <Container>
            <SectionHeading eyebrow="Packages" title="Domestic Holidays packages" className="mb-10" />
            <ul className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((p) => (
                <li key={p._id} data-reveal><PackageCard pkg={p} /></li>
              ))}
            </ul>
          </Container>
        </section>
      )}
      <EnquiryBand whatsapp={settings.whatsapp} />
    </>
  );
}
