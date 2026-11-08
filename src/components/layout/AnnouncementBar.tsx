import Link from "next/link";
import type { Announcement } from "@/lib/types";

/** Thin site-wide bar for promotions (managed in Site settings → Announcement bar). */
export function AnnouncementBar({ announcement }: { announcement: Announcement }) {
  const { text, link } = announcement;
  const href = link?.trim();
  const internal = href?.startsWith("/");
  const external = href && /^https:\/\//i.test(href);
  const cls = "block bg-offer px-4 py-2 text-center text-xs font-medium text-white sm:text-sm";
  if (internal) {
    return (
      <Link href={href!} className={`${cls} hover:brightness-110`}>
        {text} <span aria-hidden>→</span>
      </Link>
    );
  }
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={`${cls} hover:brightness-110`}>
        {text} <span aria-hidden>→</span>
      </a>
    );
  }
  return (
    <p role="note" className={cls}>
      {text}
    </p>
  );
}
