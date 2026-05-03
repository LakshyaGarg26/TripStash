import { Link2, NotebookPen, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function AddMemoryCard() {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <NotebookPen className="size-4 text-primary" />
          Capture a travel memory
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="relative">
          <Link2 className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Paste a link from Instagram, YouTube, Reddit, Maps, or a blog"
          />
        </div>
        <Textarea placeholder="Or write a note, like 'vegetarian cafes near Ubud'" />
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            Telegram saves will appear here after login.
          </p>
          <Button type="button">
            <Send />
            Save
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
