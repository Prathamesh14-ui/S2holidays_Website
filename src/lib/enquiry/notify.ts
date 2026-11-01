import "server-only";
import type { Enquiry } from "./schema";
import { serverEnv } from "@/lib/server-env";
import { siteUrl } from "@/lib/env";

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export const isEmailConfigured = () => Boolean(serverEnv.resendApiKey && serverEnv.notifyEmail && serverEnv.fromEmail);

/** Build the staff notification email. Every user-supplied value is HTML-escaped. */
export function buildLeadEmail(e: Enquiry, leadId: string) {
  const rows: [string, unknown][] = [
    ["Name", e.name],
    ["Email", e.email],
    ["Phone", e.phone],
    ["Enquiry type", e.enquiryType],
    ["Package", e.packageTitle],
    ["Destination", e.destination],
    ["Travel date", e.travelDate],
    ["Travellers", `${e.adults} adult(s), ${e.children} child(ren)`],
    ["Message", e.message],
    ["Page", e.sourcePage ? `${siteUrl}${e.sourcePage}` : ""],
    ["Reference", leadId],
  ];
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#0f1d2b">
<h2 style="margin:0 0 12px">New website enquiry</h2>
<table cellpadding="6" style="border-collapse:collapse">${rows
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `<tr><td style="color:#5d6b79;vertical-align:top">${esc(k)}</td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`)
    .join("")}</table>
<p style="color:#5d6b79;font-size:12px">Manage this lead in the Studio: ${esc(siteUrl)}/studio</p></div>`;
  const text = rows.filter(([, v]) => v !== undefined && v !== "").map(([k, v]) => `${k}: ${v}`).join("\n");
  const subject = `New enquiry: ${e.packageTitle || e.destination || e.enquiryType} — ${e.name}`.replace(/[\r\n]+/g, " ").slice(0, 150);
  return { subject, html, text };
}

/** Send via Resend's REST API (no SDK needed). Returns true on success. */
export async function sendLeadEmail(e: Enquiry, leadId: string): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  const { subject, html, text } = buildLeadEmail(e, leadId);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${serverEnv.resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: serverEnv.fromEmail,
        to: serverEnv.notifyEmail.split(",").map((s) => s.trim()).filter(Boolean),
        reply_to: e.email,
        subject,
        html,
        text,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) console.error("[enquiry] email provider responded", res.status);
    return res.ok;
  } catch (err) {
    console.error("[enquiry] email send failed", (err as Error).name);
    return false;
  }
}
