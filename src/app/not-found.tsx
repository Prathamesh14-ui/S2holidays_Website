import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-ink px-6 text-center text-white">
      <Link href="/" className="mb-12 flex items-baseline gap-1">
        <span className="font-display text-4xl font-bold">S2</span>
        <span className="text-xs font-semibold uppercase tracking-[0.35em] text-gold-soft">Holidays</span>
      </Link>
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-soft">404</p>
      <h1 className="mt-3 text-5xl sm:text-6xl">This page has wandered off</h1>
      <p className="mt-4 max-w-md text-white/70">The page you&apos;re looking for doesn&apos;t exist or has moved.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonClass("gold")}>Back to home</Link>
        <Link href="/packages" className={buttonClass("ghost-light")}>Browse packages</Link>
      </div>
    </main>
  );
}
