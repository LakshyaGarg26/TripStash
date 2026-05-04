"use client";

import { CalendarDays, Home, Inbox } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Saved", icon: Inbox, href: "/saved" },
  { label: "Trips", icon: CalendarDays, href: "/trips" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-3 pb-3 pt-2 backdrop-blur md:hidden">
      <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex h-12 flex-col items-center justify-center gap-1 rounded-md text-xs text-muted-foreground",
              (pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href))) &&
                "bg-accent text-accent-foreground",
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
