import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ImageIcon,
  MapPin,
  Star,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, savedItemHref } from "@/lib/utils";

export type MemoryCardItem = {
  id: string;
  title: string;
  summary: string | null;
  detectedDestination: string | null;
  category: string;
  sourcePlatform: string | null;
  originalUrl?: string | null;
  thumbnailUrl?: string | null;
  confidence: number;
  tags: string[];
  createdAt: Date;
  isMustVisit: boolean;
};

const confidenceVariant = {
  high: "secondary",
  medium: "muted",
  low: "warning",
} as const;

function getConfidence(confidence: number) {
  if (confidence >= 0.75) return "high";
  if (confidence >= 0.55) return "medium";
  return "low";
}

export function MemoryCard({ memory }: { memory: MemoryCardItem }) {
  const confidence = getConfidence(memory.confidence);

  return (
    <Card className="overflow-hidden transition-colors hover:border-primary/60">
      <Link href={savedItemHref(memory)} className="block">
        <div className="flex min-h-40">
          <MemoryVisual memory={memory} />
          <CardContent className="flex flex-1 flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <Badge variant="secondary">
                    {memory.detectedDestination ?? "Needs review"}
                  </Badge>
                  <Badge variant="outline">{memory.category}</Badge>
                  <Badge variant={confidenceVariant[confidence]}>
                    {confidence === "low" ? (
                      <AlertTriangle className="mr-1 size-3" />
                    ) : (
                      <CheckCircle2 className="mr-1 size-3" />
                    )}
                    {confidence}
                  </Badge>
                </div>
                <h3 className="line-clamp-2 text-base font-semibold">
                  {memory.title}
                </h3>
              </div>
              {memory.isMustVisit ? (
                <Star className="size-4 shrink-0 fill-primary text-primary" />
              ) : null}
            </div>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {memory.summary ?? "No summary yet."}
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
                <span>{memory.sourcePlatform ?? "Note"}</span>
                <span>{formatDate(memory.createdAt)}</span>
                {memory.originalUrl ? <ExternalLink className="size-3" /> : null}
              </div>
            </div>
          </CardContent>
        </div>
      </Link>
    </Card>
  );
}

function MemoryVisual({ memory }: { memory: MemoryCardItem }) {
  if (memory.thumbnailUrl) {
    return (
      <div
        aria-hidden="true"
        className="w-28 shrink-0 bg-muted bg-cover bg-center sm:w-36"
        style={{ backgroundImage: `url(${memory.thumbnailUrl})` }}
      />
    );
  }

  const Icon = memory.detectedDestination ? MapPin : ImageIcon;

  return (
    <div className="flex w-28 shrink-0 flex-col items-center justify-center gap-2 bg-accent text-accent-foreground sm:w-36">
      <Icon className="size-7" />
      <span className="max-w-24 truncate px-2 text-xs font-medium">
        {memory.category}
      </span>
    </div>
  );
}
