"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

export function GenerateItineraryButton({ tripId }: { tripId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function generate() {
    setError(null);
    startTransition(async () => {
      const response = await fetch(`/api/trips/${tripId}/generate-itinerary`, {
        method: "POST",
      });

      if (!response.ok) {
        setError("Could not generate itinerary.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <Button disabled={isPending} onClick={generate} type="button">
        <Sparkles />
        {isPending ? "Generating" : "Generate itinerary"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
