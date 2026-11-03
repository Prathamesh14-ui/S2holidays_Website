import type { Metadata } from "next";
import { FixRunner } from "./FixRunner";

export const metadata: Metadata = { title: "Fix imported packages", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <h1 className="text-4xl text-ink">Fix imported packages</h1>
      <p className="mt-4 text-muted">
        Removes the broken code text at the bottom of the imported packages and restores the full cancellation terms.
        Only fixes packages where the broken text is still there — your own edits are not changed.
      </p>
      <FixRunner />
    </main>
  );
}
