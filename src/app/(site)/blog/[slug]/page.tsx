import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { RichText } from "@/components/ui/RichText";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { JsonLd } from "@/components/ui/JsonLd";
import { EnquiryBand } from "@/components/layout/EnquiryBand";
import { getPost, getPosts, getSettings } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";
import { slugParams } from "@/lib/static-params";
import { siteUrl } from "@/lib/env";
import { imageUrl } from "@/sanity/lib/image";

export async function generateStaticParams() {
  return slugParams((await getPosts()).map((p) => p.slug));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Article not found" };
  return pageMetadata({ title: post.title, description: post.excerpt, path: `/blog/${post.slug}`, image: post.coverImage, seo: post.seo, type: "article" });
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPost(slug), getSettings()]);
  if (!post) notFound();
  const cover = post.coverImage?.kind === "sanity" ? imageUrl(post.coverImage, 1200, 630) : undefined;
  return (
    <>
      <PageHero title={post.title} eyebrow={post.categories?.join(" · ")} image={post.coverImage} crumbs={[{ label: "Blog", href: "/blog" }, { label: post.title, href: `/blog/${post.slug}` }]}>
        <p className="mt-5 text-sm text-white/75">{formatDate(post.publishedAt)}{post.author && ` · ${post.author}`}</p>
      </PageHero>
      <article className="py-16">
        <Container className="max-w-3xl">
          {post.isSample && <SampleBadge className="mb-6" label="Sample article" />}
          {post.excerpt && <p className="mb-8 font-display text-2xl leading-relaxed text-ink">{post.excerpt}</p>}
          <RichText value={post.body} />
          <p className="mt-14 border-t border-line pt-6"><Link href="/blog" className="text-sm font-medium text-gold">← Back to the journal</Link></p>
        </Container>
      </article>
      <EnquiryBand whatsapp={settings.whatsapp} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt,
          datePublished: post.publishedAt,
          url: `${siteUrl}/blog/${post.slug}`,
          ...(cover ? { image: cover } : {}),
          author: { "@type": "Organization", name: post.author || settings.companyName },
          publisher: { "@type": "Organization", name: settings.companyName },
        }}
      />
    </>
  );
}
