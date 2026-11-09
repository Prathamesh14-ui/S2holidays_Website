"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Menu, Phone, X } from "lucide-react";
import { cn } from "@/lib/format";
import type { NavItem } from "@/lib/navigation";
import { buttonClass } from "@/components/ui/Button";
import { Logo } from "./Logo";

export function Header({
  nav,
  companyName,
  phone,
  notice,
}: {
  nav: NavItem[];
  companyName: string;
  phone?: string;
  notice?: React.ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const hoverOpenedAt = useRef(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus on navigation (state reset during render — see react.dev "you might not need an effect")
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
    setMenu(null);
  }

  // Lock body scroll while the mobile menu is open; close on Escape
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMenu(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Close desktop dropdown when clicking outside
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMenu(null);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const solid = scrolled || open;
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid ? "bg-white/95 shadow-[0_1px_0_rgb(15_29_43/0.08)] backdrop-blur-md" : "bg-gradient-to-b from-ink/60 to-transparent"
      )}
    >
      {notice}
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:h-20 lg:px-8">
        <Link href="/" className="relative block shrink-0" aria-label={`${companyName} home`}>
          {/* Two versions: white ™ over the dark hero, standard once the header turns white */}
          <Logo priority className={cn("h-10 transition-opacity duration-300 sm:h-12 lg:h-11 xl:h-14", solid ? "opacity-0" : "opacity-100")} onDark />
          <Logo priority className={cn("absolute inset-0 h-10 transition-opacity duration-300 sm:h-12 lg:h-11 xl:h-14", solid ? "opacity-100" : "opacity-0")} />
        </Link>

        <nav ref={navRef} aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) =>
              item.children ? (
                <li key={item.href} className="relative">
                  <button
                    type="button"
                    aria-expanded={menu === item.href}
                    aria-controls={`menu-${item.label}`}
                    onClick={() => {
                      // A mouse click right after hover-open should not immediately close the menu
                      if (menu === item.href && Date.now() - hoverOpenedAt.current < 500) return;
                      setMenu(menu === item.href ? null : item.href);
                    }}
                    onMouseEnter={() => {
                      if (menu !== item.href) hoverOpenedAt.current = Date.now();
                      setMenu(item.href);
                    }}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-2.5 py-2 text-sm font-medium transition-colors xl:px-3.5",
                      solid ? "text-ink hover:text-gold" : "text-white/90 hover:text-white",
                      isActive(item.href) && (solid ? "text-gold" : "text-white")
                    )}
                  >
                    {item.label}
                    <ChevronDown aria-hidden className={cn("h-4 w-4 transition-transform", menu === item.href && "rotate-180")} />
                  </button>
                  <div
                    id={`menu-${item.label}`}
                    onMouseLeave={() => setMenu(null)}
                    className={cn(
                      "absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3 transition-all duration-200",
                      menu === item.href ? "visible opacity-100" : "invisible -translate-y-1 opacity-0"
                    )}
                  >
                    <ul className="overflow-hidden rounded-2xl border border-line bg-white p-2 shadow-lift">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} className="block rounded-xl px-4 py-2.5 transition-colors hover:bg-sand">
                            <span className="block text-sm font-medium text-ink">{c.label}</span>
                            {c.description && <span className="block text-xs text-muted">{c.description}</span>}
                          </Link>
                        </li>
                      ))}
                      <li className="mt-1 border-t border-line pt-1">
                        <Link href={item.href} className="block rounded-xl px-4 py-2.5 text-sm font-medium text-gold hover:bg-sand">
                          View all {item.label.toLowerCase()} →
                        </Link>
                      </li>
                    </ul>
                  </div>
                </li>
              ) : (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive(item.href) ? "page" : undefined}
                    className={cn(
                      "rounded-full px-2.5 py-2 text-sm font-medium transition-colors xl:px-3.5",
                      solid ? "text-ink hover:text-gold" : "text-white/90 hover:text-white",
                      isActive(item.href) && (solid ? "text-gold" : "text-white underline decoration-gold decoration-2 underline-offset-8")
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            )}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {phone && (
            <a
              href={`tel:${phone.replace(/[^\d+]/g, "")}`}
              className={cn("hidden items-center gap-2 whitespace-nowrap text-sm font-medium 2xl:flex", solid ? "text-ink" : "text-white")}
            >
              <Phone aria-hidden className="h-4 w-4 text-gold" /> {phone}
            </a>
          )}
          <Link href="/plan-my-trip" className={buttonClass("gold", "whitespace-nowrap px-5 py-2.5 max-sm:hidden")}>
            Plan my trip
          </Link>
          <button
            type="button"
            className={cn("rounded-full p-2 lg:hidden", solid ? "text-ink" : "text-white")}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        className={cn(
          "absolute inset-x-0 top-full h-[calc(100dvh-100%)] overflow-y-auto bg-white transition-all duration-300 lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0"
        )}
      >
        <nav aria-label="Mobile" className="px-4 pb-10 pt-4">
          <ul className="divide-y divide-line">
            {nav.map((item) => (
              <li key={item.href} className="py-1">
                {item.children ? (
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-lg font-medium text-ink">
                      {item.label}
                      <ChevronDown aria-hidden className="h-5 w-5 transition-transform group-open:rotate-180" />
                    </summary>
                    <ul className="mb-3 space-y-1 pl-3">
                      {item.children.map((c) => (
                        <li key={c.href}>
                          <Link href={c.href} className="block py-2 text-muted hover:text-gold">
                            {c.label}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link href={item.href} className="block py-2 font-medium text-gold">
                          View all →
                        </Link>
                      </li>
                    </ul>
                  </details>
                ) : (
                  <Link href={item.href} className="block py-3 text-lg font-medium text-ink">
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <Link href="/plan-my-trip" className={buttonClass("gold", "mt-6 w-full")}>
            Plan my trip
          </Link>
          {phone && (
            <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className={buttonClass("outline", "mt-3 w-full")}>
              <Phone aria-hidden className="h-4 w-4" /> Call {phone}
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
