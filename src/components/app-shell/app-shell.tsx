import { Bot, Sparkles } from "lucide-react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Badge } from "@/components/ui/badge";

import { MobileNav } from "./mobile-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-none">TripStash</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Save now. Plan later.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="hidden sm:inline-flex" variant="secondary">
              <Bot className="mr-1 size-3" />
              Telegram-first
            </Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl px-4 pb-28 pt-5 md:pb-10">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
