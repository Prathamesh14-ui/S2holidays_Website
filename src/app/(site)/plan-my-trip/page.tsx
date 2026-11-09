import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/layout/PageHero";
import { Container } from "@/components/ui/Container";
import { TripPlanner } from "@/components/planner/TripPlanner";
import { getPlannerDestinations, getSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Plan My Trip – Build Your Own Itinerary",
  description:
    "Build your own holiday: choose places and nights, pick sightseeing, hotel category, meals and vehicle, and get a day-wise plan from S2 Holidays.",
  path: "/plan-my-trip",
});

export default async function PlanMyTripPage() {
  const [destinations, settings] = await Promise.all([getPlannerDestinations(), getSettings()]);
  return (
    <>
      <div className="print:hidden">
        <PageHero
          title="Plan your own trip"
          eyebrow="Trip planner"
          intro="Choose places and nights, tick the sightseeing you like, pick your hotel category — and get a day-wise plan in seconds."
          size="sm"
          crumbs={[{ label: "Plan my trip", href: "/plan-my-trip" }]}
        />
      </div>
      <section className="py-12 sm:py-16 print:py-0">
        <Container>
          <Suspense fallback={<p className="text-muted">Loading the trip planner…</p>}>
            <TripPlanner destinations={destinations} whatsapp={settings.whatsapp} />
          </Suspense>
        </Container>
      </section>
    </>
  );
}
