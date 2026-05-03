import { CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";

import { AppShell } from "@/components/app-shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlanTripCard } from "@/components/trips/plan-trip-card";
import { getTrips, getWorkspaceDefaults } from "@/lib/travel/queries";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TripsPage() {
  const [trips, workspace] = await Promise.all([
    getTrips(),
    getWorkspaceDefaults(),
  ]);

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <Badge variant="secondary">Trips</Badge>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Planned from your saved memories.
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create trips, generate itineraries, and revisit previous plans.
          </p>
        </div>

        <PlanTripCard defaults={workspace} />

        <div className="grid gap-3 md:grid-cols-2">
          {trips.map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}`}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="size-4 text-primary" />
                    {trip.destination}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{trip.pace}</Badge>
                  <Badge variant="outline">{trip.budgetLevel}</Badge>
                  <Badge variant={trip.itinerary ? "default" : "muted"}>
                    <CalendarDays className="mr-1 size-3" />
                    {trip.itinerary ? "Itinerary ready" : "Draft"}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
