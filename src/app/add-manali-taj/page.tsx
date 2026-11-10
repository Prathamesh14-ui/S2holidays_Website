import type { Metadata } from "next";
import { ManaliTajRunner } from "./ManaliTajRunner";

export const metadata: Metadata = { title: "Add Kullu Manali & Taj Mahal", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-4xl text-ink">Add Kullu Manali &amp; Taj Mahal</h1>
      <p className="mt-4 text-muted">
        Creates the two destinations, adds 13 new trips with prices (10 Kullu Manali, 3 Taj Mahal) and shows your existing
        Manali and Taj trips under them too – 14 and 6 trips in total. No photos yet – add them in Studio later.
      </p>
      <ManaliTajRunner />
    </main>
  );
}
