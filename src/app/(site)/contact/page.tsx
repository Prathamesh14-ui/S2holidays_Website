import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { WhatsAppIcon } from "@/components/layout/WhatsAppFloat";
import { getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description: "Send S2 Holidays a travel enquiry, call or chat on WhatsApp.",
  path: "/contact",
});

export default async function ContactPage() {
  const s = await getSettings();
  const wa = whatsappLink(s.whatsapp, "Hello S2 Holidays, I'd like help planning a holiday.");
  const items = [
    s.phone && { icon: Phone, label: "Call", value: s.phone, href: `tel:${s.phone.replace(/[^\d+]/g, "")}` },
    s.email && { icon: Mail, label: "Email", value: s.email, href: `mailto:${s.email}` },
    s.address && { icon: MapPin, label: "Office", value: s.address, href: s.mapUrl },
    s.officeHours && { icon: Clock, label: "Hours", value: s.officeHours },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];

  return (
    <>
      <PageHero title="Contact us" eyebrow="Get in touch" intro="Tell us about your trip — we'll reply with ideas, an itinerary and a quote." image={s.heroImage} size="sm" crumbs={[{ label: "Contact", href: "/contact" }]} />
      <section className="py-16 sm:py-20">
        <Container className="grid gap-12 lg:grid-cols-[360px_1fr]">
          <div className="space-y-5">
            {items.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex gap-4 rounded-2xl bg-white p-5 shadow-card">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold-soft text-gold-deep"><Icon aria-hidden className="h-5 w-5" /></span>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
                  {href ? (
                    <a href={href} className="whitespace-pre-line font-medium text-ink hover:text-gold" {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{value}</a>
                  ) : (
                    <p className="whitespace-pre-line font-medium text-ink">{value}</p>
                  )}
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="rounded-2xl border border-dashed border-amber-600/50 bg-amber-50 p-5 text-sm text-amber-900">
                <SampleBadge className="mb-2" label="Placeholder" />
                <p>Phone, email, office address and hours will appear here once S2 Holidays confirms them in the CMS (Site settings).</p>
              </div>
            )}
            {wa && (
              <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 rounded-2xl bg-whatsapp p-5 text-white shadow-card transition hover:brightness-110">
                <WhatsAppIcon className="h-8 w-8" />
                <span><span className="block text-xs uppercase tracking-wider text-white">WhatsApp</span><span className="font-medium">Chat with us now</span></span>
              </a>
            )}
          </div>
          <div id="enquiry" className="scroll-mt-28">
            <EnquiryForm title="Send a travel enquiry" whatsapp={s.whatsapp} />
          </div>
        </Container>
      </section>
    </>
  );
}
