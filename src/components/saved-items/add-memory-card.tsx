"use client";

import { Link2, NotebookPen, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AddMemoryCard() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/saved-items", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          url: formData.get("url"),
          note: formData.get("note"),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        setError(payload.error ?? "Could not save this memory.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <NotebookPen className="size-4 text-primary" />
          Capture a travel memory
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-3">
          <div className="relative">
            <Link2 className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input
              name="url"
              className="pl-9"
              placeholder="Paste a link from Instagram, YouTube, Reddit, Maps, or a blog"
            />
          </div>
          <Textarea
            name="note"
            placeholder="Or write a note, like 'vegetarian cafes near Ubud'"
          />
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Telegram saves will appear here after login.
            </p>
            <Button disabled={isPending} type="submit">
              <Send />
              {isPending ? "Saving" : "Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
