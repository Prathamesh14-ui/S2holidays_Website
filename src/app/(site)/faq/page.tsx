import type { Metadata } from "next";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { JsonLd } from "@/components/ui/JsonLd";
import { EnquiryBand } from "@/components/layout/EnquiryBand";
import { getFaqs, getSettings, usingSampleContent } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Frequently Asked Questions",
  description: "Answers to common questions about booking holidays and services with S2 Holidays.",
  path: "/faq",
});

export default async function FaqPage() {
  const [faqs, settings] = await Promise.all([getFaqs(), getSettings()]);
  const groups = [...new Set(faqs.map((f) => f.category || "General"))];
  return (
    <>
      <PageHero title="Frequently asked questions" eyebrow="Help" size="sm" image={settings.heroImage} crumbs={[{ label: "FAQ", href: "/faq" }]} />
      <section className="py-16 sm:py-20">
        <Container className="max-w-3xl">
          {usingSampleContent && <SampleBadge className="mb-6" label="Sample answers — to be confirmed" />}
          {groups.map((g) => (
            <div key={g} className="mb-12">
              <h2 className="mb-5 text-3xl text-ink">{g}</h2>
              <div className="divide-y divide-line rounded-2xl bg-white shadow-card">
                {faqs.filter((f) => (f.category || "General") === g).map((f) => (
                  <details key={f.question} className="group p-5 sm:p-6">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-medium text-ink [&::-webkit-details-marker]:hidden">
                      {f.question}
                      <span aria-hidden className="text-2xl text-gold transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-3 whitespace-pre-line leading-relaxed text-muted">{f.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </Container>
      </section>
      {!usingSampleContent && faqs.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
          }}
        />
      )}
      <EnquiryBand whatsapp={settings.whatsapp} title="Still have a question?" text="Send us a message and we'll get back to you." />
    </>
  );
}
