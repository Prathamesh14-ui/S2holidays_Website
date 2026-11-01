import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { JsonLd } from "./JsonLd";
import { siteUrl } from "@/lib/env";
import { cn } from "@/lib/format";

export type Crumb = { label: string; href: string };

export function Breadcrumbs({ items, light, className }: { items: Crumb[]; light?: boolean; className?: string }) {
  const all = [{ label: "Home", href: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb" className={cn("text-sm", className)}>
        <ol className={cn("flex flex-wrap items-center gap-1.5", light ? "text-white/75" : "text-muted")}>
          {all.map((c, i) => (
            <li key={c.href} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight aria-hidden className="h-3.5 w-3.5 opacity-60" />}
              {i === all.length - 1 ? (
                <span aria-current="page" className={light ? "text-white" : "text-ink"}>
                  {c.label}
                </span>
              ) : (
                <Link href={c.href} className="transition-colors hover:text-gold">
                  {c.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.label,
            item: `${siteUrl}${c.href === "/" ? "" : c.href}`,
          })),
        }}
      />
    </>
  );
}
