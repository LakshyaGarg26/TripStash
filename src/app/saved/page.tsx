import { AppShell } from "@/components/app-shell/app-shell";
import { MemoryInbox } from "@/components/saved-items/memory-inbox";
import { getSavedItems, getWorkspaceDefaults } from "@/lib/travel/queries";

export const dynamic = "force-dynamic";

export default async function SavedPage() {
  const [memories, workspace] = await Promise.all([
    getSavedItems(),
    getWorkspaceDefaults(),
  ]);

  return (
    <AppShell>
      <MemoryInbox memories={memories} workspaceLabel={workspace.label} />
    </AppShell>
  );
}
