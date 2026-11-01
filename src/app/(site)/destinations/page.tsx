import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { DestinationGrid } from "@/components/packages/DestinationGrid";
import { EnquiryBand } from "@/components/layout/EnquiryBand";
import { getDestinations, getPackages, getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Holiday Destinations",
  description: "Explore domestic and international holiday destinations with S2 Holidays.",
  path: "/destinations",
});

export default async function DestinationsPage() {
  const [destinations, packages, settings] = await Promise.all([getDestinations(), getPackages(), getSettings()]);
  const domestic = destinations.filter((d) => d.region === "domestic");
  const international = destinations.filter((d) => d.region === "international");
  return (
    <>
      <PageHero
        title="Destinations"
        eyebrow="Where to next"
        intro="Holidays across India and around the world."
        image={international[0]?.heroImage || domestic[0]?.heroImage}
        crumbs={[{ label: "Destinations", href: "/destinations" }]}
      />
      <section className="py-20">
        <Container>
          <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading eyebrow="India" title="Domestic destinations" />
            <ButtonLink href="/destinations/domestic" variant="outline">View domestic</ButtonLink>
          </div>
          <DestinationGrid destinations={domestic} packages={packages} />
        </Container>
      </section>
      <section className="pb-24">
        <Container>
          <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading eyebrow="Abroad" title="International destinations" />
            <ButtonLink href="/destinations/international" variant="outline">View international</ButtonLink>
          </div>
          <DestinationGrid destinations={international} packages={packages} />
        </Container>
      </section>
      <EnquiryBand whatsapp={settings.whatsapp} />
    </>
  );
}
