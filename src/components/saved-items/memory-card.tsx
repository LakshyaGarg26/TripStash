import { AlertTriangle, CheckCircle2, ExternalLink, ImageIcon, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { SavedMemory } from "@/lib/travel/demo-data";
import { formatDate } from "@/lib/utils";

const confidenceVariant = {
  high: "secondary",
  medium: "muted",
  low: "warning",
} as const;

export function MemoryCard({ memory }: { memory: SavedMemory }) {
  return (
    <Card className="overflow-hidden transition-colors hover:border-primary/60">
      <div className="flex min-h-36">
        <div className="flex w-28 shrink-0 items-center justify-center bg-accent text-accent-foreground sm:w-36">
          <ImageIcon className="size-8" />
        </div>
        <CardContent className="flex flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap gap-1.5">
                <Badge variant="secondary">{memory.destination}</Badge>
                <Badge variant="outline">{memory.category}</Badge>
                <Badge variant={confidenceVariant[memory.confidence]}>
                  {memory.confidence === "low" ? (
                    <AlertTriangle className="mr-1 size-3" />
                  ) : (
                    <CheckCircle2 className="mr-1 size-3" />
                  )}
                  {memory.confidence}
                </Badge>
              </div>
              <h3 className="line-clamp-2 text-base font-semibold">
                {memory.title}
              </h3>
            </div>
            {memory.mustVisit ? (
              <Star className="size-4 shrink-0 fill-primary text-primary" />
            ) : null}
          </div>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {memory.summary}
          </p>
          <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              {memory.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="muted">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{memory.source}</span>
              <span>{formatDate(memory.savedAt)}</span>
              <ExternalLink className="size-3" />
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
