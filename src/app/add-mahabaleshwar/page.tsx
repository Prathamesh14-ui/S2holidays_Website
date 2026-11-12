import type { Metadata } from "next";
import { MahabaleshwarRunner } from "./MahabaleshwarRunner";
import { mahabaleshwarTotal } from "@/lib/add-mahabaleshwar";

export const metadata: Metadata = { title: "Add Mahabaleshwar", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-4xl text-ink">Add Mahabaleshwar</h1>
      <p className="mt-4 text-muted">
        Creates the Mahabaleshwar destination and 5 packages (priced from the current hotel package rates) with photos and
        prices, and shows the older Mahabaleshwar trips under it – {mahabaleshwarTotal} steps.
      </p>
      <MahabaleshwarRunner total={mahabaleshwarTotal} />
    </main>
  );
}
