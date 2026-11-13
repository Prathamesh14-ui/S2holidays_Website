import type { Metadata } from "next";
import { BedDouble, Car, Check, Info, Ship } from "lucide-react";
import data from "@/data/goa-hotel-rates.json";
import { PageHero } from "@/components/layout/PageHero";
import { EnquiryBand } from "@/components/layout/EnquiryBand";
import { WhatsAppIcon } from "@/components/layout/WhatsAppFloat";
import { Container } from "@/components/ui/Container";
import { getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = pageMetadata({
  title: "Goa Hotel Rates",
  description: "Goa hotel rates per room per night in Baga, Calangute, Candolim and Arpora – breakfast or breakfast + dinner plans by season, plus airport transfers and activities.",
  path: "/goa-hotel-rates",
});

type Plan = { double: number | null; extraAdult: number | null; childBed: number | null; child: number | null };
type Rate = { room: string; season: string; cp: Plan; map: Plan };
type Hotel = { name: string; category: string; area: string | null; notes: string[]; fromPrice: number | null; rates: Rate[] };
type Transfer = { pickup?: number; drop?: number; day?: number | null };

const CATEGORIES = [
  { key: "Budget", title: "Budget hotels" },
  { key: "Deluxe", title: "Deluxe hotels" },
  { key: "Premium", title: "Premium hotels" },
  { key: "Hotel only", title: "Hotel-only stays (outside Baga–Calangute)" },
];
const inr = (n: number | null | undefined) => (n ? `₹${n.toLocaleString("en-IN")}` : "—");
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function bySeason(rates: Rate[]) {
  const rooms: { room: string; rows: Rate[] }[] = [];
  for (const r of rates) {
    const g = rooms.find((x) => x.room === r.room);
    if (g) g.rows.push(r);
    else rooms.push({ room: r.room, rows: [r] });
  }
  return rooms;
}

export default async function Page() {
  const settings = await getSettings();
  const hotels = data.hotels as Hotel[];
  const { vehicles, rows: transfers } = data.transport as { vehicles: string[]; rows: { place: string; prices: Transfer[] }[] };
  return (
    <>
      <PageHero
        title="Goa hotel rates"
        eyebrow="Hotel rates"
        intro="Room rates for 42 Goa hotels – from budget stays near Baga and Calangute to premium resorts – with breakfast or breakfast + dinner plans for every season."
        slides={settings.goaHeroSlides}
        crumbs={[{ label: "Goa hotel rates", href: "/goa-hotel-rates" }]}
        size="sm"
      />

      <section className="py-14 sm:py-16">
        <Container>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-card lg:col-span-2">
              <h2 className="text-2xl text-ink">How to read the rates</h2>
              <ul className="mt-4 space-y-3 text-muted">
                <li className="flex gap-3"><BedDouble aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-gold" />Prices are in ₹ <strong className="text-ink">per room, per night, for two adults</strong>.</li>
                <li className="flex gap-3"><Check aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-gold" /><span><strong className="text-ink">Breakfast</strong> = room with breakfast (CP). <strong className="text-ink">Breakfast + dinner</strong> = room with breakfast and dinner (MAP).</span></li>
                <li className="flex gap-3"><Check aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-gold" />Extra adult and child prices are per person, per night, sharing the room. &ldquo;Child + bed&rdquo; includes an extra mattress.</li>
                <li className="flex gap-3"><Check aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-gold" />Rates change by season – pick the row for your dates (day.month.year). &ldquo;—&rdquo; means not available for those dates.</li>
              </ul>
            </div>
            <div className="rounded-3xl bg-sand-deep/60 p-6">
              <h2 className="flex items-center gap-2 text-xl text-ink"><Info aria-hidden className="h-5 w-5 text-gold" />Good to know</h2>
              <ul className="mt-4 space-y-2 text-sm text-ink/80">
                <li>• Diwali, Christmas–New Year, Republic Day, Holi and long weekends have separate (higher) rates.</li>
                <li>• All rates are subject to availability and confirmed by our team before booking.</li>
                <li>• Transfers and activities can be added – prices are below the hotel list.</li>
              </ul>
            </div>
          </div>

          <nav aria-label="Jump to" className="mt-10 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <a key={c.key} href={`#${slug(c.key)}`} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:border-gold">
                {c.title.replace(" (outside Baga–Calangute)", "")} ({hotels.filter((h) => h.category === c.key).length})
              </a>
            ))}
            <a href="#transfers" className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:border-gold">Transfers</a>
            <a href="#activities" className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:border-gold">Activities</a>
          </nav>

          {CATEGORIES.map((c) => {
            const group = hotels.filter((h) => h.category === c.key);
            if (!group.length) return null;
            return (
              <div key={c.key} id={slug(c.key)} className="mt-12 scroll-mt-28">
                <h2 className="text-3xl text-ink">{c.title}</h2>
                {c.key === "Hotel only" && <p className="mt-2 text-sm text-muted">Hotel stay only – transfers and sightseeing are quoted separately for these locations.</p>}
                <ul className="mt-6 space-y-4">
                  {group.map((h) => {
                    const wa = whatsappLink(settings.whatsapp, `Hello S2 Holidays, I'd like a quote for ${h.name}, Goa. Travel dates: ___, guests: ___.`);
                    const hasPrices = h.rates.some((r) => r.cp.double || r.map.double);
                    return (
                      <li key={h.name}>
                        <details className="group rounded-3xl bg-white shadow-card open:ring-1 open:ring-gold/30">
                          <summary className="flex cursor-pointer list-none flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 [&::-webkit-details-marker]:hidden">
                            <div>
                              <h3 className="text-xl text-ink">{h.name}</h3>
                              <p className="mt-1 text-sm text-muted">{[h.category, h.area].filter(Boolean).join(" · ")}</p>
                              {!!h.notes.length && (
                                <ul className="mt-2 flex flex-wrap gap-1.5">
                                  {h.notes.map((n) => <li key={n} className="rounded-full bg-sand px-2.5 py-0.5 text-xs text-ink/80">{n}</li>)}
                                </ul>
                              )}
                            </div>
                            <div className="flex items-center gap-4 sm:text-right">
                              <p className="text-sm text-muted">
                                {h.fromPrice ? (<>From<br /><span className="font-display text-2xl font-semibold text-ink">{inr(h.fromPrice)}</span> <span className="text-xs">per night</span></>) : "Rates on request"}
                              </p>
                              <span className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink group-open:bg-ink group-open:text-white">
                                <span className="group-open:hidden">See rates</span><span className="hidden group-open:inline">Hide rates</span>
                              </span>
                            </div>
                          </summary>
                          <div className="border-t border-line px-5 pb-6 pt-4 sm:px-6">
                            {hasPrices ? (
                              <>
                                <p className="mb-2 text-xs text-muted sm:hidden">Swipe the table sideways to see the breakfast + dinner rates →</p>
                                <div className="overflow-x-auto rounded-2xl border border-line">
                                  <table className="w-full min-w-[760px] text-left text-sm">
                                    <thead className="bg-sand text-xs uppercase tracking-wider text-ink/70">
                                      <tr>
                                        <th rowSpan={2} className="px-3 py-2 align-bottom">Season</th>
                                        <th colSpan={4} className="border-l border-line px-3 py-2 text-center">Breakfast (CP)</th>
                                        <th colSpan={4} className="border-l border-line px-3 py-2 text-center">Breakfast + dinner (MAP)</th>
                                      </tr>
                                      <tr>
                                        {["Room (2 adults)", "Extra adult", "Child + bed", "Child", "Room (2 adults)", "Extra adult", "Child + bed", "Child"].map((t, i) => (
                                          <th key={i} className={`px-3 py-2 text-right ${i % 4 === 0 ? "border-l border-line" : ""}`}>{t}</th>
                                        ))}
                                      </tr>
                                    </thead>
                                    {bySeason(h.rates).map((g) => (
                                      <tbody key={g.room} className="border-t border-line">
                                        <tr><th colSpan={9} className="bg-white px-3 pt-3 text-left text-xs font-semibold text-gold-deep">{g.room}</th></tr>
                                        {g.rows.map((r, i) => (
                                          <tr key={i} className="text-ink/90">
                                            <td className="px-3 py-1.5">{r.season}</td>
                                            {[r.cp.double, r.cp.extraAdult, r.cp.childBed, r.cp.child, r.map.double, r.map.extraAdult, r.map.childBed, r.map.child].map((v, j) => (
                                              <td key={j} className={`px-3 py-1.5 text-right tabular-nums ${j % 4 === 0 ? "border-l border-line font-semibold" : ""}`}>{inr(v)}</td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    ))}
                                  </table>
                                </div>
                              </>
                            ) : (
                              <p className="text-sm text-muted">Rates for this hotel are shared on request – message us with your dates.</p>
                            )}
                            {wa && (
                              <a href={wa} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-whatsapp px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90">
                                <WhatsAppIcon className="h-4 w-4" /> Enquire about {h.name}
                              </a>
                            )}
                          </div>
                        </details>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}

          <div id="transfers" className="mt-14 scroll-mt-28 rounded-3xl bg-white p-6 shadow-card">
            <h2 className="flex items-center gap-2 text-2xl text-ink"><Car aria-hidden className="h-6 w-6 text-gold" />Transfers &amp; sightseeing by private vehicle</h2>
            <p className="mt-2 text-sm text-muted">Price per vehicle, one way, to or from hotels in Baga, Calangute and Candolim. Sightseeing rows are per vehicle for a full day.</p>
            <p className="mt-3 text-xs text-muted sm:hidden">Swipe the table sideways to see larger vehicles →</p>
            <div className="mt-3 overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[1100px] text-left text-sm">
                <thead className="bg-sand text-xs uppercase tracking-wider text-ink/70">
                  <tr>
                    <th className="sticky left-0 bg-sand px-3 py-2">From / to</th>
                    {vehicles.map((v) => <th key={v} className="px-3 py-2 text-right">{v}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {transfers.map((t) => (
                    <tr key={t.place} className="border-t border-line">
                      <td className="sticky left-0 bg-white px-3 py-1.5 font-medium text-ink">{t.place}</td>
                      {t.prices.map((p, i) => (
                        <td key={i} className="px-3 py-1.5 text-right tabular-nums text-ink/90">
                          {p.day !== undefined ? inr(p.day) : p.pickup === p.drop ? inr(p.pickup) : `${inr(p.pickup)} / ${inr(p.drop)}`}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="mt-4 space-y-1 text-sm text-ink/80">
              <li>• Where pickup and drop prices differ, both are shown as pickup / drop.</li>
              <li>• Hotels in Anjuna and Vagator cost extra per way: ₹200 for a small car or Ertiga, ₹500 for an Innova or Winger, ₹1,000 for a coach.</li>
              <li>• Parking fees at the airport, stations or sights are paid by guests. Transfer rates do not apply on peak dates such as Diwali and Christmas.</li>
            </ul>
          </div>

          <div id="activities" className="mt-8 scroll-mt-28 rounded-3xl bg-white p-6 shadow-card">
            <h2 className="flex items-center gap-2 text-2xl text-ink"><Ship aria-hidden className="h-6 w-6 text-gold" />Activities</h2>
            <p className="mt-2 text-sm text-muted">Price per person.</p>
            <ul className="mt-4 divide-y divide-line">
              {data.activities.map((a) => (
                <li key={a.name} className="flex items-center justify-between gap-4 py-2 text-sm">
                  <span className="text-ink">{a.name}</span>
                  <span className="font-semibold tabular-nums text-ink">{inr(a.price)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">Shared waterfall trips and dinner cruises start from the Arpora junction meeting point. Rates are for hotels in Baga, Calangute and Candolim.</p>
          </div>
        </Container>
      </section>

      <EnquiryBand whatsapp={settings.whatsapp} title="Need help choosing a Goa hotel?" text="Tell us your dates, number of guests and budget – we'll suggest the right hotel and confirm the best rate." />
    </>
  );
}
