import type { Metadata } from "next";
import { PricesRunner } from "./PricesRunner";

export const metadata: Metadata = { title: "Show new trip prices", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-4xl text-ink">Show new trip prices</h1>
      <p className="mt-4 text-muted">
        Turns on “Show price on website” for the 51 trips added in November (Arunachal, Gujarat, pilgrimage, international and more). Prices then appear on package cards
        and pages instead of “Price on request”.
      </p>
      <PricesRunner />
    </main>
  );
}
