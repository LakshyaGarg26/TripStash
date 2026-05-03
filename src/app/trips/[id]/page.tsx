import { ArrowLeft, ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell/app-shell";
import { GenerateItineraryButton } from "@/components/trips/generate-itinerary-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTrip } from "@/lib/travel/queries";
import { cn, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = await getTrip(id);

  if (!trip) notFound();

  return (
    <AppShell>
      <div className="space-y-6">
        <Link
          className={cn(buttonVariants({ variant: "ghost" }), "pl-0")}
          href="/trips"
        >
          <ArrowLeft />
          Trips
        </Link>

        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Badge variant="secondary">{trip.status}</Badge>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              {trip.destination}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)} ·{" "}
              {trip.pace} pace · {trip.budgetLevel} budget
            </p>
          </div>
          <GenerateItineraryButton tripId={trip.id} />
        </div>

        {trip.notes ? (
          <Card>
            <CardContent className="p-4 text-sm text-muted-foreground">
              {trip.notes}
            </CardContent>
          </Card>
        ) : null}

        {trip.itinerary ? (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Itinerary summary</CardTitle>
              </CardHeader>
              <CardContent className="text-sm leading-6 text-muted-foreground">
                {trip.itinerary.summary}
              </CardContent>
            </Card>

            {trip.itinerary.days.map((day) => (
              <Card key={day.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <CardTitle>
                        Day {day.dayNumber} - {day.area}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(day.date)}
                      </p>
                    </div>
                    <Badge variant="outline">{day.items.length} stops</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{day.summary}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {day.items.map((item) => (
                    <div
                      className="rounded-lg border bg-background p-4"
                      id={`item-${item.id}`}
                      key={item.id}
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row">
                        <div>
                          <Badge variant="muted">{item.timeBlock}</Badge>
                          <h3 className="mt-2 text-lg font-semibold">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {item.selectedOptionName}
                          </p>
                        </div>
                        <Badge className="h-fit" variant="secondary">
                          {item.estimatedCost ?? "TBD"}
                        </Badge>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-muted-foreground">
                        {item.reasoning}
                      </p>

                      {item.influences.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.influences.map((influence) => (
                            <Link
                              href={`/saved/${influence.savedItemId}`}
                              key={influence.id}
                            >
                              <Badge variant="warning">
                                saved: {influence.savedItem.title}
                              </Badge>
                            </Link>
                          ))}
                        </div>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {item.mapSearchUrl ? (
                          <a
                            className={cn(
                              buttonVariants({ variant: "outline", size: "sm" }),
                              "gap-2",
                            )}
                            href={item.mapSearchUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <MapPin className="size-4" />
                            Map
                          </a>
                        ) : null}
                        {item.options.length > 0 ? (
                          <Badge variant="outline">
                            {item.options.length} alternatives
                          </Badge>
                        ) : null}
                        <ExternalLink className="size-4 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="font-semibold">No itinerary generated yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Generate one from your saved TripStash memories.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
