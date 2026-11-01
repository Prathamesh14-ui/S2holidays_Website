import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/LegalPage";
import { getLegalPage } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Privacy Policy", description: "How S2 Holidays collects and uses personal information.", path: "/privacy-policy" });

export default async function Page() {
  return <LegalPage page={await getLegalPage("privacy-policy")} fallbackTitle="Privacy Policy" path="/privacy-policy" />;
}
