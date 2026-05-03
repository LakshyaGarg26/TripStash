"use client";

import { CalendarDays, Inbox, Plane, UserRound } from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { label: "Saved", icon: Inbox, active: true },
  { label: "Plan", icon: Plane, active: false },
  { label: "Trips", icon: CalendarDays, active: false },
  { label: "Profile", icon: UserRound, active: false },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-3 pb-3 pt-2 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={cn(
              "flex h-12 flex-col items-center justify-center gap-1 rounded-md text-xs text-muted-foreground",
              item.active && "bg-accent text-accent-foreground",
            )}
            type="button"
          >
            <item.icon className="size-4" />
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
