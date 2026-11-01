import "server-only";
import { randomUUID } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { Enquiry } from "./schema";
import { getReadClient, getWriteClient } from "@/sanity/lib/server-client";
import { serverEnv } from "@/lib/server-env";

export type StoredLead = { id: string; storage: "sanity" | "local-file" | "none" };

/**
 * Persist a lead. Uses Sanity (document ID prefixed "lead." so it is never readable
 * without authentication). In local development without Sanity credentials, leads
 * are appended to .data/leads.ndjson (git-ignored). In production without a store,
 * returns storage "none" so the caller can rely on email instead.
 */
export async function storeLead(e: Enquiry, meta: { userAgent?: string }): Promise<StoredLead> {
  const id = `lead.${randomUUID()}`;
  const submittedAt = new Date().toISOString();
  const write = getWriteClient();

  if (write) {
    let packageRef: { _type: "reference"; _ref: string; _weak: true } | undefined;
    if (e.packageSlug) {
      const pkgId = await getReadClient()
        ?.fetch<string | null>(`*[_type == "holidayPackage" && slug.current == $slug][0]._id`, { slug: e.packageSlug })
        .catch(() => null);
      if (pkgId) packageRef = { _type: "reference", _ref: pkgId.replace(/^drafts\./, ""), _weak: true };
    }
    await write.create({
      _id: id,
      _type: "lead",
      status: "new",
      name: e.name,
      email: e.email,
      phone: e.phone,
      enquiryType: e.enquiryType,
      packageTitle: e.packageTitle,
      package: packageRef,
      destination: e.destination,
      travelDate: e.travelDate || undefined,
      adults: e.adults,
      children: e.children,
      message: e.message,
      sourcePage: e.sourcePage,
      consent: e.consent,
      submittedAt,
      emailNotified: false,
    });
    return { id, storage: "sanity" };
  }

  if (!serverEnv.isProduction) {
    const dir = path.join(process.cwd(), ".data");
    await mkdir(dir, { recursive: true });
    const { website: _hp, startedAt: _s, ...rest } = e;
    void _hp;
    void _s;
    await appendFile(
      path.join(dir, "leads.ndjson"),
      JSON.stringify({ id, submittedAt, status: "new", ...rest, userAgent: meta.userAgent }) + "\n",
      { mode: 0o600 }
    );
    return { id, storage: "local-file" };
  }

  return { id, storage: "none" };
}

export async function markLeadNotified(id: string) {
  const write = getWriteClient();
  if (!write) return;
  await write.patch(id).set({ emailNotified: true }).commit().catch(() => undefined);
}
