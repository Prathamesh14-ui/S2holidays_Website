import { cn } from "@/lib/format";

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  light,
  className,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
  light?: boolean;
  className?: string;
}) {
  return (
    <div data-reveal className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className={cn("mb-3 text-xs font-semibold uppercase tracking-[0.28em]", light ? "text-gold-soft" : "text-gold")}>
          {eyebrow}
        </p>
      )}
      <h2 className={cn("text-4xl leading-[1.1] sm:text-5xl", light ? "text-white" : "text-ink")}>{title}</h2>
      {intro && <p className={cn("mt-4 text-base leading-relaxed sm:text-lg", light ? "text-white/75" : "text-muted")}>{intro}</p>}
    </div>
  );
}
