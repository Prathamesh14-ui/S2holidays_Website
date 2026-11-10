import type { Metadata } from "next";
import { BlogRunner } from "./BlogRunner";

export const metadata: Metadata = { title: "Add blog posts", robots: { index: false, follow: false } };

export default function Page() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-4xl text-ink">Add blog posts</h1>
      <p className="mt-4 text-muted">
        Adds 8 travel-guide articles (Kashmir, Kerala, Goa, Char Dham, Andaman, Ladakh, Rajasthan and honeymoon ideas). Each uses
        its destination&apos;s photo as the cover. You can edit, unpublish or delete them in Studio → Blog posts.
      </p>
      <BlogRunner />
    </main>
  );
}
