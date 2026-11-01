import type { Metadata } from "next";
import { isSanityConfigured } from "@/lib/env";
import Studio from "./Studio";

export { viewport } from "next-sanity/studio";

export const metadata: Metadata = {
  title: "S2 Holidays — Content Studio",
  robots: { index: false, follow: false },
  referrer: "same-origin",
};

export default function StudioPage() {
  if (!isSanityConfigured) {
    return (
      <main className="mx-auto max-w-xl px-6 py-24 font-sans">
        <h1 className="text-4xl">Content Studio not connected</h1>
        <p className="mt-4 text-muted">
          Set <code>NEXT_PUBLIC_SANITY_PROJECT_ID</code> (and the other Sanity variables in <code>.env.example</code>) to
          enable the admin Studio. See the README section “CMS setup”.
        </p>
      </main>
    );
  }
  return <Studio />;
}
