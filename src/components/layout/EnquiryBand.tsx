import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { WhatsAppIcon } from "./WhatsAppFloat";
import { whatsappLink } from "@/lib/whatsapp";

export function EnquiryBand({
  whatsapp,
  title = "Tell us where you'd like to go",
  text = "Share your dates, number of travellers and the kind of trip you have in mind. We'll come back with an itinerary and quote.",
}: {
  whatsapp?: string;
  title?: string;
  text?: string;
}) {
  const wa = whatsappLink(whatsapp, "Hello S2 Holidays, I'd like help planning a holiday.");
  return (
    <section className="relative overflow-hidden bg-teal-deep py-20 sm:py-24">
      <div aria-hidden className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-gold/20 blur-3xl" />
      <div aria-hidden className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-teal/60 blur-3xl" />
      <Container className="relative text-center">
        <p data-reveal className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-soft">Start planning</p>
        <h2 data-reveal className="mx-auto mt-3 max-w-3xl text-4xl text-white sm:text-5xl">{title}</h2>
        <p data-reveal className="mx-auto mt-4 max-w-2xl text-lg text-white/75">{text}</p>
        <div data-reveal className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/contact#enquiry" variant="gold" className="px-8 py-3.5">Send an enquiry</ButtonLink>
          {wa && (
            <ButtonLink href={wa} external variant="whatsapp" className="px-8 py-3.5">
              <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
            </ButtonLink>
          )}
        </div>
      </Container>
    </section>
  );
}
