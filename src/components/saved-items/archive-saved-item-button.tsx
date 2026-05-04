"use client";

import { Archive } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

export function ArchiveSavedItemButton({ itemId }: { itemId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function archiveItem() {
    setError(null);
    startTransition(async () => {
      const response = await fetch(`/api/saved-items/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Could not archive this memory.");
        return;
      }

      router.push("/saved");
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <Button
        disabled={isPending}
        onClick={archiveItem}
        type="button"
        variant="outline"
      >
        <Archive />
        {isPending ? "Archiving" : "Archive memory"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
