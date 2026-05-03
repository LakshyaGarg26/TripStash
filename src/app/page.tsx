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

export default async function Home() {
  const [memories, trip, workspace] = await Promise.all([
    getSavedItems(),
    getLatestTripWithItinerary(),
    getWorkspaceDefaults(),
  ]);

  return (
    <AppShell>
      <div className="space-y-8">
        <MemoryInbox memories={memories} workspaceLabel={workspace.label} />
        <PlanTripCard defaults={workspace} />
        <ItineraryPreview trip={trip} />
      </div>
    </AppShell>
  );
}
