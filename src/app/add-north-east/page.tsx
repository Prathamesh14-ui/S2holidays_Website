import type { Metadata } from "next";
import { NorthEastRunner } from "./NorthEastRunner";

export const metadata: Metadata = { title: "Add North East trips", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-4xl text-ink">Complete the North East section</h1>
      <p className="mt-4 text-muted">
        Publishes the North East destination and its 2 existing trips, and adds 8 new trips with prices shown. No photos
        yet – add them in Studio later.
      </p>
      <NorthEastRunner />
    </main>
  );
}
