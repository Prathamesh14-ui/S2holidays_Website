import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppFloat } from "@/components/layout/WhatsAppFloat";
import { SampleBanner } from "@/components/layout/SampleBanner";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { RevealObserver } from "@/components/ui/Reveal";
import { JsonLd } from "@/components/ui/JsonLd";
import { getDestinations, getSettings, usingSampleContent } from "@/lib/content";
import { serviceLinks, type NavItem } from "@/lib/navigation";
import { hideSampleBanner, siteUrl } from "@/lib/env";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, destinations] = await Promise.all([getSettings(), getDestinations()]);
  const toLink = (d: (typeof destinations)[number]) => ({ label: d.name, href: `/destinations/${d.slug}` });

  const nav: NavItem[] = [
    { label: "Domestic", href: "/destinations/domestic", children: destinations.filter((d) => d.region === "domestic").slice(0, 7).map(toLink) },
    { label: "International", href: "/destinations/international", children: destinations.filter((d) => d.region === "international").slice(0, 7).map(toLink) },
    { label: "Packages", href: "/packages" },
    { label: "Services", href: "/services", children: serviceLinks },
    { label: "About", href: "/about" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/contact" },
  ];

  const showBanner = usingSampleContent && !hideSampleBanner;

  return (
    <>
      <a href="#main" className="sr-only z-[100] rounded bg-white px-4 py-2 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <Header nav={nav} companyName={settings.companyName} phone={settings.phone} notice={
          showBanner || settings.announcement ? (
            <>
              {settings.announcement && <AnnouncementBar announcement={settings.announcement} />}
              {showBanner && <SampleBanner />}
            </>
          ) : undefined
        } />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      <WhatsAppFloat number={settings.whatsapp} companyName={settings.companyName} />
      <RevealObserver />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          name: settings.companyName,
          url: siteUrl,
          ...(settings.description ? { description: settings.description } : {}),
          ...(settings.phone ? { telephone: settings.phone } : {}),
          ...(settings.email ? { email: settings.email } : {}),
          ...(settings.address ? { address: settings.address } : {}),
          ...(settings.socials?.length ? { sameAs: settings.socials.map((s) => s.url) } : {}),
        }}
      />
    </>
  );
}
