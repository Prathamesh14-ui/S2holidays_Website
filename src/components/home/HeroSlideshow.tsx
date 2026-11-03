"use client";

import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Pause, Play } from "lucide-react";
import { AppImage } from "@/components/ui/AppImage";
import { cn } from "@/lib/format";
import type { HeroSlide } from "@/lib/types";

const INTERVAL_MS = 6500;
const RM = "(prefers-reduced-motion: reduce)";
const subscribeRM = (cb: () => void) => {
  const mq = window.matchMedia(RM);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * Full-bleed background slideshow for the homepage hero.
 * - Cross-fades to a randomly chosen next photo every few seconds.
 * - The first photo is server-rendered and loaded eagerly (fast first paint).
 * - Pauses automatically for users who prefer reduced motion; manual pause button (WCAG 2.2.2).
 */
export function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [userPaused, setUserPaused] = useState<boolean | null>(null);
  const reducedMotion = useSyncExternalStore(subscribeRM, () => window.matchMedia(RM).matches, () => false);
  const paused = userPaused ?? reducedMotion;
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0]));
  const many = slides.length > 1;

  useEffect(() => {
    if (!many || paused) return;
    const t = window.setInterval(() => {
      setIndex((current) => {
        let next = current;
        while (next === current) next = Math.floor(Math.random() * slides.length);
        setLoaded((l) => (l.has(next) ? l : new Set(l).add(next)));
        return next;
      });
    }, INTERVAL_MS);
    return () => window.clearInterval(t);
  }, [many, paused, slides.length]);

  // Preload the next candidate photos shortly after the first paint
  useEffect(() => {
    if (!many) return;
    const t = window.setTimeout(() => setLoaded(new Set(slides.map((_, i) => i))), 2500);
    return () => window.clearTimeout(t);
  }, [many, slides]);

  const current = slides[index];

  return (
    <>
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        {slides.map((s, i) =>
          loaded.has(i) ? (
            <div
              key={i}
              className={cn(
                "absolute inset-0 transition-opacity duration-[1600ms] ease-in-out",
                i === index ? "opacity-100" : "opacity-0"
              )}
            >
              <AppImage
                image={s.image}
                priority={i === 0}
                sizes="100vw"
                className={cn("transition-transform duration-[9000ms] ease-out", i === index ? "scale-105" : "scale-100")}
              />
            </div>
          ) : null
        )}
      </div>

      {(many || current?.caption) && (
        <div className="absolute bottom-28 right-4 z-10 flex items-center gap-3 sm:bottom-24 sm:right-8">
          {current?.caption &&
            (current.href ? (
              <Link href={current.href} className="rounded-full bg-ink/40 px-4 py-1.5 text-xs font-medium tracking-wide text-white backdrop-blur hover:bg-ink/60">
                {current.caption} →
              </Link>
            ) : (
              <span className="rounded-full bg-ink/40 px-4 py-1.5 text-xs font-medium tracking-wide text-white backdrop-blur">{current.caption}</span>
            ))}
          {many && (
            <button
              type="button"
              onClick={() => setUserPaused(!paused)}
              aria-label={paused ? "Play slideshow" : "Pause slideshow"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/40 text-white backdrop-blur hover:bg-ink/60"
            >
              {paused ? <Play aria-hidden className="h-3.5 w-3.5" /> : <Pause aria-hidden className="h-3.5 w-3.5" />}
            </button>
          )}
        </div>
      )}
    </>
  );
}
