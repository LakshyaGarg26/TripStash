import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function createMapSearchUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function slugify(value: string | null | undefined) {
  const slug = (value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return slug || "item";
}

export function extractEntityId(value: string) {
  const parts = value.split("-");
  return parts[parts.length - 1] || value;
}

export function shortEntitySuffix(id: string) {
  return id.slice(-5);
}

export function savedItemHref(item: { id: string; title: string }) {
  return `/saved/${slugify(item.title)}-${shortEntitySuffix(item.id)}`;
}

export function tripHref(trip: { id: string; destination: string }) {
  return `/trips/${slugify(trip.destination)}-${shortEntitySuffix(trip.id)}`;
}
