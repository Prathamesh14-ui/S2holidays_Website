import Link from "next/link";
import { cn } from "@/lib/format";

type Variant = "primary" | "gold" | "outline" | "ghost-light" | "whatsapp";
const styles: Record<Variant, string> = {
  primary: "bg-ink text-white hover:bg-ink-soft",
  gold: "bg-gold text-white hover:bg-gold-deep",
  outline: "border border-ink/20 text-ink hover:border-ink hover:bg-ink hover:text-white",
  "ghost-light": "border border-white/40 text-white hover:bg-white hover:text-ink",
  whatsapp: "bg-whatsapp text-white hover:brightness-110",
};
const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none";

export function buttonClass(variant: Variant = "primary", className?: string) {
  return cn(base, styles[variant], className);
}

export function ButtonLink({
  href,
  variant = "primary",
  className,
  children,
  external,
  ...rest
}: { href: string; variant?: Variant; className?: string; children: React.ReactNode; external?: boolean } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
>) {
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClass(variant, className)} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={buttonClass(variant, className)} {...rest}>
      {children}
    </Link>
  );
}
