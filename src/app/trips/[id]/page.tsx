import { ExternalLink, MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell/app-shell";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { GenerateItineraryButton } from "@/components/trips/generate-itinerary-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTrip } from "@/lib/travel/queries";
import { cn, extractEntityId, formatDate, savedItemHref } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TripPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = await getTrip(extractEntityId(id));

  if (!trip) notFound();
  const placeResearchMeta = readPlaceResearchMeta(trip.itinerary?.generationInput);

  return (
    <AppShell>
      <div className="space-y-6">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Trips", href: "/trips" },
            { label: trip.destination },
          ]}
        />

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
              <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
                <p>{trip.itinerary.summary}</p>
                {placeResearchMeta ? (
                  <div className="rounded-lg border bg-background p-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {placeResearchMeta.count} researched places
                      </Badge>
                      {placeResearchMeta.usedFallback ? (
                        <Badge variant="warning">Local fallback</Badge>
                      ) : null}
                      {placeResearchMeta.providers.map((provider) => (
                        <Badge variant="muted" key={provider}>
                          {provider}
                        </Badge>
                      ))}
                    </div>
                    {placeResearchMeta.attribution ? (
                      <p className="mt-2 text-xs">{placeResearchMeta.attribution}</p>
                    ) : null}
                    {placeResearchMeta.warnings.length > 0 ? (
                      <p className="mt-2 text-xs">
                        {placeResearchMeta.warnings[0]}
                      </p>
                    ) : null}
                    {placeResearchMeta.generationError ? (
                      <p className="mt-2 text-xs">
                        Gemini is not currently generating for this key, so this
                        itinerary was built locally from place data.
                      </p>
                    ) : null}
                  </div>
                ) : null}
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
                              href={savedItemHref(influence.savedItem)}
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
                      </div>

                      {item.options.length > 0 ? (
                        <div className="mt-4 grid gap-2 md:grid-cols-2">
                          {item.options.map((option) => (
                            <div
                              className="rounded-md border bg-muted/30 p-3 text-sm"
                              key={option.id}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-medium">{option.name}</p>
                                  {option.area ? (
                                    <p className="text-xs text-muted-foreground">
                                      {option.area}
                                    </p>
                                  ) : null}
                                </div>
                                {option.priceRange ? (
                                  <Badge variant="muted">{option.priceRange}</Badge>
                                ) : null}
                              </div>
                              {option.bestFor ? (
                                <p className="mt-2 text-xs text-muted-foreground">
                                  Best for {option.bestFor}
                                </p>
                              ) : null}
                              {option.sourceUrls.length > 0 ? (
                                <a
                                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary"
                                  href={option.sourceUrls[0]}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <ExternalLink className="size-3.5" />
                                  Source
                                </a>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      ) : null}
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

function readPlaceResearchMeta(input: unknown) {
  if (!input || typeof input !== "object") return null;
  const record = input as Record<string, unknown>;
  const count =
    typeof record.placeResearchCount === "number" ? record.placeResearchCount : 0;
  const providers = Array.isArray(record.placeResearchProviders)
    ? record.placeResearchProviders.filter(
        (provider): provider is string => typeof provider === "string",
      )
    : [];
  const warnings = Array.isArray(record.placeResearchWarnings)
    ? record.placeResearchWarnings.filter(
        (warning): warning is string => typeof warning === "string",
      )
    : [];
  const attribution =
    typeof record.placeResearchAttribution === "string"
      ? record.placeResearchAttribution
      : "";
  const usedFallback =
    typeof record.usedFallback === "boolean" ? record.usedFallback : false;
  const generationError =
    typeof record.generationError === "string" ? record.generationError : "";

  if (count === 0 && providers.length === 0) return null;

  return { count, providers, warnings, attribution, usedFallback, generationError };
}
