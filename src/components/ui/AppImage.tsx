import Image from "next/image";
import type { SiteImage } from "@/lib/types";
import { imageUrl } from "@/sanity/lib/image";
import { cn } from "@/lib/format";

type Props = {
  image?: SiteImage;
  sizes?: string;
  /** Above-the-fold / LCP image: load eagerly with high fetch priority. */
  priority?: boolean;
  className?: string;
  /** Fallback alt text if the CMS image has none. */
  alt?: string;
};

/** Fills its (relatively positioned) parent. Handles Sanity and local sample images. */
export function AppImage({ image, sizes = "100vw", priority, className, alt }: Props) {
  if (!image) {
    return <div aria-hidden className={cn("absolute inset-0 bg-gradient-to-br from-teal to-ink", className)} />;
  }
  const src = imageUrl(image, 2000);
  if (!src) return null;
  const isSvg = image.kind === "local" && src.endsWith(".svg");
  return (
    <Image
      src={src}
      alt={image.alt || alt || ""}
      fill
      sizes={sizes}
      loading={priority ? "eager" : undefined}
      fetchPriority={priority ? "high" : undefined}
      unoptimized={isSvg}
      quality={80}
      className={cn("object-cover", className)}
    />
  );
}
