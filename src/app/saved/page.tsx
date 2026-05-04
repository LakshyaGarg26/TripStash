import { AppShell } from "@/components/app-shell/app-shell";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { MemoryInbox } from "@/components/saved-items/memory-inbox";
import { getSavedItems, getWorkspaceDefaults } from "@/lib/travel/queries";

export const dynamic = "force-dynamic";

export default async function SavedPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const filters = await searchParams;
  const [memories, workspace] = await Promise.all([
    getSavedItems({ q: filters.q, category: filters.category }),
    getWorkspaceDefaults(),
  ]);

  return (
    <AppShell>
      <div className="space-y-5">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Saved" },
          ]}
        />
        <MemoryInbox
          activeCategory={filters.category ?? "all"}
          memories={memories}
          query={filters.q ?? ""}
          workspaceLabel={workspace.label}
        />
      </div>
    </AppShell>
  );
}
