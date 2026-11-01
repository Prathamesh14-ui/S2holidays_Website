import { PageHero } from "./PageHero";
import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { formatDate } from "@/lib/format";
import type { LegalPage as LegalPageType } from "@/lib/types";

export function LegalPage({ page, fallbackTitle, path }: { page: LegalPageType | null; fallbackTitle: string; path: string }) {
  return (
    <>
      <PageHero title={page?.title || fallbackTitle} size="sm" crumbs={[{ label: page?.title || fallbackTitle, href: path }]} />
      <section className="py-16">
        <Container className="max-w-3xl">
          {page?.isSample && <SampleBadge className="mb-6" label="Sample template — requires legal review" />}
          {page?.updatedAt && <p className="mb-8 text-sm text-muted">Last updated: {formatDate(page.updatedAt)}</p>}
          {page?.body?.length ? <RichText value={page.body} /> : <p className="text-muted">This page is being prepared.</p>}
        </Container>
      </section>
    </>
  );
}
