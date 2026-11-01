import Link from "next/link";

export function SampleBanner() {
  return (
    <div role="note" className="bg-amber-100 px-4 py-2 text-center text-xs text-amber-900 sm:text-sm">
      <strong>Preview build:</strong> this site shows sample content, placeholder images and no verified prices or
      reviews. <Link href="/about#sample-content" className="underline underline-offset-2">Learn more</Link>
    </div>
  );
}
