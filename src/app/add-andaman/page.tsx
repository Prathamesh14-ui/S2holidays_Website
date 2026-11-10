import type { Metadata } from "next";
import { AndamanRunner } from "./AndamanRunner";
import { andamanTotal } from "@/lib/add-andaman";

export const metadata: Metadata = { title: "Complete the Andaman section", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-4xl text-ink">Complete the Andaman section</h1>
      <p className="mt-4 text-muted">
        Publishes the Andaman destination and its 2 existing trips with photos, and adds 4 new Andaman trips with photos and
        prices – {andamanTotal} steps in total.
      </p>
      <AndamanRunner total={andamanTotal} />
    </main>
  );
}
