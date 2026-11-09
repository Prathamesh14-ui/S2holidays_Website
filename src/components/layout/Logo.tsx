import Image from "next/image";
import { cn } from "@/lib/format";

const SRC = { light: "/brand/s2-holidays-logo.png", dark: "/brand/s2-holidays-logo-on-dark.png" } as const;

/**
 * S2 Holidays logo (horizontal). `onDark` uses the version with a white ™ for dark backgrounds.
 * Source files: public/brand/ (814 × 200, transparent PNG).
 */
export function Logo({ onDark, className, priority }: { onDark?: boolean; className?: string; priority?: boolean }) {
  return (
    <Image
      src={onDark ? SRC.dark : SRC.light}
      alt="S2 Holidays — Your Travel Buddies"
      width={814}
      height={200}
      unoptimized
      loading={priority ? "eager" : undefined}
      fetchPriority={priority ? "high" : undefined}
      className={cn("w-auto max-w-none", className)}
    />
  );
}
