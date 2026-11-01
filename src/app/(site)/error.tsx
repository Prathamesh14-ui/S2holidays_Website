"use client";

import { useEffect } from "react";
import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="flex min-h-[70vh] flex-col items-center justify-center bg-ink px-6 pt-24 text-center text-white">
      <h1 className="text-5xl">Something went wrong</h1>
      <p className="mt-4 max-w-md text-white/70">Please try again. If the problem continues, contact us directly.</p>
      <div className="mt-8 flex gap-3">
        <button type="button" onClick={reset} className={buttonClass("gold")}>Try again</button>
        <Link href="/" className={buttonClass("ghost-light")}>Home</Link>
      </div>
    </section>
  );
}
