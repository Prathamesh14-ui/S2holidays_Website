import type { Metadata } from "next";
import { PricesRunner } from "./PricesRunner";

export const metadata: Metadata = { title: "Show approved prices", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-4xl text-ink">Show approved prices</h1>
      <p className="mt-4 text-muted">
        Turns on “Show price on website” for every package imported from the Excel. Prices then appear on package cards
        and pages instead of “Price on request”.
      </p>
      <PricesRunner />
    </main>
  );
}
