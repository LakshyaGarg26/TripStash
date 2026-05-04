"use client";

import { Save, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type SavedItemEditFormProps = {
  item: {
    id: string;
    title: string;
    summary: string | null;
    detectedDestination: string | null;
    detectedPlaceName: string | null;
    category: string;
    tags: string[];
    userNote: string | null;
    isMustVisit: boolean;
  };
};

export function SavedItemEditForm({ item }: SavedItemEditFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const response = await fetch(`/api/saved-items/${item.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: normalizeRequiredText(formData.get("title")),
          summary: normalizeText(formData.get("summary")),
          detectedDestination: normalizeText(formData.get("detectedDestination")),
          detectedPlaceName: normalizeText(formData.get("detectedPlaceName")),
          category: formData.get("category"),
          tags: String(formData.get("tags") ?? "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          userNote: normalizeText(formData.get("userNote")),
          isMustVisit: formData.get("isMustVisit") === "on",
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Could not update this memory.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="memory-title">
          Title
        </label>
        <Input
          defaultValue={item.title}
          id="memory-title"
          name="title"
          placeholder="Title"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="memory-note">
          Your note
        </label>
        <Textarea
          defaultValue={item.userNote ?? ""}
          id="memory-note"
          name="userNote"
          placeholder="Write what you want to remember"
          rows={6}
        />
      </div>

      <label className="flex items-center gap-2 rounded-md border bg-muted/30 p-3 text-sm">
        <input
          className="size-4"
          defaultChecked={item.isMustVisit}
          name="isMustVisit"
          type="checkbox"
        />
        Mark as must visit
      </label>

      <details className="rounded-lg border bg-background">
        <summary className="flex cursor-pointer list-none items-center gap-2 p-3 text-sm font-medium">
          <Settings2 className="size-4" />
          Classification and metadata
        </summary>
        <div className="space-y-3 border-t p-3">
          <Textarea
            defaultValue={item.summary ?? ""}
            name="summary"
            placeholder="Generated summary"
            rows={4}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              defaultValue={item.detectedDestination ?? ""}
              name="detectedDestination"
              placeholder="Destination"
            />
            <Input
              defaultValue={item.detectedPlaceName ?? ""}
              name="detectedPlaceName"
              placeholder="Place name"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select defaultValue={item.category} name="category">
              <option value="restaurant">Restaurant</option>
              <option value="cafe">Cafe</option>
              <option value="food">Food</option>
              <option value="activity">Activity</option>
              <option value="viewpoint">Viewpoint</option>
              <option value="beach">Beach</option>
              <option value="hotel">Hotel</option>
              <option value="area">Area</option>
              <option value="route">Route</option>
              <option value="tip">Note</option>
              <option value="shopping">Shopping</option>
              <option value="nightlife">Nightlife</option>
              <option value="culture">Culture</option>
              <option value="nature">Nature</option>
              <option value="other">Other</option>
            </Select>
            <Input
              defaultValue={item.tags.join(", ")}
              name="tags"
              placeholder="Tags, comma separated"
            />
          </div>
        </div>
      </details>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <Button disabled={isPending} type="submit">
        <Save />
        {isPending ? "Saving" : "Save changes"}
      </Button>
    </form>
  );
}

function normalizeText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function normalizeRequiredText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return "";
  return value.trim();
}
