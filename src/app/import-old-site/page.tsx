import type { Metadata } from "next";
import { ImportRunner } from "./ImportRunner";
import { importTotals } from "@/lib/import-old-site";

export const metadata: Metadata = { title: "Import old website content", robots: { index: false, follow: false } };

export default function ImportPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-4xl text-ink">Import content from the old website</h1>
      <p className="mt-4 text-muted">
        Copies {importTotals.packages} holiday packages (with itineraries, inclusions, hotel options, terms and photos)
        and {importTotals.destinations} destinations from www.s2holidays.com into the Studio as <strong>drafts</strong>.
        Nothing appears on the website until you publish it in the Studio. Running it twice is safe — existing items are skipped.
      </p>
      <ImportRunner total={importTotals.packages} />
    </main>
  );
}
