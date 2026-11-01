import { createImageUrlBuilder } from "@sanity/image-url";
import { sanityDataset, sanityProjectId } from "@/lib/env";
import type { SiteImage } from "@/lib/types";

const builder = createImageUrlBuilder({ projectId: sanityProjectId || "placeholder", dataset: sanityDataset });

/** Resolve any SiteImage to a URL, optionally sized (Sanity images only). */
export function imageUrl(image: SiteImage | undefined, width = 1600, height?: number): string | undefined {
  if (!image) return undefined;
  if (image.kind === "local") return image.src;
  let b = builder.image(image).width(width).auto("format").quality(80);
  if (height) b = b.height(height).fit("crop");
  return b.url();
}
