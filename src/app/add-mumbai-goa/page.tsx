import type { Metadata } from "next";
import { MumbaiGoaRunner } from "./MumbaiGoaRunner";

export const metadata: Metadata = { title: "Add Mumbai to Goa", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-4xl text-ink">Add the Mumbai to Goa section</h1>
      <p className="mt-4 text-muted">
        Creates the “Mumbai to Goa” destination with 2 new cruise trips (prices shown) and links the existing Mumbai – Goa –
        Mumbai cruise to it. No photos yet – add them in Studio later.
      </p>
      <MumbaiGoaRunner />
    </main>
  );
}
