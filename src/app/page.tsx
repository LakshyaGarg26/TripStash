import { AppShell } from "@/components/app-shell/app-shell";
import { MemoryInbox } from "@/components/saved-items/memory-inbox";
import { ItineraryPreview } from "@/components/trips/itinerary-preview";
import { PlanTripCard } from "@/components/trips/plan-trip-card";

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-8">
        <MemoryInbox />
        <PlanTripCard />
        <ItineraryPreview />
      </div>
    </AppShell>
  );
}
