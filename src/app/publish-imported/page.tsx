import type { Metadata } from "next";
import { PublishRunner } from "./PublishRunner";

export const metadata: Metadata = { title: "Publish imported content", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-4xl text-ink">Publish all imported packages</h1>
      <p className="mt-4 text-muted">
        Publishes every destination and holiday package that was imported from the old website and is still a draft.
        They will appear on the website immediately. Packages you edited or created yourself are not affected.
      </p>
      <PublishRunner />
    </main>
  );
}
