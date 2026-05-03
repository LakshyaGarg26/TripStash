import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories } from "@/lib/travel/categories";

import { AddMemoryCard } from "./add-memory-card";
import { MemoryCard, type MemoryCardItem } from "./memory-card";

export function MemoryInbox({
  memories,
  workspaceLabel,
}: {
  memories: MemoryCardItem[];
  workspaceLabel: string;
}) {
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
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search saved memories" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((category) => (
              <Button
                key={category.label}
                className="shrink-0"
                size="sm"
                type="button"
                variant={category.label === "All" ? "default" : "outline"}
              >
                <category.icon />
                {category.label}
              </Button>
            ))}
          </div>
        </div>
        <AddMemoryCard />
      </div>

      {memories.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
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
