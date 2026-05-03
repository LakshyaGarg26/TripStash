import { ArrowLeft, ExternalLink, Star } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell/app-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSavedItem } from "@/lib/travel/queries";
import { cn, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SavedItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getSavedItem(id);

  if (!item) notFound();

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-4">
        <Link
          className={cn(buttonVariants({ variant: "ghost" }), "pl-0")}
          href="/saved"
        >
          <ArrowLeft />
          Saved memories
        </Link>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">
                {item.detectedDestination ?? "Needs review"}
              </Badge>
              <Badge variant="outline">{item.category}</Badge>
              <Badge variant={item.confidence < 0.6 ? "warning" : "muted"}>
                confidence {Math.round(item.confidence * 100)}%
              </Badge>
              {item.isMustVisit ? (
                <Badge>
                  <Star className="mr-1 size-3" />
                  Must visit
                </Badge>
              ) : null}
            </div>
            <CardTitle className="text-2xl leading-tight">{item.title}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Saved from {item.sourcePlatform ?? "Note"} on {formatDate(item.createdAt)}
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <section>
              <h2 className="text-sm font-semibold">Summary</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {item.summary ?? "No summary has been generated yet."}
              </p>
            </section>

            {item.userNote ? (
              <section>
                <h2 className="text-sm font-semibold">Your note</h2>
                <p className="mt-2 rounded-lg border bg-muted p-3 text-sm">
                  {item.userNote}
                </p>
              </section>
            ) : null}

            <section>
              <h2 className="text-sm font-semibold">Tags</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {item.tags.length > 0 ? (
                  item.tags.map((tag) => (
                    <Badge key={tag} variant="muted">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No tags yet.</p>
                )}
              </div>
            </section>

            {item.originalUrl ? (
              <a
                className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
                href={item.originalUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open original
                <ExternalLink className="size-4" />
              </a>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
