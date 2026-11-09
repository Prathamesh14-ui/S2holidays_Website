import type { Metadata } from "next";
import { SetupRunner } from "./SetupRunner";

export const metadata: Metadata = { title: "Set up trip planner", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-4xl text-ink">Set up the trip planner in Studio</h1>
      <p className="mt-4 text-muted">
        Copies the 6 planner destinations (Goa, Kerala, Kashmir, Himachal, Rajasthan, Dubai) with their places and
        sightseeing into Studio → Trip planner, so rates can be added there. No prices are added.
      </p>
      <SetupRunner />
    </main>
  );
}
