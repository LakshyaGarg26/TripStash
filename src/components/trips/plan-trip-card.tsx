"use client";

import { CalendarDays, PlaneTakeoff, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type PlanTripDefaults = {
  destination: string;
  startDate: string;
  endDate: string;
  pace: "relaxed" | "balanced" | "packed";
  budgetLevel: "low" | "medium" | "high";
};

export function PlanTripCard({ defaults }: { defaults: PlanTripDefaults }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const notes = formData.get("notes");
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          destination: formData.get("destination"),
          startDate: formData.get("startDate"),
          endDate: formData.get("endDate"),
          pace: formData.get("pace"),
          budgetLevel: formData.get("budgetLevel"),
          notes: typeof notes === "string" && notes.trim() ? notes : undefined,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Could not create this trip.");
        return;
      }

      const payload = (await response.json()) as { trip: { id: string } };
      router.push(`/trips/${payload.trip.id}`);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlaneTakeoff className="size-4 text-primary" />
          Plan from memory
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          action={handleSubmit}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6"
        >
          <Input
            name="destination"
            defaultValue={defaults.destination}
            aria-label="Destination"
            placeholder="Destination"
          />
          <div className="relative">
            <CalendarDays className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              name="startDate"
              className="pl-9"
              defaultValue={defaults.startDate}
              type="date"
            />
          </div>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              name="endDate"
              className="pl-9"
              defaultValue={defaults.endDate}
              type="date"
            />
          </div>
          <Select name="pace" defaultValue={defaults.pace} aria-label="Pace">
            <option value="relaxed">Relaxed</option>
            <option value="balanced">Balanced</option>
            <option value="packed">Packed</option>
          </Select>
          <Select
            name="budgetLevel"
            defaultValue={defaults.budgetLevel}
            aria-label="Budget"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
          <Button disabled={isPending} type="submit">
            <Sparkles />
            {isPending ? "Creating" : "Create"}
          </Button>
          {error ? (
            <p className="text-sm text-destructive sm:col-span-2 lg:col-span-6">
              {error}
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
