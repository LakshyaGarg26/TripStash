import { CalendarDays, PlaneTakeoff, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function PlanTripCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PlaneTakeoff className="size-4 text-primary" />
          Plan from memory
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Input defaultValue="Bali" aria-label="Destination" />
        <div className="relative">
          <CalendarDays className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input className="pl-9" defaultValue="2026-06-10" type="date" />
        </div>
        <div className="relative">
          <CalendarDays className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input className="pl-9" defaultValue="2026-06-16" type="date" />
        </div>
        <Select defaultValue="balanced" aria-label="Pace">
          <option value="relaxed">Relaxed</option>
          <option value="balanced">Balanced</option>
          <option value="packed">Packed</option>
        </Select>
        <Button type="button">
          <Sparkles />
          Generate
        </Button>
      </CardContent>
    </Card>
  );
}
