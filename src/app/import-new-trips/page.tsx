import type { Metadata } from "next";
import { NewTripsRunner } from "./NewTripsRunner";
import { newTripTotals } from "@/lib/import-new-trips";

export const metadata: Metadata = { title: "Add new trips", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-4xl text-ink">Add the new trips</h1>
      <p className="mt-4 text-muted">
        {newTripTotals.packages} new holiday packages (India, international and pilgrimage tours) from version 3 of the knowledge base.
        They go live straight away with prices hidden. Add photos in Studio afterwards.
      </p>
      <NewTripsRunner total={newTripTotals.packages} />
    </main>
  );
}
