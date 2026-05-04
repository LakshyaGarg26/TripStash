import { Edit3, ExternalLink, ImageIcon, Star } from "lucide-react";
import { notFound } from "next/navigation";

import { AppShell } from "@/components/app-shell/app-shell";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { ArchiveSavedItemButton } from "@/components/saved-items/archive-saved-item-button";
import { SavedItemEditForm } from "@/components/saved-items/saved-item-edit-form";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSavedItem } from "@/lib/travel/queries";
import { cn, extractEntityId, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function SavedItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getSavedItem(extractEntityId(id));

  if (!item) notFound();

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-4">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Saved", href: "/saved" },
            { label: item.title },
          ]}
        />

        <Card className="overflow-hidden">
          {item.thumbnailUrl ? (
            <div
              className="h-56 bg-muted bg-cover bg-center"
              style={{ backgroundImage: `url(${item.thumbnailUrl})` }}
            />
          ) : (
            <div className="flex h-36 items-center justify-center bg-accent text-accent-foreground">
              <ImageIcon className="size-8" />
            </div>
          )}
          <CardHeader>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="space-y-3">
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
                <CardTitle className="text-2xl leading-tight">
                  {item.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Saved from {item.sourcePlatform ?? "Note"} on{" "}
                  {formatDate(item.createdAt)}
                </p>
              </div>
              <a
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
                href="#edit-memory"
              >
                <Edit3 className="size-4" />
                Edit
              </a>
            </div>
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
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold">Your note</h2>
                  <a
                    className="text-sm font-medium text-primary hover:underline"
                    href="#edit-memory"
                  >
                    Edit note
                  </a>
                </div>
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

        <Card id="edit-memory">
          <CardHeader>
            <CardTitle>Edit memory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SavedItemEditForm item={item} />
              <ArchiveSavedItemButton itemId={item.id} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
