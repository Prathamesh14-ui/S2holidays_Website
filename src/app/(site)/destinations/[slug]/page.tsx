import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarRange, Sparkles } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RichText } from "@/components/ui/RichText";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { AppImage } from "@/components/ui/AppImage";
import { JsonLd } from "@/components/ui/JsonLd";
import { PackageCard } from "@/components/packages/PackageCard";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { ButtonLink } from "@/components/ui/Button";
import { getDestination, getDestinations, getPackages, getPlannerDestinations, getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { slugParams } from "@/lib/static-params";
import { siteUrl } from "@/lib/env";

export async function generateStaticParams() {
  return slugParams((await getDestinations()).map((d) => d.slug));
}

export async function generateMetadata({ params }: PageProps<"/destinations/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const d = await getDestination(slug);
  if (!d) return { title: "Destination not found" };
  return pageMetadata({
    title: `${d.name} Holidays`,
    description: d.summary || d.tagline || `Holiday packages and travel ideas for ${d.name}.`,
    path: `/destinations/${d.slug}`,
    image: d.heroImage,
    seo: d.seo,
  });
}

export default async function DestinationPage({ params }: PageProps<"/destinations/[slug]">) {
  const { slug } = await params;
  const [d, settings] = await Promise.all([getDestination(slug), getSettings()]);
  if (!d) notFound();
  const [packages, planners] = await Promise.all([getPackages({ destinationSlug: d.slug }), getPlannerDestinations()]);
  const planner = planners.find((p) => p.destinationSlug === d.slug);
  const regionLabel = d.region === "international" ? "International Holidays" : "Domestic Holidays";

  return (
    <>
      <PageHero
        title={d.name}
        eyebrow={d.region === "international" ? d.country : d.state || "India"}
        intro={d.tagline}
        image={d.heroImage}
        size="lg"
        crumbs={[
          { label: regionLabel, href: `/destinations/${d.region}` },
          { label: d.name, href: `/destinations/${d.slug}` },
        ]}
      />

      <section className="py-20">
        <Container className="grid gap-14 lg:grid-cols-[1fr_380px]">
          <div>
            {d.isSample && <SampleBadge className="mb-4" label="Sample destination copy" />}
            <SectionHeading eyebrow="Overview" title={`Discover ${d.name}`} />
            {d.summary && <p className="mt-6 text-xl leading-relaxed text-ink-soft">{d.summary}</p>}
            <RichText value={d.overview} className="mt-6" />
            {!!d.gallery?.length && (
              <ul className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {d.gallery.map((img, i) => (
                  <li key={i} className="relative aspect-square overflow-hidden rounded-2xl">
                    <AppImage image={img} sizes="(min-width: 640px) 25vw, 50vw" />
                  </li>
                ))}
              </ul>
            )}
          </div>
          <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
            {d.bestTimeToVisit && (
              <div className="rounded-3xl bg-white p-6 shadow-card">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold"><CalendarRange aria-hidden className="h-4 w-4" /> Best time to visit</p>
                <p className="mt-2 text-ink">{d.bestTimeToVisit}</p>
              </div>
            )}
            {!!d.highlights?.length && (
              <div className="rounded-3xl bg-white p-6 shadow-card">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gold"><Sparkles aria-hidden className="h-4 w-4" /> Highlights</p>
                <ul className="mt-3 space-y-2">
                  {d.highlights.map((h) => (
                    <li key={h} className="flex gap-2 text-ink"><span aria-hidden className="text-gold">—</span>{h}</li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </Container>
      </section>

      {planner && (
        <section aria-label="Trip planner" className="pb-4">
          <Container>
            <div className="flex flex-col items-start justify-between gap-5 rounded-3xl bg-ink p-7 text-white sm:flex-row sm:items-center sm:p-9">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-soft">Trip planner</p>
                <p className="mt-2 font-display text-3xl">Customise your {d.name} trip</p>
                <p className="mt-1 text-sm text-white/75">Pick places, nights, sightseeing and hotel category — get a day-wise plan instantly.</p>
              </div>
              <ButtonLink href={`/plan-my-trip?dest=${planner.slug}`} variant="gold" className="shrink-0">Build your own trip →</ButtonLink>
            </div>
          </Container>
        </section>
      )}

      <section className="border-t border-line bg-white/50 py-20">
        <Container>
          <SectionHeading eyebrow="Packages" title={`${d.name} holiday packages`} className="mb-10" />
          {packages.length ? (
            <ul className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {packages.map((p) => <li key={p._id}><PackageCard pkg={p} /></li>)}
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-line p-8 text-center text-muted">
              No ready-made packages listed yet — send an enquiry and we&apos;ll plan a custom {d.name} itinerary.
            </p>
          )}
        </Container>
      </section>

      <section id="enquiry" className="scroll-mt-24 py-20">
        <Container className="max-w-3xl">
          <EnquiryForm title={`Plan your ${d.name} holiday`} destination={d.name} whatsapp={settings.whatsapp} />
        </Container>
      </section>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristDestination",
          name: d.name,
          description: d.summary || d.tagline,
          url: `${siteUrl}/destinations/${d.slug}`,
          ...(d.country ? { containedInPlace: { "@type": "Country", name: d.country } } : {}),
        }}
      />
    </>
  );
}
