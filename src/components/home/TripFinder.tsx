"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import type { Destination } from "@/lib/types";

/** Destination quick-search. Works without JS via a GET to /packages. */
export function TripFinder({ destinations }: { destinations: Pick<Destination, "name" | "slug" | "region">[] }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const groups = [
    { label: "India", items: destinations.filter((d) => d.region === "domestic") },
    { label: "International", items: destinations.filter((d) => d.region === "international") },
  ];
  return (
    <form
      action="/packages"
      method="get"
      onSubmit={(e) => {
        e.preventDefault();
        router.push(value ? `/destinations/${value}` : "/packages");
      }}
      className="mt-10 flex w-full max-w-2xl flex-col gap-2 rounded-3xl bg-white/95 p-2 shadow-lift backdrop-blur sm:flex-row sm:items-center sm:rounded-full"
    >
      <label htmlFor="trip-destination" className="sr-only">Choose a destination</label>
      <select
        id="trip-destination"
        name="destination"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-12 flex-1 cursor-pointer appearance-none rounded-full bg-white px-5 text-base text-ink focus:outline-none"
      >
        <option value="">Where would you like to go?</option>
        {groups.map((g) => (
          <optgroup key={g.label} label={g.label}>
            {g.items.map((d) => (
              <option key={d.slug} value={d.slug}>{d.name}</option>
            ))}
          </optgroup>
        ))}
      </select>
      <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-gold px-7 text-sm font-medium text-white transition-colors hover:bg-gold-deep">
        <Search aria-hidden className="h-4 w-4" /> Explore trips
      </button>
    </form>
  );
}
