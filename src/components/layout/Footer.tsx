import Link from "next/link";
import { Mail, MapPin, Phone, Clock } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { footerLinks } from "@/lib/navigation";
import type { SiteSettings } from "@/lib/types";
import { SampleBadge } from "@/components/ui/SampleBadge";

export function Footer({ settings }: { settings: SiteSettings }) {
  const hasContact = settings.phone || settings.email || settings.address;
  return (
    <footer className="bg-ink text-white/75">
      <Container className="grid gap-12 py-16 lg:grid-cols-[1.3fr_2fr] lg:py-20">
        <div>
          <Link href="/" className="flex items-baseline gap-1" aria-label={`${settings.companyName} home`}>
            <span className="font-display text-4xl font-bold text-white">S2</span>
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-soft">Holidays</span>
          </Link>
          {settings.tagline && <p className="mt-4 max-w-sm leading-relaxed">{settings.tagline}</p>}
          <ul className="mt-6 space-y-3 text-sm">
            {settings.phone && (
              <li className="flex gap-3">
                <Phone aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`} className="hover:text-white">{settings.phone}</a>
              </li>
            )}
            {settings.email && (
              <li className="flex gap-3">
                <Mail aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <a href={`mailto:${settings.email}`} className="hover:text-white">{settings.email}</a>
              </li>
            )}
            {settings.address && (
              <li className="flex gap-3">
                <MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span className="whitespace-pre-line">{settings.address}</span>
              </li>
            )}
            {settings.officeHours && (
              <li className="flex gap-3">
                <Clock aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                <span>{settings.officeHours}</span>
              </li>
            )}
            {!hasContact && (
              <li className="flex items-center gap-2">
                <SampleBadge label="Placeholder" /> Contact details will appear once verified.
              </li>
            )}
          </ul>
          {!!settings.socials?.length && (
            <ul className="mt-6 flex flex-wrap gap-3">
              {settings.socials.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="rounded-full border border-white/20 px-4 py-1.5 text-sm hover:border-gold hover:text-white">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="grid gap-10 sm:grid-cols-3">
          {footerLinks.map((col) => (
            <div key={col.title}>
              <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.25em] text-gold-soft">{col.title}</h2>
              <ul className="mt-5 space-y-3 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="transition-colors hover:text-white">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-3 py-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {settings.legalName || settings.companyName}. All rights reserved.</p>
          <ul className="flex gap-5">
            <li><Link href="/privacy-policy" className="hover:text-white">Privacy policy</Link></li>
            <li><Link href="/terms" className="hover:text-white">Terms &amp; conditions</Link></li>
            <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
          </ul>
        </Container>
      </div>
    </footer>
  );
}
