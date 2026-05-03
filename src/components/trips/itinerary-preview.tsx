import { ArrowRight, MapPin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { baliItinerary } from "@/lib/travel/demo-data";
import { createMapSearchUrl } from "@/lib/utils";

export function ItineraryPreview() {
  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <Badge variant="secondary">Generated preview</Badge>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            Bali itinerary timeline
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cards show why an item was chosen and which memory influenced it.
          </p>
        </div>
        <Button variant="outline" type="button">
          View full trip
          <ArrowRight />
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {baliItinerary.map((day) => (
          <Card key={day.day}>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <CardTitle>
                    Day {day.day} - {day.area}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {day.date}
                  </p>
                </div>
                <Badge variant="outline">{day.items.length} stops</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{day.summary}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {day.items.map((item) => (
                <div
                  className="rounded-lg border bg-background p-3"
                  key={`${day.day}-${item.time}-${item.place}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <Badge variant="muted">{item.time}</Badge>
                      <h3 className="mt-2 font-medium">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {item.place}
                      </p>
                    </div>
                    <Badge variant="secondary">{item.cost}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    {item.reason}
                  </p>
                  {item.influencedBy.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {item.influencedBy.map((memory) => (
                        <Badge key={memory} variant="warning">
                          saved: {memory}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  <a
                    className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary"
                    href={createMapSearchUrl(item.place)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MapPin className="size-4" />
                    Open map search
                  </a>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
