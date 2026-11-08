/** Homepage sections that editors can reorder or hide (Site settings → Homepage → Homepage sections). */
export const HOME_SECTIONS = [
  { value: "featured", title: "Featured packages" },
  { value: "offers", title: "Special offers" },
  { value: "domestic", title: "India destinations" },
  { value: "international", title: "International destinations" },
  { value: "services", title: "Mumbai services (sightseeing, cars, guides)" },
  { value: "values", title: "How we plan (3 points)" },
  { value: "testimonials", title: "Testimonials" },
  { value: "journal", title: "Travel journal (blog)" },
] as const;

export type HomeSectionKey = (typeof HOME_SECTIONS)[number]["value"];

export const DEFAULT_HOME_ORDER: HomeSectionKey[] = HOME_SECTIONS.map((s) => s.value);

const KEYS = new Set<string>(DEFAULT_HOME_ORDER);

/**
 * The editor's order (unknown/duplicate entries dropped). Sections not listed are hidden.
 * An empty or missing list means the default order with every section.
 */
export function resolveHomeOrder(chosen?: (string | null | undefined)[] | null): HomeSectionKey[] {
  const seen = new Set<string>();
  const order = (chosen ?? []).filter((k): k is HomeSectionKey => !!k && KEYS.has(k) && !seen.has(k) && !!seen.add(k));
  return order.length ? order : DEFAULT_HOME_ORDER;
}
