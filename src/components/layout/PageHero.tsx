import { AppImage } from "@/components/ui/AppImage";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/format";
import { HeroSlideshow } from "@/components/home/HeroSlideshow";
import type { HeroSlide, SiteImage } from "@/lib/types";

export function PageHero({
  title,
  eyebrow,
  intro,
  image,
  slides,
  crumbs,
  size = "md",
  children,
}: {
  title: string;
  eyebrow?: string;
  intro?: string;
  image?: SiteImage;
  /** Two or more photos turn the banner into a fading slideshow (like the homepage). */
  slides?: HeroSlide[];
  crumbs?: Crumb[];
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "relative isolate flex items-end overflow-hidden bg-ink",
        size === "sm" && "min-h-[22rem]",
        size === "md" && "min-h-[28rem] sm:min-h-[32rem]",
        size === "lg" && "min-h-[34rem] sm:min-h-[40rem]"
      )}
    >
      {slides && slides.length > 1 ? (
        <HeroSlideshow slides={slides} />
      ) : (
        (slides?.[0]?.image ?? image) && (
          <AppImage image={slides?.[0]?.image ?? image} priority sizes="100vw" className="-z-10 animate-[fade-up_1.2s_ease-out_both]" />
        )
      )}
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/55 to-ink/30" />
      <Container className="pb-12 pt-36 sm:pb-16">
        {crumbs && <Breadcrumbs items={crumbs} light className="mb-6" />}
        {eyebrow && <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold-soft">{eyebrow}</p>}
        <h1 className="max-w-4xl animate-fade-up text-balance text-5xl leading-[1.05] text-white sm:text-6xl lg:text-7xl">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/80">{intro}</p>}
        {children}
      </Container>
      {image?.kind === "sanity" && image.credit && (
        <p className="absolute bottom-2 right-3 max-w-[70%] truncate text-[10px] text-white/60">
          Photo:{" "}
          {image.creditUrl ? (
            <a href={image.creditUrl} target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:text-white hover:underline">
              {image.credit}
            </a>
          ) : (
            image.credit
          )}
        </p>
      )}
    </section>
  );
}
