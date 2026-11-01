"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { enquirySchema, type EnquiryInput } from "@/lib/enquiry/schema";
import { buttonClass } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/layout/WhatsAppFloat";
import { whatsappLink } from "@/lib/whatsapp";
import { cn } from "@/lib/format";

type Props = {
  enquiryType?: EnquiryInput["enquiryType"];
  packageSlug?: string;
  packageTitle?: string;
  destination?: string;
  whatsapp?: string;
  compact?: boolean;
  title?: string;
};

type Errors = Partial<Record<keyof EnquiryInput | "form", string>>;

const field =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink placeholder:text-muted/70 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 aria-[invalid=true]:border-red-500";
const labelCls = "mb-1.5 block text-sm font-medium text-ink";

export function EnquiryForm({ enquiryType = "general", packageSlug, packageTitle, destination, whatsapp, compact, title }: Props) {
  const id = useId();
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
  const startedAt = useRef(0);
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);
  const formRef = useRef<HTMLFormElement>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = {
      ...Object.fromEntries(fd.entries()),
      consent: fd.get("consent") === "on",
      enquiryType,
      packageSlug: packageSlug || undefined,
      packageTitle: packageTitle || undefined,
      sourcePage: window.location.pathname,
      startedAt: startedAt.current,
    };
    const parsed = enquirySchema.safeParse(raw);
    if (!parsed.success) {
      const errs: Errors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof EnquiryInput;
        if (k && !errs[k]) errs[k] = issue.message;
      }
      setErrors(errs);
      const first = Object.keys(errs)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    setStatus("submitting");
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(raw),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrors({ ...(data.fieldErrors || {}), form: data.error || "Something went wrong. Please try again." });
        setStatus("idle");
        return;
      }
      setStatus("success");
    } catch {
      setErrors({ form: "Network error — please check your connection and try again." });
      setStatus("idle");
    }
  }

  const wa = whatsappLink(
    whatsapp,
    packageTitle ? `Hello S2 Holidays, I'm interested in "${packageTitle}".` : "Hello S2 Holidays, I'd like help planning a holiday."
  );

  if (status === "success") {
    return (
      <div role="status" className="rounded-3xl border border-line bg-white p-8 text-center shadow-card">
        <CheckCircle2 aria-hidden className="mx-auto h-12 w-12 text-teal" />
        <h3 className="mt-4 text-3xl text-ink">Thank you — enquiry received</h3>
        <p className="mt-2 text-muted">Our team will get back to you soon.</p>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonClass("whatsapp", "mt-6")}>
            <WhatsAppIcon className="h-5 w-5" /> Continue on WhatsApp
          </a>
        )}
      </div>
    );
  }

  const err = (k: keyof EnquiryInput) =>
    errors[k] ? (
      <p id={`${id}-${k}-err`} className="mt-1.5 text-sm text-red-600">{errors[k]}</p>
    ) : null;
  const a11y = (k: keyof EnquiryInput) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `${id}-${k}-err` : undefined,
  });

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className={cn("rounded-3xl border border-line bg-white p-6 shadow-card sm:p-8")}>
      {title && <h3 className="mb-1 text-3xl text-ink">{title}</h3>}
      {packageTitle && <p className="mb-5 text-sm text-muted">Enquiring about <strong className="text-ink">{packageTitle}</strong></p>}
      {!packageTitle && title && <p className="mb-5 text-sm text-muted">We usually reply with an itinerary and quote.</p>}

      <div className={cn("grid gap-4", !compact && "sm:grid-cols-2")}>
        <div className={cn(!compact && "sm:col-span-2")}>
          <label htmlFor={`${id}-name`} className={labelCls}>Full name *</label>
          <input id={`${id}-name`} name="name" autoComplete="name" required className={field} {...a11y("name")} />
          {err("name")}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className={labelCls}>Email *</label>
          <input id={`${id}-email`} name="email" type="email" autoComplete="email" required className={field} {...a11y("email")} />
          {err("email")}
        </div>
        <div>
          <label htmlFor={`${id}-phone`} className={labelCls}>Phone / WhatsApp *</label>
          <input id={`${id}-phone`} name="phone" type="tel" autoComplete="tel" inputMode="tel" required placeholder="+91" className={field} {...a11y("phone")} />
          {err("phone")}
        </div>
        {!packageSlug && enquiryType === "general" && (
          <div className={cn(!compact && "sm:col-span-2")}>
            <label htmlFor={`${id}-destination`} className={labelCls}>Destination(s)</label>
            <input id={`${id}-destination`} name="destination" defaultValue={destination} placeholder="e.g. Kerala, Dubai, not sure yet" className={field} {...a11y("destination")} />
            {err("destination")}
          </div>
        )}
        <div>
          <label htmlFor={`${id}-date`} className={labelCls}>{enquiryType === "car-rental" ? "Date required" : "Travel date"}</label>
          <input id={`${id}-date`} name="travelDate" type="date" className={field} {...a11y("travelDate")} />
          {err("travelDate")}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor={`${id}-adults`} className={labelCls}>Adults</label>
            <input id={`${id}-adults`} name="adults" type="number" min={1} max={50} defaultValue={2} className={field} {...a11y("adults")} />
            {err("adults")}
          </div>
          <div>
            <label htmlFor={`${id}-children`} className={labelCls}>Children</label>
            <input id={`${id}-children`} name="children" type="number" min={0} max={20} defaultValue={0} className={field} {...a11y("children")} />
            {err("children")}
          </div>
        </div>
        <div className={cn(!compact && "sm:col-span-2")}>
          <label htmlFor={`${id}-message`} className={labelCls}>Message</label>
          <textarea
            id={`${id}-message`}
            name="message"
            rows={compact ? 3 : 4}
            placeholder={enquiryType === "car-rental" ? "Pick-up, drop, vehicle preference…" : "Hotel preference, budget, special requests…"}
            className={field}
            {...a11y("message")}
          />
          {err("message")}
        </div>
      </div>

      {/* Honeypot: hidden from people and assistive tech, bots tend to fill it */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-5">
        <label className="flex items-start gap-3 text-sm text-muted">
          <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 shrink-0 accent-gold" {...a11y("consent")} />
          <span>
            I agree to S2 Holidays contacting me about this enquiry and to the{" "}
            <Link href="/privacy-policy" className="text-teal underline underline-offset-2">privacy policy</Link>. *
          </span>
        </label>
        {err("consent")}
      </div>

      {errors.form && (
        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{errors.form}</p>
      )}

      <div className={cn("mt-6 flex flex-col gap-3", !compact && "sm:flex-row")}>
        <button type="submit" disabled={status === "submitting"} className={buttonClass("gold", "flex-1 py-3.5")}>
          {status === "submitting" ? (<><Loader2 aria-hidden className="h-4 w-4 animate-spin" /> Sending…</>) : "Send enquiry"}
        </button>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className={buttonClass("whatsapp", "flex-1 py-3.5")}>
            <WhatsAppIcon className="h-5 w-5" /> WhatsApp us
          </a>
        )}
      </div>
    </form>
  );
}
