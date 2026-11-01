import { cn } from "@/lib/format";

/** Visible marker for unverified placeholder content. */
export function SampleBadge({ className, label = "Sample" }: { className?: string; label?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-dashed border-amber-600/60 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-amber-800",
        className
      )}
      title="Placeholder content — to be replaced with verified S2 Holidays information"
    >
      {label}
    </span>
  );
}
