import { AppShell } from "@/components/app-shell/app-shell";
import { MemoryInbox } from "@/components/saved-items/memory-inbox";
import { ItineraryPreview } from "@/components/trips/itinerary-preview";
import { PlanTripCard } from "@/components/trips/plan-trip-card";
import {
  getLatestTripWithItinerary,
  getSavedItems,
  getWorkspaceDefaults,
} from "@/lib/travel/queries";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const filters = await searchParams;
  const [memories, trip, workspace] = await Promise.all([
    getSavedItems({ q: filters.q, category: filters.category }),
    getLatestTripWithItinerary(),
    getWorkspaceDefaults(),
  ]);

  return (
    <AppShell>
      <div className="space-y-8">
        <MemoryInbox
          activeCategory={filters.category ?? "all"}
          basePath="/"
          limit={6}
          memories={memories}
          query={filters.q ?? ""}
          showViewMore
          workspaceLabel={workspace.label}
        />
        <PlanTripCard defaults={workspace} />
        <ItineraryPreview trip={trip} />
      </div>
    </AppShell>
  );
}
