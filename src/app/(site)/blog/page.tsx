import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { AppImage } from "@/components/ui/AppImage";
import { SampleBadge } from "@/components/ui/SampleBadge";
import { getPosts } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Travel Journal", description: "Travel ideas, destination guides and practical tips from S2 Holidays.", path: "/blog" });

export default async function BlogPage() {
  const posts = await getPosts();
  const [lead, ...rest] = posts;
  return (
    <>
      <PageHero title="Travel journal" eyebrow="Blog" intro="Destination ideas and practical planning tips." image={lead?.coverImage} size="sm" crumbs={[{ label: "Blog", href: "/blog" }]} />
      <section className="py-16 sm:py-20">
        <Container>
          {!lead && <p className="text-center text-muted">Articles coming soon.</p>}
          {lead && (
            <article className="group relative grid overflow-hidden rounded-3xl bg-white shadow-card md:grid-cols-2">
              <div className="relative aspect-[16/10] md:aspect-auto md:min-h-96">
                <AppImage image={lead.coverImage} alt={lead.title} priority sizes="(min-width: 768px) 50vw, 100vw" className="transition-transform duration-[1.2s] group-hover:scale-105" />
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-12">
                {lead.isSample && <SampleBadge className="mb-3 self-start" />}
                <p className="text-xs uppercase tracking-wider text-muted">{formatDate(lead.publishedAt)}{lead.categories?.[0] && ` · ${lead.categories[0]}`}</p>
                <h2 className="mt-3 text-4xl leading-tight text-ink">
                  <Link href={`/blog/${lead.slug}`} className="after:absolute after:inset-0">{lead.title}</Link>
                </h2>
                {lead.excerpt && <p className="mt-4 text-muted">{lead.excerpt}</p>}
                <span className="mt-6 text-sm font-medium text-gold">Read article →</span>
              </div>
            </article>
          )}
          {rest.length > 0 && (
            <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <li key={post._id} data-reveal>
                  <article className="group relative">
                    <div className="relative aspect-[3/2] overflow-hidden rounded-3xl">
                      <AppImage image={post.coverImage} alt={post.title} sizes="(min-width: 1024px) 33vw, 50vw" className="transition-transform duration-[1.2s] group-hover:scale-105" />
                    </div>
                    <p className="mt-5 text-xs uppercase tracking-wider text-muted">{formatDate(post.publishedAt)}{post.categories?.[0] && ` · ${post.categories[0]}`}</p>
                    <h2 className="mt-2 text-2xl text-ink group-hover:text-gold-deep">
                      <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">{post.title}</Link>
                    </h2>
                    {post.excerpt && <p className="mt-2 line-clamp-2 text-sm text-muted">{post.excerpt}</p>}
                  </article>
                </li>
              ))}
            </ul>
          )}
        </Container>
      </section>
    </>
  );
}
