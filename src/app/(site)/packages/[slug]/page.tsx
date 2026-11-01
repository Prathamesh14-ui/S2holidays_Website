import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Check, MapPin, Moon, Plane, Utensils, X } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { AppImage } from "@/components/ui/AppImage";
import { JsonLd } from "@/components/ui/JsonLd";
import { PackageCard } from "@/components/packages/PackageCard";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { getPackage, getPackages, getSettings } from "@/lib/content";
import { formatDuration, formatPrice } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { slugParams } from "@/lib/static-params";
import { siteUrl } from "@/lib/env";

export async function generateStaticParams() {
  return slugParams((await getPackages()).map((p) => p.slug));
}

export async function generateMetadata({ params }: PageProps<"/packages/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPackage(slug);
  if (!p) return { title: "Package not found" };
  const duration = formatDuration(p);
  return pageMetadata({
    title: `${p.title}${duration ? ` — ${duration}` : ""}`,
    description: p.summary || `Day-wise itinerary for ${p.title}.`,
    path: `/packages/${p.slug}`,
    image: p.heroImage,
    seo: p.seo,
  });
}

export default async function PackagePage({ params }: PageProps<"/packages/[slug]">) {
  const { slug } = await params;
  const [p, settings] = await Promise.all([getPackage(slug), getSettings()]);
  if (!p) notFound();

  const price = formatPrice(p.price);
  const duration = formatDuration(p);
  const related = (await getPackages({ region: p.region })).filter((x) => x._id !== p._id).slice(0, 3);
  const primaryDest = p.destinations[0];

  const facts = [
    duration && { icon: CalendarDays, label: "Duration", value: duration },
    p.destinations.length && { icon: MapPin, label: "Destinations", value: p.destinations.map((d) => d.name).join(", ") },
    p.startingCity && { icon: Plane, label: "Starts in", value: p.startingCity },
  ].filter(Boolean) as { icon: typeof MapPin; label: string; value: string }[];

  const enquiry = (
    <EnquiryForm
      compact
      title="Enquire about this trip"
      enquiryType="package"
      packageSlug={p.slug}
      packageTitle={p.title}
      whatsapp={settings.whatsapp}
    />
  );

  return (
    <>
      <PageHero
        title={p.title}
        eyebrow={p.region === "international" ? "International holiday" : "India holiday"}
        intro={p.summary}
        image={p.heroImage}
        size="lg"
        crumbs={[
          { label: "Packages", href: "/packages" },
          ...(primaryDest ? [{ label: primaryDest.name, href: `/destinations/${primaryDest.slug}` }] : []),
          { label: p.title, href: `/packages/${p.slug}` },
        ]}
      >
        {!!p.themes?.length && (
          <ul className="mt-6 flex flex-wrap gap-2">
            {p.themes.map((t) => (
              <li key={t} className="rounded-full border border-white/30 px-3.5 py-1 text-xs font-medium text-white/90">{t}</li>
            ))}
          </ul>
        )}
      </PageHero>

      {/* Quick facts strip */}
      <div className="border-b border-line bg-white">
        <Container className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <ul className="flex flex-wrap gap-x-8 gap-y-3">
            {facts.map(({ icon: Icon, label, value }) => (
              <li key={label} className="flex items-center gap-3">
                <Icon aria-hidden className="h-5 w-5 text-gold" />
                <span>
                  <span className="block text-[11px] uppercase tracking-wider text-muted">{label}</span>
                  <span className="block text-sm font-medium text-ink">{value}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-4">
            <div className="text-right">
              {price ? (
                <>
                  <span className="block text-[11px] uppercase tracking-wider text-muted">From</span>
                  <span className="text-2xl font-semibold text-ink">{price}</span>
                  {p.price?.basis && <span className="block text-xs text-muted">{p.price.basis}</span>}
                </>
              ) : (
                <span className="text-base font-medium text-ink">Price on request</span>
              )}
            </div>
            <a href="#enquire" className="rounded-full bg-gold px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gold-deep lg:hidden">
              Enquire
            </a>
          </div>
        </Container>
      </div>

      <Container className="grid gap-14 py-16 lg:grid-cols-[1fr_400px] lg:py-20">
        <div className="min-w-0">
          {p.isSample && (
            <div className="mb-10 rounded-2xl border border-dashed border-amber-600/50 bg-amber-50 p-5 text-sm text-amber-900">
              <SampleBadge className="mb-2" label="Sample package" />
              <p>This itinerary is placeholder content for design and testing. It is not a confirmed S2 Holidays offer.</p>
            </div>
          )}

          {!!p.highlights?.length && (
            <section aria-labelledby="highlights">
              <h2 id="highlights" className="text-4xl text-ink">Trip highlights</h2>
              <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                {p.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-card">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-deep"><Check aria-hidden className="h-3.5 w-3.5" /></span>
                    <span className="text-ink">{h}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {!!p.itinerary?.length && (
            <section aria-labelledby="itinerary" className="mt-16">
              <div className="flex items-end justify-between gap-4">
                <h2 id="itinerary" className="text-4xl text-ink">Day-wise itinerary</h2>
              </div>
              <ol className="relative mt-8 space-y-4 before:absolute before:bottom-6 before:left-[1.4rem] before:top-6 before:w-px before:bg-line">
                {p.itinerary.map((day, i) => (
                  <li key={`${day.day}-${i}`} className="relative">
                    <details className="group rounded-2xl bg-white shadow-card open:shadow-lift" open={i < 2}>
                      <summary className="flex cursor-pointer list-none items-center gap-4 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
                        <span className="relative z-10 flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-full bg-ink text-white">
                          <span className="text-[9px] uppercase tracking-wider text-white/70">Day</span>
                          <span className="-mt-0.5 text-base font-semibold leading-none">{day.day}</span>
                        </span>
                        <span className="flex-1 font-display text-2xl font-semibold text-ink">{day.title}</span>
                        <span aria-hidden className="text-2xl text-gold transition-transform group-open:rotate-45">+</span>
                      </summary>
                      <div className="px-5 pb-5 sm:pl-[5.25rem]">
                        {day.description && <p className="leading-relaxed text-ink-soft">{day.description}</p>}
                        {(!!day.meals?.length || day.overnight) && (
                          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                            {!!day.meals?.length && (
                              <span className="inline-flex items-center gap-1.5"><Utensils aria-hidden className="h-4 w-4 text-gold" /> {day.meals.join(", ")}</span>
                            )}
                            {day.overnight && (
                              <span className="inline-flex items-center gap-1.5"><Moon aria-hidden className="h-4 w-4 text-gold" /> Overnight: {day.overnight}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </details>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {(!!p.inclusions?.length || !!p.exclusions?.length) && (
            <section aria-labelledby="inclusions" className="mt-16">
              <h2 id="inclusions" className="text-4xl text-ink">What&apos;s included</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {!!p.inclusions?.length && (
                  <div className="rounded-2xl bg-white p-6 shadow-card">
                    <h3 className="text-2xl text-ink">Inclusions</h3>
                    <ul className="mt-4 space-y-2.5">
                      {p.inclusions.map((x) => (
                        <li key={x} className="flex gap-2.5 text-sm text-ink-soft"><Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-teal" /> {x}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {!!p.exclusions?.length && (
                  <div className="rounded-2xl bg-white p-6 shadow-card">
                    <h3 className="text-2xl text-ink">Exclusions</h3>
                    <ul className="mt-4 space-y-2.5">
                      {p.exclusions.map((x) => (
                        <li key={x} className="flex gap-2.5 text-sm text-ink-soft"><X aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-red-500/80" /> {x}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </section>
          )}

          {!!p.gallery?.length && (
            <section aria-labelledby="gallery" className="mt-16">
              <h2 id="gallery" className="text-4xl text-ink">Gallery</h2>
              <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {p.gallery.map((img, i) => (
                  <li key={i} className="relative aspect-[4/3] overflow-hidden rounded-2xl"><AppImage image={img} sizes="(min-width: 640px) 25vw, 50vw" /></li>
                ))}
              </ul>
            </section>
          )}

          {(p.importantNotes?.length || p.priceNote) && (
            <section aria-labelledby="notes" className="mt-16">
              <h2 id="notes" className="text-4xl text-ink">Good to know</h2>
              {p.priceNote && <p className="mt-4 text-ink-soft">{p.priceNote}</p>}
              <RichText value={p.importantNotes} className="mt-4" />
            </section>
          )}
        </div>

        <aside id="enquire" className="scroll-mt-24 lg:sticky lg:top-28 lg:self-start">{enquiry}</aside>
      </Container>

      {related.length > 0 && (
        <section className="border-t border-line py-20">
          <Container>
            <div className="mb-10 flex items-end justify-between gap-4">
              <h2 className="text-4xl text-ink">You may also like</h2>
              <Link href="/packages" className="text-sm font-medium text-gold hover:text-gold-deep">All packages →</Link>
            </div>
            <ul className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => <li key={r._id}><PackageCard pkg={r} /></li>)}
            </ul>
          </Container>
        </section>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TouristTrip",
          name: p.title,
          description: p.summary,
          url: `${siteUrl}/packages/${p.slug}`,
          touristType: p.themes,
          provider: { "@type": "TravelAgency", name: settings.companyName, url: siteUrl },
          ...(p.itinerary?.length
            ? {
                itinerary: {
                  "@type": "ItemList",
                  numberOfItems: p.itinerary.length,
                  itemListElement: p.itinerary.map((d, i) => ({
                    "@type": "ListItem",
                    position: i + 1,
                    item: { "@type": "TouristAttraction", name: `Day ${d.day}: ${d.title}`, description: d.description },
                  })),
                },
              }
            : {}),
          // Only publish an Offer when a real price has been entered in the CMS.
          ...(price && p.price?.amount
            ? { offers: { "@type": "Offer", price: p.price.amount, priceCurrency: p.price.currency || "INR", url: `${siteUrl}/packages/${p.slug}` } }
            : {}),
        }}
      />
    </>
  );
}
