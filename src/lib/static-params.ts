/**
 * With Cache Components, generateStaticParams must return at least one entry.
 * A brand-new CMS (no blog posts / packages yet) would otherwise fail the build,
 * so we fall back to a placeholder slug that simply renders the 404 page.
 * New content published later is rendered on first request and then cached.
 */
export const PLACEHOLDER_SLUG = "__placeholder__";

export function slugParams(slugs: string[]): { slug: string }[] {
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: PLACEHOLDER_SLUG }];
}
