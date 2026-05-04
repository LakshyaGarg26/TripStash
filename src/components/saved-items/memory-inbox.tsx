import { Search } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories } from "@/lib/travel/categories";
import { cn } from "@/lib/utils";

import { AddMemoryCard } from "./add-memory-card";
import { MemoryCard, type MemoryCardItem } from "./memory-card";

export function MemoryInbox({
  memories,
  workspaceLabel,
  activeCategory = "all",
  query = "",
  basePath = "/saved",
  limit,
  showViewMore = false,
}: {
  memories: MemoryCardItem[];
  workspaceLabel: string;
  activeCategory?: string;
  query?: string;
  basePath?: "/" | "/saved";
  limit?: number;
  showViewMore?: boolean;
}) {
  const visibleMemories = typeof limit === "number" ? memories.slice(0, limit) : memories;
  const hasMore = typeof limit === "number" && memories.length > limit;

  return (
    <section className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-4">
          <div>
            <Badge variant="secondary">{workspaceLabel}</Badge>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Your travel ideas, remembered clearly.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Save links and notes from anywhere. The app turns them into
              structured memories that can shape a real itinerary later.
            </p>
          </div>
          <form className="relative max-w-xl" action={basePath}>
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              defaultValue={query}
              name="q"
              placeholder="Search saved memories"
            />
            {activeCategory !== "all" ? (
              <input name="category" type="hidden" value={activeCategory} />
            ) : null}
          </form>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <Link
                key={category.label}
                className={cn(
                  buttonVariants({
                    size: "sm",
                    variant:
                      activeCategory === category.value ? "default" : "outline",
                  }),
                  "shrink-0",
                )}
                href={{
                  pathname: basePath,
                  query: {
                    ...(category.value !== "all"
                      ? { category: category.value }
                      : {}),
                    ...(query ? { q: query } : {}),
                  },
                }}
              >
                <category.icon />
                {category.label}
              </Link>
            ))}
          </div>
        </div>
        <AddMemoryCard />
      </div>

      {memories.length > 0 ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {visibleMemories.map((memory) => (
              <MemoryCard key={memory.id} memory={memory} />
            ))}
          </div>
          {showViewMore && hasMore ? (
            <div className="flex justify-center">
              <Link
                className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
                href={{
                  pathname: "/saved",
                  query: {
                    ...(activeCategory !== "all"
                      ? { category: activeCategory }
                      : {}),
                    ...(query ? { q: query } : {}),
                  },
                }}
              >
                View more saved memories
              </Link>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-8 text-center">
          <h2 className="font-semibold">No memories yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Save your first link or note to start building your travel memory.
          </p>
        </div>
      )}
    </section>
  );
}
