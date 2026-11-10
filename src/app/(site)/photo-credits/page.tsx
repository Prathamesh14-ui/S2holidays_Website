import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { getPhotoCredits } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Photo credits",
  description: "Credits for photos used on the S2 Holidays website under free licences.",
  path: "/photo-credits",
});

export default async function Page() {
  const credits = await getPhotoCredits();
  return (
    <>
      <PageHero title="Photo credits" size="sm" crumbs={[{ label: "Photo credits", href: "/photo-credits" }]} />
      <section className="py-16">
        <Container className="max-w-3xl">
          <p className="text-muted">
            Some photos on this website are used under free licences (such as Creative Commons) from Wikimedia Commons. We thank the photographers listed below.
            Each link opens the photo&apos;s page with its full licence.
          </p>
          {credits.length ? (
            <ul className="mt-8 divide-y divide-line rounded-2xl bg-white shadow-card">
              {credits.map((c) => (
                <li key={`${c._type}-${c.slug}`} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                  <Link href={`/${c._type === "destination" ? "destinations" : "packages"}/${c.slug}`} className="font-medium text-ink hover:text-gold-deep">
                    {c.name}
                  </Link>
                  <span className="text-sm text-muted">
                    {c.creditUrl ? (
                      <a href={c.creditUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">{c.credit}</a>
                    ) : (
                      c.credit
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-8 text-muted">No credited photos at the moment.</p>
          )}
        </Container>
      </section>
    </>
  );
}
