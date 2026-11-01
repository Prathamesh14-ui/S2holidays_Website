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
  title: "International Holidays",
  description: "City breaks, island resorts and scenic tours abroad.",
  path: "/destinations/international",
});

export default async function Page() {
  const [destinations, packages, settings] = await Promise.all([
    getDestinations("international"),
    getPackages({ region: "international" }),
    getSettings(),
  ]);
  return (
    <>
      <PageHero
        title="International Holidays"
        eyebrow="Beyond borders"
        intro="City breaks, island resorts and scenic tours abroad."
        image={destinations[0]?.heroImage}
        crumbs={[{ label: "Destinations", href: "/destinations" }, { label: "International Holidays", href: "/destinations/international" }]}
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
            <SectionHeading eyebrow="Packages" title="International Holidays packages" className="mb-10" />
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
