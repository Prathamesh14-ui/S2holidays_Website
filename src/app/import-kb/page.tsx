import type { Metadata } from "next";
import { KbRunner } from "./KbRunner";
import { kbTotals } from "@/lib/import-kb";

export const metadata: Metadata = { title: "Import travel knowledge base", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-4xl text-ink">Import packages from the Excel</h1>
      <p className="mt-4 text-muted">
        {kbTotals.packages} holiday packages and {kbTotals.destinations} destinations from “S2 Holidays Travel Knowledge Base”.
      </p>
      <KbRunner total={kbTotals.packages} />
    </main>
  );
}
