import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div className="flex min-w-0 items-center gap-1" key={`${item.label}-${index}`}>
            {index > 0 ? (
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            ) : null}
            {item.href && !isLast ? (
              <Link
                className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                href={item.href}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  "truncate",
                  isLast ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}
