import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { AppImage } from "@/components/ui/AppImage";
import { EnquiryBand } from "@/components/layout/EnquiryBand";
import { getService, getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Travel Services",
  description: "Mumbai sightseeing, car rental and tourist guide services from S2 Holidays.",
  path: "/services",
});

export default async function ServicesPage() {
  const [a, b, c, settings] = await Promise.all([
    getService("mumbai-sightseeing"),
    getService("car-rental"),
    getService("tourist-guide"),
    getSettings(),
  ]);
  const services = [a, b, c].filter((s) => s !== null);
  return (
    <>
      <PageHero title="Travel services" eyebrow="In and around Mumbai" intro="Local sightseeing, chauffeur-driven cars and guides." image={a?.heroImage} crumbs={[{ label: "Services", href: "/services" }]} />
      <section className="py-20">
        <Container>
          <ul className="grid gap-7 md:grid-cols-3">
            {services.map((s) => (
              <li key={s._id} data-reveal>
                <Link href={`/services/${s.key}`} className="group block overflow-hidden rounded-3xl bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-lift">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <AppImage image={s.heroImage} sizes="(min-width: 768px) 33vw, 100vw" className="transition-transform duration-[1.2s] group-hover:scale-105" />
                  </div>
                  <div className="p-7">
                    <h2 className="text-3xl text-ink">{s.title}</h2>
                    {s.tagline && <p className="mt-2 text-muted">{s.tagline}</p>}
                    <span className="mt-5 inline-block text-sm font-medium text-gold">Learn more →</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <EnquiryBand whatsapp={settings.whatsapp} />
    </>
  );
}
