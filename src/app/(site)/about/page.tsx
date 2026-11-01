import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { AppImage } from "@/components/ui/AppImage";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EnquiryBand } from "@/components/layout/EnquiryBand";
import { getSettings, usingSampleContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description: "About S2 Holidays — holiday planning, Mumbai sightseeing, car rentals and tourist guide services.",
  path: "/about",
});

export default async function AboutPage() {
  const s = await getSettings();
  return (
    <>
      <PageHero title={s.aboutTitle || `About ${s.companyName}`} eyebrow="Our story" image={s.aboutImage || s.heroImage} crumbs={[{ label: "About us", href: "/about" }]} />
      <section className="py-20">
        <Container className="grid items-start gap-14 lg:grid-cols-2">
          <div>
            {s.isSample && <SampleBadge className="mb-4" label="Placeholder — awaiting verified company story" />}
            <RichText value={s.aboutBody} className="text-lg" />
          </div>
          <div data-reveal className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-lift">
            <AppImage image={s.aboutImage || s.heroImage} sizes="(min-width: 1024px) 50vw, 100vw" />
          </div>
        </Container>
      </section>
      {!!s.values?.length && (
        <section className="border-y border-line bg-white/60 py-20">
          <Container>
            <SectionHeading eyebrow="What guides us" title="Our approach" />
            <ul className="mt-10 grid gap-6 md:grid-cols-3">
              {s.values.map((v) => (
                <li key={v.title} data-reveal className="rounded-3xl bg-white p-7 shadow-card">
                  <h3 className="text-2xl text-ink">{v.title}</h3>
                  {v.description && <p className="mt-2 text-sm leading-relaxed text-muted">{v.description}</p>}
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}
      {usingSampleContent && (
        <section id="sample-content" className="scroll-mt-28 py-16">
          <Container className="max-w-3xl">
            <div className="rounded-3xl border border-dashed border-amber-600/50 bg-amber-50 p-8 text-amber-950">
              <h2 className="text-3xl">About this preview</h2>
              <p className="mt-3 leading-relaxed">
                This website is running with sample content because the content management system has not yet been
                connected. Destinations, packages, itineraries, service details, blog articles and policy pages are
                placeholders for design and testing. Images are generated illustrations, not photographs. No prices,
                customer reviews, awards or company statistics are shown, because none have been verified yet.
              </p>
            </div>
          </Container>
        </section>
      )}
      <EnquiryBand whatsapp={s.whatsapp} />
    </>
  );
}
