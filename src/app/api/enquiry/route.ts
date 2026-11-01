import { NextResponse, type NextRequest } from "next/server";
import { enquirySchema } from "@/lib/enquiry/schema";
import { storeLead, markLeadNotified } from "@/lib/enquiry/store";
import { isEmailConfigured, sendLeadEmail } from "@/lib/enquiry/notify";
import { rateLimit } from "@/lib/rate-limit";

const MAX_BODY_BYTES = 10_000;
const MIN_FILL_MS = 2_500; // faster submissions are almost certainly bots

const json = (body: unknown, status = 200, headers?: HeadersInit) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } });

function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}

function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  // 1. CSRF / cross-site protection
  if (!sameOrigin(req)) return json({ error: "Invalid request origin." }, 403);
  if (!req.headers.get("content-type")?.includes("application/json")) return json({ error: "Unsupported content type." }, 415);

  // 2. Rate limiting (per IP)
  const rl = rateLimit(`enquiry:${clientIp(req)}`, 5, 10 * 60 * 1000);
  if (!rl.ok) {
    return json({ error: "Too many enquiries from this connection. Please try again later or contact us on WhatsApp." }, 429, {
      "Retry-After": String(rl.retryAfter),
    });
  }

  // 3. Body size + JSON parsing
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return json({ error: "Request too large." }, 413);
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Invalid JSON." }, 400);
  }

  // 4. Server-side validation (never trust the client)
  const parsed = enquirySchema.safeParse(body);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const k = String(issue.path[0] ?? "form");
      if (k === "website") continue; // never reveal the honeypot
      fieldErrors[k] ??= issue.message;
    }
    // Honeypot filled → pretend success so bots get no signal
    if (parsed.error.issues.some((i) => i.path[0] === "website")) return json({ ok: true });
    return json({ error: "Please check the highlighted fields.", fieldErrors }, 422);
  }
  const enquiry = parsed.data;
  if (enquiry.startedAt && Date.now() - enquiry.startedAt < MIN_FILL_MS) return json({ ok: true });

  // 5. Persist + notify
  try {
    const stored = await storeLead(enquiry, { userAgent: req.headers.get("user-agent")?.slice(0, 200) || undefined });
    const emailed = await sendLeadEmail(enquiry, stored.id);
    if (emailed) await markLeadNotified(stored.id);

    if (stored.storage === "none" && !emailed) {
      console.error("[enquiry] no lead storage or email configured — enquiry could not be delivered");
      return json({ error: "We couldn't send your enquiry right now. Please contact us by phone or WhatsApp." }, 503);
    }
    if (!emailed && isEmailConfigured()) console.warn("[enquiry] stored but email notification failed", stored.id);
    return json({ ok: true, reference: stored.id.replace(/^lead\./, "").slice(0, 8).toUpperCase() });
  } catch (err) {
    console.error("[enquiry] failed to process", (err as Error).message);
    return json({ error: "Something went wrong while sending your enquiry. Please try again or contact us on WhatsApp." }, 500);
  }
}

export function GET() {
  return json({ error: "Method not allowed" }, 405, { Allow: "POST" });
}
