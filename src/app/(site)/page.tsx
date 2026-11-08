import Link from "next/link";
import type { Metadata } from "next";
import { Car, Compass, Globe2, Landmark, Mountain, Quote } from "lucide-react";
import { AppImage } from "@/components/ui/AppImage";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { PackageCard } from "@/components/packages/PackageCard";
import { DestinationCard } from "@/components/packages/DestinationCard";
import { EnquiryBand } from "@/components/layout/EnquiryBand";
import { TripFinder } from "@/components/home/TripFinder";
import { HeroSlideshow } from "@/components/home/HeroSlideshow";
import type { HeroSlide } from "@/lib/types";
import { getDestinations, getFeaturedPackages, getOfferPackages, getPackages, getPosts, getService, getSettings, getTestimonials } from "@/lib/content";
import { formatDate, cn } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = {
  ...pageMetadata({
    title: "S2 Holidays — Domestic & International Holiday Packages",
    description:
      "Plan domestic and international holidays, Mumbai sightseeing, car rentals and local guides with S2 Holidays. Send an enquiry or chat on WhatsApp.",
    path: "/",
  }),
  title: { absolute: "S2 Holidays — Domestic & International Holiday Packages" },
};

const pillars = [
  { icon: Mountain, title: "Domestic holidays", text: "Hills, beaches, heritage and backwaters across India.", href: "/destinations/domestic" },
  { icon: Globe2, title: "International holidays", text: "City breaks, islands and multi-country tours.", href: "/destinations/international" },
  { icon: Landmark, title: "Mumbai sightseeing", text: "Half and full-day city tours.", href: "/services/mumbai-sightseeing" },
  { icon: Car, title: "Car rental", text: "Transfers, local hire and outstation trips.", href: "/services/car-rental" },
  { icon: Compass, title: "Tourist guides", text: "Local guides for sightseeing.", href: "/services/tourist-guide" },
];

export default async function HomePage() {
  const [settings, destinations, featured, allPackages, posts, testimonials, mumbai, offers] = await Promise.all([
    getSettings(),
    getDestinations(),
    getFeaturedPackages(6),
    getPackages(),
    getPosts(),
    getTestimonials(),
    getService("mumbai-sightseeing"),
    getOfferPackages(6),
  ]);
  const countFor = (slug: string) => allPackages.filter((p) => p.destinations.some((d) => d.slug === slug)).length;
  const pick = (region: "domestic" | "international") => {
    const list = destinations.filter((d) => d.region === region);
    return [...list.filter((d) => d.featured), ...list.filter((d) => !d.featured)].slice(0, 5);
  };
  // Hero slideshow: CMS slides → single hero image → destination photos (featured first)
  const destinationSlides: HeroSlide[] = [...destinations.filter((d) => d.featured), ...destinations.filter((d) => !d.featured)]
    .filter((d) => d.heroImage)
    .slice(0, 6)
    .map((d) => ({ image: d.heroImage!, caption: d.name, href: `/destinations/${d.slug}` }));
  const heroSlides: HeroSlide[] = settings.heroSlides?.length
    ? settings.heroSlides
    : settings.heroImage
      ? [{ image: settings.heroImage }]
      : destinationSlides;
  const domestic = pick("domestic");
  const international = pick("international");

  return (
    <>
      {/* HERO */}
      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-ink">
        <HeroSlideshow slides={heroSlides} />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-ink/85 via-ink/50 to-ink/10" />
        <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink/60 to-transparent" />
        <Container className="pb-24 pt-40">
          <p className="animate-fade-up text-xs font-semibold uppercase tracking-[0.35em] text-gold-soft">
            {settings.tagline || "Holidays across India and the world"}
          </p>
          <h1 className="mt-5 max-w-5xl animate-fade-up text-balance text-6xl leading-[1.02] text-white [animation-delay:120ms] sm:text-7xl lg:text-8xl">
            {settings.heroHeading || "Journeys crafted around you"}
          </h1>
          {settings.heroSubheading && (
            <p className="mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-white/80 [animation-delay:240ms] sm:text-xl">
              {settings.heroSubheading}
            </p>
          )}
          <div className="animate-fade-up [animation-delay:360ms]">
            <TripFinder destinations={destinations} />
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/75">
              <Link href="/destinations/domestic" className="underline-offset-4 hover:text-white hover:underline">India holidays</Link>
              <Link href="/destinations/international" className="underline-offset-4 hover:text-white hover:underline">International holidays</Link>
              <Link href="/services/mumbai-sightseeing" className="underline-offset-4 hover:text-white hover:underline">Mumbai sightseeing</Link>
            </div>
          </div>
        </Container>
      </section>

      {/* SERVICES PILLARS */}
      <section aria-labelledby="pillars-title" className="relative z-10 -mt-14">
        <Container>
          <h2 id="pillars-title" className="sr-only">What we offer</h2>
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-line shadow-lift sm:grid-cols-3 lg:grid-cols-5">
            {pillars.map(({ icon: Icon, ...p }, i) => (
              <li key={p.href} className={cn("bg-white", i === pillars.length - 1 && "col-span-2 sm:col-span-1")}>
                <Link href={p.href} className="group flex h-full flex-col gap-3 p-6 transition-colors hover:bg-sand">
                  <Icon aria-hidden className="h-7 w-7 text-gold transition-transform duration-500 group-hover:-translate-y-0.5" strokeWidth={1.5} />
                  <span className="font-display text-xl font-semibold text-ink">{p.title}</span>
                  <span className="text-sm leading-relaxed text-muted">{p.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* FEATURED PACKAGES (hidden until at least one package exists) */}
      {featured.length > 0 && (
      <section className="py-24 sm:py-32">
        <Container>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionHeading eyebrow="Featured holidays" title="Trips worth packing for" intro="A selection of itineraries to start from. Every trip can be adjusted to your dates and pace." />
            <ButtonLink href="/packages" variant="outline" className="shrink-0">All packages</ButtonLink>
          </div>
          <ul className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p, i) => (
              <li key={p._id} data-reveal style={{ transitionDelay: `${(i % 3) * 90}ms` }}>
                <PackageCard pkg={p} />
              </li>
            ))}
          </ul>
        </Container>
      </section>
      )}

      {/* SPECIAL OFFERS (only while at least one offer is live) */}
      {offers.length > 0 && (
        <section aria-labelledby="offers-title" className="bg-offer/[0.06] py-20 sm:py-24">
          <Container>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div data-reveal className="max-w-2xl">
                <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-offer">Limited time</p>
                <h2 id="offers-title" className="text-4xl leading-[1.1] text-ink sm:text-5xl">Special offers</h2>
                <p className="mt-4 text-base leading-relaxed text-muted sm:text-lg">Seasonal deals on selected holidays — book before they end.</p>
              </div>
              <ButtonLink href="/packages?offer=1" variant="outline" className="shrink-0">All offers</ButtonLink>
            </div>
            <ul className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {offers.map((p, i) => (
                <li key={p._id} data-reveal style={{ transitionDelay: `${(i % 3) * 90}ms` }}>
                  <PackageCard pkg={p} />
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* DOMESTIC */}
      {domestic.length > 0 && (
        <section className={cn("pb-24 sm:pb-32", offers.length > 0 && "pt-24 sm:pt-32")}>
          <Container>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading eyebrow="Discover India" title="From the Himalaya to the backwaters" />
              <ButtonLink href="/destinations/domestic" variant="outline" className="shrink-0">All India destinations</ButtonLink>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-6">
              {domestic.map((d, i) => (
                <div key={d._id} data-reveal className={cn(i < 2 ? "md:col-span-3" : "md:col-span-2")}>
                  <DestinationCard destination={d} size={i < 2 ? "lg" : "md"} packageCount={countFor(d.slug)} className="h-full" />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* INTERNATIONAL */}
      {international.length > 0 && (
        <section className="bg-ink py-24 sm:py-32">
          <Container>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading light eyebrow="Beyond borders" title="International escapes" intro="Island resorts, city lights and alpine scenery." />
              <ButtonLink href="/destinations/international" variant="ghost-light" className="shrink-0">All international</ButtonLink>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-6">
              {international.map((d, i) => (
                <div key={d._id} data-reveal className={cn(i < 2 ? "md:col-span-3" : "md:col-span-2")}>
                  <DestinationCard destination={d} size={i < 2 ? "lg" : "md"} packageCount={countFor(d.slug)} className="h-full" />
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* MUMBAI SERVICES */}
      <section className="py-24 sm:py-32">
        <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div data-reveal className="relative aspect-[4/5] overflow-hidden rounded-[2rem] shadow-lift sm:aspect-[5/4] lg:aspect-[4/5]">
            <AppImage image={mumbai?.heroImage} alt="Mumbai" sizes="(min-width: 1024px) 50vw, 100vw" />
            <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/90 p-5 backdrop-blur sm:right-auto sm:max-w-xs">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Based in Mumbai</p>
              <p className="mt-1 font-display text-2xl font-semibold text-ink">Local services, on the ground</p>
            </div>
          </div>
          <div>
            <SectionHeading eyebrow="In and around Mumbai" title="Sightseeing, cars and guides" intro="Whether you're visiting the city or setting off from it, we can arrange the local travel." />
            <ul className="mt-10 space-y-4">
              {pillars.slice(2).map(({ icon: Icon, ...p }) => (
                <li key={p.href} data-reveal>
                  <Link href={p.href} className="group flex items-start gap-5 rounded-2xl border border-line bg-white p-5 transition-all hover:border-gold/50 hover:shadow-card">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-deep">
                      <Icon aria-hidden className="h-5 w-5" />
                    </span>
                    <span>
                      <span className="block font-display text-2xl font-semibold text-ink">{p.title}</span>
                      <span className="mt-1 block text-sm text-muted">{p.text}</span>
                    </span>
                    <span aria-hidden className="ml-auto self-center text-gold transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* VALUES */}
      {!!settings.values?.length && (
        <section className="border-y border-line bg-sand-deep/50 py-24">
          <Container>
            <SectionHeading align="center" eyebrow="How we plan" title="Holidays, handled with care" />
            {settings.isSample && (
              <p className="mt-4 text-center"><SampleBadge label="Sample wording — confirm with S2 Holidays" /></p>
            )}
            <ul className="mt-14 grid gap-10 md:grid-cols-3">
              {settings.values.map((v, i) => (
                <li key={v.title} data-reveal className="text-center">
                  <span className="font-display text-5xl text-gold/70">0{i + 1}</span>
                  <h3 className="mt-3 text-2xl text-ink">{v.title}</h3>
                  {v.description && <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted">{v.description}</p>}
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* TESTIMONIALS — only verified, consented reviews from the CMS */}
      {testimonials.length > 0 && (
        <section className="py-24 sm:py-32">
          <Container>
            <SectionHeading align="center" eyebrow="Traveller stories" title="In their words" />
            <ul className="mt-14 grid gap-6 md:grid-cols-3">
              {testimonials.slice(0, 3).map((t) => (
                <li key={t._id} data-reveal>
                  <figure className="flex h-full flex-col rounded-3xl bg-white p-8 shadow-card">
                    <Quote aria-hidden className="h-8 w-8 text-gold/60" />
                    <blockquote className="mt-4 flex-1 font-display text-xl leading-relaxed text-ink">“{t.quote}”</blockquote>
                    <figcaption className="mt-6 text-sm">
                      <span className="font-semibold text-ink">{t.name}</span>
                      {t.location && <span className="text-muted"> · {t.location}</span>}
                      {t.tripName && <span className="block text-muted">{t.tripName}</span>}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* JOURNAL */}
      {posts.length > 0 && (
        <section className={cn("pb-24 sm:pb-32", testimonials.length === 0 && "pt-24 sm:pt-32")}>
          <Container>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <SectionHeading eyebrow="Travel journal" title="Ideas and practical tips" />
              <ButtonLink href="/blog" variant="outline" className="shrink-0">Read the journal</ButtonLink>
            </div>
            <ul className="mt-12 grid gap-8 md:grid-cols-3">
              {posts.slice(0, 3).map((post) => (
                <li key={post._id} data-reveal>
                  <article className="group relative">
                    <div className="relative aspect-[3/2] overflow-hidden rounded-3xl">
                      <AppImage image={post.coverImage} alt={post.title} sizes="(min-width: 768px) 33vw, 100vw" className="transition-transform duration-[1.2s] group-hover:scale-105" />
                    </div>
                    <p className="mt-5 text-xs uppercase tracking-wider text-muted">
                      {formatDate(post.publishedAt)}{post.categories?.[0] && ` · ${post.categories[0]}`}
                    </p>
                    <h3 className="mt-2 text-2xl leading-snug text-ink transition-colors group-hover:text-gold-deep">
                      <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">{post.title}</Link>
                    </h3>
                    {post.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted">{post.excerpt}</p>}
                  </article>
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      <EnquiryBand whatsapp={settings.whatsapp} />
    </>
  );
}
