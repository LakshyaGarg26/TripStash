import { ArrowRight, MapPin } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { getTrip } from "@/lib/travel/queries";
import { cn } from "@/lib/utils";

type TripWithItinerary = NonNullable<Awaited<ReturnType<typeof getTrip>>>;

export function ItineraryPreview({ trip }: { trip: TripWithItinerary | null }) {
  if (!trip?.itinerary) {
    return (
      <section className="rounded-lg border bg-card p-8 text-center">
        <Badge variant="secondary">No itinerary yet</Badge>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight">
          Create a trip to generate a timeline.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Once a trip has an itinerary, it will appear here with clickable day
          and place cards.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <Badge variant="secondary">Generated preview</Badge>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {trip.destination} itinerary timeline
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cards show why an item was chosen and which memory influenced it.
          </p>
        </div>
        <Link
          className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          href={`/trips/${trip.id}`}
        >
          View full trip
          <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {trip.itinerary.days.map((day) => (
          <Card key={day.id}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>
                    Day {day.dayNumber} - {day.area}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {day.date.toISOString().slice(0, 10)}
                  </p>
                </div>
                <Badge variant="outline">{day.items.length} stops</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{day.summary}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {day.items.map((item) => (
                <Link
                  className="block rounded-lg border bg-background p-3 transition-colors hover:border-primary"
                  href={`/trips/${trip.id}#item-${item.id}`}
                  key={item.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge variant="muted">{item.timeBlock}</Badge>
                      <h3 className="mt-2 font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.selectedOptionName}
                      </p>
                    </div>
                    <Badge variant="secondary">{item.estimatedCost ?? "TBD"}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {item.reasoning}
                  </p>
                  <span
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                  >
                    <MapPin className="size-4" />
                    Open map search
                  </span>
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
