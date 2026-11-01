import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Car, Check, Snowflake, Users } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RichText } from "@/components/ui/RichText";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { AppImage } from "@/components/ui/AppImage";
import { JsonLd } from "@/components/ui/JsonLd";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { getService, getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { siteUrl } from "@/lib/env";
import type { ServiceKey } from "@/lib/types";

const KEYS: ServiceKey[] = ["mumbai-sightseeing", "car-rental", "tourist-guide"];
const isKey = (k: string): k is ServiceKey => (KEYS as string[]).includes(k);

export function generateStaticParams() {
  return KEYS.map((service) => ({ service }));
}

export async function generateMetadata({ params }: PageProps<"/services/[service]">): Promise<Metadata> {
  const { service } = await params;
  if (!isKey(service)) return { title: "Service not found" };
  const s = await getService(service);
  if (!s) return { title: "Service not found" };
  return pageMetadata({ title: s.title, description: s.tagline || s.intro, path: `/services/${service}`, image: s.heroImage, seo: s.seo });
}

export default async function ServicePage({ params }: PageProps<"/services/[service]">) {
  const { service } = await params;
  if (!isKey(service)) notFound();
  const [s, settings] = await Promise.all([getService(service), getSettings()]);
  if (!s) notFound();

  return (
    <>
      <PageHero
        title={s.title}
        eyebrow="Services"
        intro={s.tagline}
        image={s.heroImage}
        crumbs={[{ label: "Services", href: "/services" }, { label: s.title, href: `/services/${service}` }]}
      />

      <Container className="grid gap-14 py-16 lg:grid-cols-[1fr_400px] lg:py-20">
        <div className="min-w-0">
          {s.isSample && <SampleBadge className="mb-4" label="Sample service details" />}
          {s.intro && <p className="text-xl leading-relaxed text-ink-soft">{s.intro}</p>}
          <RichText value={s.body} className="mt-6" />

          {!!s.offerings?.length && (
            <section className="mt-14">
              <SectionHeading eyebrow="What we offer" title={service === "mumbai-sightseeing" ? "Tour options" : "Options"} />
              <ul className="mt-8 grid gap-5 sm:grid-cols-2">
                {s.offerings.map((o) => (
                  <li key={o.title} data-reveal className="overflow-hidden rounded-2xl bg-white shadow-card">
                    {o.image && <div className="relative aspect-[16/9]"><AppImage image={o.image} sizes="(min-width: 640px) 33vw, 100vw" /></div>}
                    <div className="p-6">
                      <h3 className="text-2xl text-ink">{o.title}</h3>
                      {o.description && <p className="mt-2 text-sm leading-relaxed text-muted">{o.description}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!!s.vehicles?.length && (
            <section className="mt-14">
              <SectionHeading eyebrow="Fleet" title="Vehicles" />
              <ul className="mt-8 grid gap-5 sm:grid-cols-3">
                {s.vehicles.map((v) => (
                  <li key={v.name} data-reveal className="rounded-2xl bg-white p-6 shadow-card">
                    {v.image ? (
                      <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-xl"><AppImage image={v.image} sizes="33vw" /></div>
                    ) : (
                      <Car aria-hidden className="mb-4 h-8 w-8 text-gold" strokeWidth={1.5} />
                    )}
                    <h3 className="text-2xl text-ink">{v.name}</h3>
                    <ul className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
                      {v.seats && <li className="inline-flex items-center gap-1"><Users aria-hidden className="h-3.5 w-3.5" /> {v.seats} seats</li>}
                      {v.airConditioned && <li className="inline-flex items-center gap-1"><Snowflake aria-hidden className="h-3.5 w-3.5" /> AC</li>}
                    </ul>
                    {v.description && <p className="mt-3 text-sm text-muted">{v.description}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!!s.faqs?.length && (
            <section className="mt-14">
              <SectionHeading eyebrow="FAQ" title="Common questions" />
              <div className="mt-6 divide-y divide-line rounded-2xl bg-white shadow-card">
                {s.faqs.map((f) => (
                  <details key={f.question} className="group p-5">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-ink [&::-webkit-details-marker]:hidden">
                      {f.question}
                      <span aria-hidden className="text-xl text-gold transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted">{f.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <EnquiryForm compact title={`Book ${s.title.toLowerCase()}`} enquiryType={service} whatsapp={settings.whatsapp} />
          <ul className="mt-6 space-y-2 px-2 text-sm text-muted">
            <li className="flex gap-2"><Check aria-hidden className="h-4 w-4 text-teal" /> Tell us your date and group size</li>
            <li className="flex gap-2"><Check aria-hidden className="h-4 w-4 text-teal" /> We confirm availability and a quote</li>
          </ul>
        </aside>
      </Container>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Service",
          name: s.title,
          description: s.intro || s.tagline,
          url: `${siteUrl}/services/${service}`,
          provider: { "@type": "TravelAgency", name: settings.companyName, url: siteUrl },
          areaServed: service === "mumbai-sightseeing" ? "Mumbai" : undefined,
        }}
      />
    </>
  );
}
