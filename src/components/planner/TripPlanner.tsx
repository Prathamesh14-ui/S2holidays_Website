"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, CalendarDays, Car, Check, Hotel, MapPin, Minus, Plus, Printer, Send, Trash2, Users, Utensils } from "lucide-react";
import { buildDays, calculatePrice, chargeablePax, formatDay, planText, totalNights } from "@/lib/planner/engine";
import { HOTEL_CATEGORIES, type PlannerDestination, type TripChoice } from "@/lib/planner/types";
import { EnquiryForm } from "@/components/forms/EnquiryForm";
import { WhatsAppIcon } from "@/components/layout/WhatsAppFloat";
import { buttonClass } from "@/components/ui/Button";
import { whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/format";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const MAX_NIGHTS = 21;

function initialChoice(d: PlannerDestination): TripChoice {
  const first = d.places[0];
  return {
    startDate: undefined,
    adults: 2,
    children: 0,
    infants: 0,
    rooms: 1,
    hotel: "standard",
    meal: d.mealPlans[0]?.name,
    vehicle: d.vehicles[0]?.name,
    stops: first ? [{ placeKey: first.key, nights: first.defaultNights ?? 2, sights: (first.sightseeing ?? []).map((s) => s.name) }] : [],
  };
}

function Stepper({ value, onChange, min, max, label }: { value: number; onChange: (v: number) => void; min: number; max: number; label: string }) {
  return (
    <div className="inline-flex items-center rounded-full border border-line bg-white" role="group" aria-label={label}>
      <button type="button" aria-label={`Fewer ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))} className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-sand disabled:opacity-30">
        <Minus aria-hidden className="h-4 w-4" />
      </button>
      <span aria-live="polite" className="min-w-[2.5rem] text-center text-base font-semibold text-ink">{value}</span>
      <button type="button" aria-label={`More ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + 1))} className="flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-sand disabled:opacity-30">
        <Plus aria-hidden className="h-4 w-4" />
      </button>
    </div>
  );
}

function Card({ n, title, children, className }: { n: number; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section aria-labelledby={`step-${n}`} className={cn("rounded-3xl bg-white p-6 shadow-card sm:p-8", className)}>
      <h2 id={`step-${n}`} className="flex items-center gap-3 font-display text-3xl text-ink">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink font-sans text-sm font-semibold text-white">{n}</span>
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function TripPlanner({ destinations, whatsapp }: { destinations: PlannerDestination[]; whatsapp?: string }) {
  const params = useSearchParams();
  const startSlug = destinations.some((d) => d.slug === params.get("dest")) ? params.get("dest")! : destinations[0]?.slug;
  const [slug, setSlug] = useState(startSlug);
  const dest = destinations.find((d) => d.slug === slug) ?? destinations[0];
  const [choice, setChoice] = useState<TripChoice>(() => initialChoice(dest));
  const [roomsTouched, setRoomsTouched] = useState(false);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const update = (patch: Partial<TripChoice>) => setChoice((c) => ({ ...c, ...patch }));
  const chooseDest = (s: string) => {
    const d = destinations.find((x) => x.slug === s)!;
    setSlug(s);
    setChoice((c) => ({ ...initialChoice(d), startDate: c.startDate, adults: c.adults, children: c.children, infants: c.infants, rooms: c.rooms }));
  };
  const setAdults = (adults: number) => update({ adults, ...(roomsTouched ? {} : { rooms: Math.max(1, Math.ceil(adults / 2)) }) });

  const nights = totalNights(choice);
  const days = useMemo(() => buildDays(dest, choice), [dest, choice]);
  const price = useMemo(() => calculatePrice(dest, choice), [dest, choice]);
  const fullPlan = useMemo(() => planText(dest, choice, days, price), [dest, choice, days, price]);
  const wa = whatsappLink(whatsapp, `Hello S2 Holidays, I'd like a quote for this trip:\n\n${planText(dest, choice, days, price, { short: true })}`);
  const pax = chargeablePax(choice);
  const suggestedVehicle = dest.vehicles.find((v) => (v.seats ?? 99) >= choice.adults + choice.children + choice.infants)?.name;

  const addPlace = (key: string) => {
    const p = dest.places.find((x) => x.key === key)!;
    const nightsLeft = MAX_NIGHTS - nights;
    if (nightsLeft <= 0) return;
    update({ stops: [...choice.stops, { placeKey: key, nights: Math.min(p.defaultNights ?? 2, nightsLeft), sights: (p.sightseeing ?? []).map((s) => s.name) }] });
  };
  const setStop = (i: number, patch: Partial<TripChoice["stops"][number]>) =>
    update({ stops: choice.stops.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const moveStop = (i: number, dir: -1 | 1) => {
    const s = [...choice.stops];
    [s[i], s[i + dir]] = [s[i + dir], s[i]];
    update({ stops: s });
  };
  const toggleSight = (i: number, name: string) => {
    const st = choice.stops[i];
    setStop(i, { sights: st.sights.includes(name) ? st.sights.filter((x) => x !== name) : [...st.sights, name] });
  };

  if (!dest) return <p className="text-muted">The trip planner is being set up. Please send us an enquiry instead.</p>;
  const placeName = (key: string) => dest.places.find((p) => p.key === key)?.name ?? key;
  const endDate = choice.startDate && nights ? days[days.length - 1]?.date : undefined;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
      <div className="min-w-0 space-y-6">
        {/* 1. DESTINATION */}
        <Card n={1} title="Where do you want to go?" className="print:hidden">
          <div role="radiogroup" aria-label="Destination" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {destinations.map((d) => (
              <button
                key={d.slug}
                type="button"
                role="radio"
                aria-checked={d.slug === dest.slug}
                onClick={() => chooseDest(d.slug)}
                className={cn(
                  "rounded-2xl border p-4 text-left transition-colors",
                  d.slug === dest.slug ? "border-ink bg-ink text-white" : "border-line bg-sand/40 text-ink hover:border-gold"
                )}
              >
                <span className="block font-display text-2xl font-semibold">{d.title}</span>
                {d.intro && <span className={cn("mt-1 block text-xs", d.slug === dest.slug ? "text-white/75" : "text-muted")}>{d.intro}</span>}
              </button>
            ))}
          </div>
        </Card>

        {/* 2. DATES & TRAVELLERS */}
        <Card n={2} title="When and who" className="print:hidden">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="trip-date" className="mb-1.5 block text-sm font-medium text-ink">Start date</label>
              <input
                id="trip-date"
                type="date"
                min={today}
                value={choice.startDate ?? ""}
                onChange={(e) => update({ startDate: e.target.value || undefined })}
                className="h-11 w-full rounded-xl border border-line bg-white px-4 text-ink focus:border-gold focus:outline-none"
              />
              <p className="mt-1 text-xs text-muted">Leave empty if your dates are flexible.</p>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
              <div><p className="mb-1.5 text-sm font-medium text-ink">Adults</p><Stepper label="adults" value={choice.adults} min={1} max={20} onChange={setAdults} /></div>
              <div><p className="mb-1.5 text-sm font-medium text-ink">Rooms</p><Stepper label="rooms" value={choice.rooms} min={1} max={10} onChange={(rooms) => { setRoomsTouched(true); update({ rooms }); }} /></div>
              <div><p className="mb-1.5 text-sm font-medium text-ink">Children 5–11</p><Stepper label="children" value={choice.children} min={0} max={10} onChange={(children) => update({ children })} /></div>
              <div><p className="mb-1.5 text-sm font-medium text-ink">Under 5</p><Stepper label="children under 5" value={choice.infants} min={0} max={6} onChange={(infants) => update({ infants })} /></div>
            </div>
          </div>
        </Card>

        {/* 3. PLACES & NIGHTS */}
        <Card n={3} title="Places and nights" className="print:hidden">
          <p className="text-sm text-muted">
            Add the places you&apos;d like to stay and set the nights at each. <strong className="text-ink">{nights} nights / {nights ? nights + 1 : 0} days</strong> in total.
          </p>
          <ul className="mt-4 space-y-3">
            {choice.stops.map((s, i) => (
              <li key={s.placeKey} className="flex flex-wrap items-center gap-3 rounded-2xl border border-ink/80 bg-white p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold-soft text-xs font-semibold text-gold-deep">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{placeName(s.placeKey)}</p>
                  <p className="text-xs text-muted">{dest.places.find((p) => p.key === s.placeKey)?.description}</p>
                </div>
                <Stepper label={`nights in ${placeName(s.placeKey)}`} value={s.nights} min={1} max={Math.min(14, s.nights + MAX_NIGHTS - nights)} onChange={(v) => setStop(i, { nights: v })} />
                <div className="flex gap-1">
                  {choice.stops.length > 1 && (
                    <>
                      <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => moveStop(i, -1)} className="rounded-full p-2 text-muted hover:bg-sand disabled:opacity-30"><ArrowUp aria-hidden className="h-4 w-4" /></button>
                      <button type="button" aria-label="Move down" disabled={i === choice.stops.length - 1} onClick={() => moveStop(i, 1)} className="rounded-full p-2 text-muted hover:bg-sand disabled:opacity-30"><ArrowDown aria-hidden className="h-4 w-4" /></button>
                    </>
                  )}
                  <button type="button" aria-label={`Remove ${placeName(s.placeKey)}`} onClick={() => update({ stops: choice.stops.filter((_, j) => j !== i) })} className="rounded-full p-2 text-muted hover:bg-red-50 hover:text-red-700"><Trash2 aria-hidden className="h-4 w-4" /></button>
                </div>
              </li>
            ))}
          </ul>
          {dest.places.some((p) => !choice.stops.some((s) => s.placeKey === p.key)) && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {dest.places.filter((p) => !choice.stops.some((s) => s.placeKey === p.key)).map((p) => (
                <div key={p.key} className="flex items-center justify-between gap-3 rounded-2xl border border-dashed border-line p-4">
                  <div className="min-w-0">
                    <p className="font-medium text-ink">{p.name}</p>
                    {p.description && <p className="text-xs text-muted">{p.description}</p>}
                  </div>
                  <button type="button" onClick={() => addPlace(p.key)} disabled={nights >= MAX_NIGHTS} className={buttonClass("primary", "shrink-0 px-4 py-2 text-xs")}>
                    <Plus aria-hidden className="h-3.5 w-3.5" /> Add
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 4. SIGHTSEEING, HOTEL, MEALS, VEHICLE */}
        <Card n={4} title="Sightseeing, hotels, meals and vehicle" className="print:hidden">
          {choice.stops.map((s, i) => {
            const p = dest.places.find((x) => x.key === s.placeKey);
            if (!p?.sightseeing?.length) return null;
            return (
              <fieldset key={s.placeKey} className="mb-5 rounded-2xl border border-line p-4">
                <legend className="px-1 text-sm font-semibold text-ink">
                  {p.name} <span className="font-normal text-muted">· {s.sights.length} of {p.sightseeing.length} selected</span>
                </legend>
                <div className="grid gap-2 sm:grid-cols-2">
                  {p.sightseeing.map((sight) => (
                    <label key={sight.name} className={cn("flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-sm transition-colors", s.sights.includes(sight.name) ? "border-ink/60 bg-sand/50" : "border-line")}>
                      <input type="checkbox" checked={s.sights.includes(sight.name)} onChange={() => toggleSight(i, sight.name)} className="mt-0.5 h-4 w-4 accent-[var(--color-ink)]" />
                      <span className="text-ink">{sight.name}{sight.extraPerPerson ? <span className="text-muted"> (+{inr(sight.extraPerPerson)} pp)</span> : null}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            );
          })}

          <p className="mb-2 text-sm font-medium text-ink"><Hotel aria-hidden className="mr-1 inline h-4 w-4 text-gold" />Hotel category</p>
          <div role="radiogroup" aria-label="Hotel category" className="grid grid-cols-3 gap-3">
            {HOTEL_CATEGORIES.map((h) => (
              <button key={h.value} type="button" role="radio" aria-checked={choice.hotel === h.value} onClick={() => update({ hotel: h.value })}
                className={cn("rounded-xl border p-3 text-left text-sm", choice.hotel === h.value ? "border-ink bg-ink text-white" : "border-line text-ink hover:border-gold")}>
                <span className="block font-semibold">{h.label}</span>
                <span className={cn("text-xs", choice.hotel === h.value ? "text-white/75" : "text-muted")}>{h.hint}</span>
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {dest.mealPlans.length > 0 && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink"><Utensils aria-hidden className="mr-1 inline h-4 w-4 text-gold" />Meals</span>
                <select value={choice.meal ?? ""} onChange={(e) => update({ meal: e.target.value || undefined })} className="h-11 w-full rounded-xl border border-line bg-white px-3 text-ink">
                  {dest.mealPlans.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}
                </select>
              </label>
            )}
            {dest.vehicles.length > 0 && (
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-ink"><Car aria-hidden className="mr-1 inline h-4 w-4 text-gold" />Vehicle</span>
                <select value={choice.vehicle ?? ""} onChange={(e) => update({ vehicle: e.target.value })} className="h-11 w-full rounded-xl border border-line bg-white px-3 text-ink">
                  {dest.vehicles.map((v) => <option key={v.name} value={v.name}>{v.name}{v.seats ? ` – up to ${v.seats}` : ""}</option>)}
                </select>
                {suggestedVehicle && suggestedVehicle !== choice.vehicle && (
                  <button type="button" onClick={() => update({ vehicle: suggestedVehicle })} className="mt-1 text-xs font-medium text-gold underline-offset-2 hover:underline">
                    Suggested for your group: {suggestedVehicle}
                  </button>
                )}
              </label>
            )}
          </div>
        </Card>

        {/* 5. DAY-WISE PLAN */}
        <Card n={5} title="Your day-wise plan">
          {days.length === 0 ? (
            <p className="text-muted">Add at least one place in step 3 to see your plan.</p>
          ) : (
            <ol className="space-y-4">
              {days.map((d) => (
                <li key={d.day} className="overflow-hidden rounded-2xl border border-line break-inside-avoid">
                  <div className="flex flex-wrap items-baseline gap-x-3 bg-ink px-4 py-3 text-white">
                    <span className="rounded-md bg-gold px-2 py-0.5 text-xs font-semibold">Day {d.day}</span>
                    <span className="font-semibold">{d.title}</span>
                    {d.date && <span className="text-xs text-white/70">{formatDay(d.date)}</span>}
                  </div>
                  <div className="px-4 py-3 text-sm text-ink-soft">
                    {d.lines.length > 1 && !d.lines[0].endsWith(".") ? (
                      <ul className="list-disc space-y-1 pl-5">{d.lines.map((l) => <li key={l}>{l}</li>)}</ul>
                    ) : (
                      d.lines.map((l) => <p key={l} className="mb-1">{l}</p>)
                    )}
                    {(d.stay || d.meals) && (
                      <p className="mt-2 border-t border-dashed border-line pt-2 text-xs text-muted">
                        {d.stay && <><strong className="text-ink">Stay:</strong> {d.stay} · {HOTEL_CATEGORIES.find((h) => h.value === choice.hotel)?.label}</>}
                        {d.stay && d.meals && " · "}
                        {d.meals && <><strong className="text-ink">Meals:</strong> {d.meals}</>}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>

        {/* SEND */}
        <section id="send-plan" className="scroll-mt-28 print:hidden">
          <EnquiryForm
            title="Send this plan to S2 Holidays"
            enquiryType="trip-planner"
            whatsapp={whatsapp}
            submitLabel="Send my trip plan"
            extra={{ travelDate: choice.startDate, adults: choice.adults, children: choice.children, destination: dest.title, plan: fullPlan }}
          />
        </section>
      </div>

      {/* SUMMARY */}
      <aside aria-label="Trip summary" className="lg:sticky lg:top-28">
        <div className="overflow-hidden rounded-3xl bg-white shadow-lift">
          <div className="bg-ink p-6 text-white">
            <p className="text-sm text-white/70">{dest.title} — your trip</p>
            <p className="mt-1 font-display text-3xl">{nights ? `${nights} nights / ${nights + 1} days` : "Add a place"}</p>
            <p className="mt-2 flex items-center gap-2 text-sm text-white/80"><CalendarDays aria-hidden className="h-4 w-4" />
              {choice.startDate ? `${formatDay(choice.startDate)}${endDate ? ` – ${formatDay(endDate)}` : ""}` : "Flexible dates"}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-white/80"><Users aria-hidden className="h-4 w-4" />
              {choice.adults} adult{choice.adults > 1 ? "s" : ""}{choice.children ? `, ${choice.children} child${choice.children > 1 ? "ren" : ""}` : ""}{choice.infants ? `, ${choice.infants} under 5` : ""} · {choice.rooms} room{choice.rooms > 1 ? "s" : ""}
            </p>
            {choice.stops.length > 0 && (
              <p className="mt-1 flex items-start gap-2 text-sm text-white/80"><MapPin aria-hidden className="mt-0.5 h-4 w-4 shrink-0" />
                {choice.stops.map((s) => `${placeName(s.placeKey)} ${s.nights}N`).join(" → ")}
              </p>
            )}
          </div>

          <div className="p-6">
            {price ? (
              <>
                <ul className="space-y-2 text-sm">
                  {price.lines.map((l) => (
                    <li key={l.label} className="flex justify-between gap-4"><span className="text-ink-soft">{l.label}</span><span className="shrink-0 font-medium text-ink">{inr(l.amount)}</span></li>
                  ))}
                  <li className="flex justify-between gap-4 border-t border-line pt-2"><span className="text-ink-soft">GST ({price.gstPercent}%)</span><span className="font-medium text-ink">{inr(price.gst)}</span></li>
                </ul>
                <div className="mt-4 rounded-2xl bg-sand p-4">
                  <p className="flex items-baseline justify-between"><span className="font-semibold text-ink">Estimated total</span><span className="font-display text-3xl font-semibold text-ink">{inr(price.total)}</span></p>
                  <p className="text-right text-xs text-muted">{inr(price.perPerson)} per person ({pax} paying guest{pax > 1 ? "s" : ""})</p>
                  {price.advance && <p className="mt-2 text-sm text-ink">Pay <strong>{inr(price.advance)}</strong> to confirm your booking.</p>}
                </div>
                <p className="mt-3 text-xs text-muted">Estimate based on current rates. Hotel names, availability and the final price are confirmed by our team.</p>
              </>
            ) : (
              <div className="rounded-2xl bg-sand p-5">
                <p className="font-display text-2xl text-ink">Get your free quote</p>
                <p className="mt-1 text-sm text-ink-soft">Send us this plan and our team will reply with hotel options and the best price for your dates.</p>
              </div>
            )}

            <div className="mt-5 space-y-3 print:hidden">
              <a href="#send-plan" className={buttonClass("gold", "w-full")}><Send aria-hidden className="h-4 w-4" /> Send this plan</a>
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonClass("whatsapp", "w-full")}><WhatsAppIcon className="h-5 w-5" /> Share on WhatsApp</a>}
              <button type="button" onClick={() => window.print()} className={buttonClass("outline", "w-full")}><Printer aria-hidden className="h-4 w-4" /> Print / save as PDF</button>
            </div>
            <p className="mt-4 flex items-start gap-2 text-xs text-muted print:hidden"><Check aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" /> Every trip can be adjusted — our team will help fine-tune it.</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
