import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { getLegalPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Terms & Conditions", description: "Terms and conditions for S2 Holidays bookings and website use.", path: "/terms" });

export default async function Page() {
  return <LegalPage page={await getLegalPage("terms")} fallbackTitle="Terms & Conditions" path="/terms" />;
}
