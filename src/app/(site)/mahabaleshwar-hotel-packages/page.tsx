import type { Metadata } from "next";
import { BedDouble, Bus, Check, Info, MapPin, Utensils } from "lucide-react";
import hotels from "@/data/mahabaleshwar-hotels.json";
import { PageHero } from "@/components/layout/PageHero";
import { EnquiryBand } from "@/components/layout/EnquiryBand";
import { WhatsAppIcon } from "@/components/layout/WhatsAppFloat";
import { Container } from "@/components/ui/Container";
import { getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";
import { whatsappLink } from "@/lib/whatsapp";

export const metadata: Metadata = pageMetadata({
  title: "Mahabaleshwar Hotel Packages",
  description: "Mahabaleshwar hotel packages for 2 and 3 nights with bus travel, meals and sightseeing – compare 30 hotels from budget to 3★ resorts by season.",
  path: "/mahabaleshwar-hotel-packages",
});

type Rate = { season: string; room: string; n2: Price3; n3: Price3 };
type Price3 = { couple: number | null; extraAdult: number | null; child: number | null };
type Hotel = { name: string; category: string; area: string | null; features: string[]; meals: string; notes: string[]; fromPrice: number | null; rates: Rate[] };

const CATEGORIES = [
  { key: "Budget", title: "Budget hotels" },
  { key: "Standard", title: "Standard hotels" },
  { key: "2★", title: "2★ hotels & resorts" },
  { key: "3★", title: "3★ hotels & resorts" },
];
const inr = (n: number | null) => (n ? `₹${n.toLocaleString("en-IN")}` : "On request");
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function bySeason(rates: Rate[]) {
  const groups: { season: string; rows: Rate[] }[] = [];
  for (const r of rates) {
    const g = groups.find((x) => x.season === r.season);
    if (g) g.rows.push(r);
    else groups.push({ season: r.season, rows: [r] });
  }
  return groups;
}

export default async function Page() {
  const settings = await getSettings();
  const list = hotels as Hotel[];
  return (
    <>
      <PageHero
        title="Mahabaleshwar hotel packages"
        eyebrow="Hotel packages"
        intro="Two- and three-night Mahabaleshwar holidays with return bus travel, your choice of hotel, meals and sightseeing. Compare prices by hotel, room and season."
        slides={settings.mahabaleshwarHeroSlides}
        crumbs={[{ label: "Mahabaleshwar hotel packages", href: "/mahabaleshwar-hotel-packages" }]}
        size="sm"
      />

      <section className="py-14 sm:py-16">
        <Container>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-3xl bg-white p-6 shadow-card lg:col-span-2">
              <h2 className="text-2xl text-ink">What the package includes</h2>
              <ul className="mt-4 space-y-3 text-muted">
                <li className="flex gap-3"><Bus aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-gold" />Return travel by AC seater bus (not Volvo, not sleeper).</li>
                <li className="flex gap-3"><BedDouble aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-gold" />2 or 3 nights at the hotel and room type you choose.</li>
                <li className="flex gap-3"><Utensils aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-gold" />Meals as per the hotel&apos;s plan – most include breakfast, lunch and dinner; hotels marked &ldquo;Breakfast only&rdquo; include breakfast.</li>
                <li className="flex gap-3"><MapPin aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-gold" />Sightseeing on two days by shared non-AC car (about 3 hours each), including Panchgani points such as Parsi Point and Table Land.</li>
              </ul>
            </div>
            <div className="rounded-3xl bg-sand-deep/60 p-6">
              <h2 className="flex items-center gap-2 text-xl text-ink"><Info aria-hidden className="h-5 w-5 text-gold" />How prices work</h2>
              <ul className="mt-4 space-y-2 text-sm text-ink/80">
                <li>• Prices are in ₹ <strong>per couple</strong> for the whole package.</li>
                <li>• <strong>Extra adult</strong> and <strong>child</strong> prices are per person, sharing the couple&apos;s room.</li>
                <li>• Rates change with dates – pick the row for your travel dates (dates are day.month.year).</li>
                <li>• All prices are subject to availability and confirmed by our team before booking.</li>
              </ul>
            </div>
          </div>

          <nav aria-label="Hotel categories" className="mt-10 flex flex-wrap gap-2">
            {CATEGORIES.filter((c) => list.some((h) => h.category === c.key)).map((c) => (
              <a key={c.key} href={`#${slug(c.key)}`} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:border-gold">
                {c.title} ({list.filter((h) => h.category === c.key).length})
              </a>
            ))}
          </nav>

          {CATEGORIES.map((c) => {
            const group = list.filter((h) => h.category === c.key);
            if (!group.length) return null;
            return (
              <div key={c.key} id={slug(c.key)} className="mt-12 scroll-mt-28">
                <h2 className="text-3xl text-ink">{c.title}</h2>
                <ul className="mt-6 space-y-4">
                  {group.map((h) => {
                    const wa = whatsappLink(settings.whatsapp, `Hello S2 Holidays, I'd like a Mahabaleshwar hotel package at ${h.name}. Travel dates: ___, travellers: ___.`);
                    return (
                      <li key={h.name}>
                        <details className="group rounded-3xl bg-white shadow-card open:ring-1 open:ring-gold/30">
                          <summary className="flex cursor-pointer list-none flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 [&::-webkit-details-marker]:hidden">
                            <div>
                              <h3 className="text-xl text-ink">{h.name}</h3>
                              <p className="mt-1 text-sm text-muted">
                                {[h.category === "Standard" ? null : h.category, h.area, h.meals].filter(Boolean).join(" · ")}
                              </p>
                              {!!h.features.length && (
                                <ul className="mt-2 flex flex-wrap gap-1.5">
                                  {h.features.map((f) => <li key={f} className="rounded-full bg-sand px-2.5 py-0.5 text-xs text-ink/80">{f}</li>)}
                                </ul>
                              )}
                            </div>
                            <div className="flex items-center gap-4 sm:text-right">
                              {h.fromPrice && (
                                <p className="text-sm text-muted">2 nights from<br /><span className="font-display text-2xl font-semibold text-ink">{inr(h.fromPrice)}</span> <span className="text-xs">per couple</span></p>
                              )}
                              <span className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink group-open:bg-ink group-open:text-white">
                                <span className="group-open:hidden">See prices</span><span className="hidden group-open:inline">Hide prices</span>
                              </span>
                            </div>
                          </summary>
                          <div className="border-t border-line px-5 pb-6 pt-4 sm:px-6">
                            {!!h.notes.length && (
                              <ul className="mb-4 space-y-1 text-sm text-ink/80">
                                {h.notes.map((n) => <li key={n} className="flex gap-2"><Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-gold" />{n}</li>)}
                              </ul>
                            )}
                            <p className="mb-2 text-xs text-muted sm:hidden">Swipe the table sideways to see 3-night prices →</p>
                            <div className="overflow-x-auto rounded-2xl border border-line">
                              <table className="w-full min-w-[640px] text-left text-sm">
                                <thead className="bg-sand text-xs uppercase tracking-wider text-ink/70">
                                  <tr>
                                    <th rowSpan={2} className="px-3 py-2 align-bottom">Room</th>
                                    <th colSpan={3} className="border-l border-line px-3 py-2 text-center">2 nights / 3 days</th>
                                    <th colSpan={3} className="border-l border-line px-3 py-2 text-center">3 nights / 4 days</th>
                                  </tr>
                                  <tr>
                                    {["Couple", "Extra adult", "Child", "Couple", "Extra adult", "Child"].map((t, i) => (
                                      <th key={i} className={`px-3 py-2 text-right ${i % 3 === 0 ? "border-l border-line" : ""}`}>{t}</th>
                                    ))}
                                  </tr>
                                </thead>
                                {bySeason(h.rates).map((g) => (
                                  <tbody key={g.season} className="border-t border-line">
                                    <tr><th colSpan={7} className="bg-white px-3 pt-3 text-left text-xs font-semibold text-gold-deep">{g.season}</th></tr>
                                    {g.rows.map((r, i) => (
                                      <tr key={i} className="text-ink/90">
                                        <td className="px-3 py-1.5">{r.room}</td>
                                        {[r.n2.couple, r.n2.extraAdult, r.n2.child, r.n3.couple, r.n3.extraAdult, r.n3.child].map((v, j) => (
                                          <td key={j} className={`px-3 py-1.5 text-right tabular-nums ${j % 3 === 0 ? "border-l border-line font-semibold" : ""}`}>{v ? inr(v) : "—"}</td>
                                        ))}
                                      </tr>
                                    ))}
                                  </tbody>
                                ))}
                              </table>
                            </div>
                            <p className="mt-2 text-xs text-muted">“—” = not offered for this room. Family rooms and suites are priced for the room as shown.</p>
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

          <div className="mt-14 rounded-3xl bg-white p-6 shadow-card">
            <h2 className="text-2xl text-ink">Good to know</h2>
            <ul className="mt-4 grid gap-2 text-sm text-ink/80 sm:grid-cols-2">
              <li>• The package starts with lunch on arrival day and ends with breakfast on departure day.</li>
              <li>• Usual check-in is around 11:00 am and check-out around 8:30–9:00 am (hotel-specific times are shown above).</li>
              <li>• Early check-in or late check-out is charged at actual.</li>
              <li>• A government photo ID is required for every guest at check-in.</li>
              <li>• Cancellation more than 14 days before arrival: 20% of the package is retained.</li>
              <li>• Cancellation 7–14 days before arrival: 30% retained; within 7 days: 100% retained.</li>
            </ul>
          </div>
        </Container>
      </section>

      <EnquiryBand whatsapp={settings.whatsapp} title="Need help choosing a hotel?" text="Tell us your dates, number of travellers and budget – we'll suggest the best Mahabaleshwar hotel and confirm availability." />
    </>
  );
}
