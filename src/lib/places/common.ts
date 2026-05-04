import type { PlaceCategory } from "@/lib/places/types";

export const PLACE_SEARCH_LIMIT = 8;
export const PLACE_USER_AGENT = "TripStash/0.1 local-dev";

export function normalizeLimit(limit?: number) {
  if (!limit || Number.isNaN(limit)) return PLACE_SEARCH_LIMIT;
  return Math.min(Math.max(Math.floor(limit), 1), 20);
}

export function normalizeCategory(value?: string | null): PlaceCategory {
  const normalized = value?.trim().toLowerCase();

  if (
    normalized === "food" ||
    normalized === "coffee" ||
    normalized === "nature" ||
    normalized === "beach" ||
    normalized === "culture" ||
    normalized === "nightlife" ||
    normalized === "shopping" ||
    normalized === "hotel" ||
    normalized === "activity"
  ) {
    return normalized;
  }

  return "other";
}

export function buildPlaceSourceUrl(latitude: number, longitude: number) {
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
}

export function uniquePlacesByName<T extends { name: string; latitude: number; longitude: number }>(
  places: T[],
) {
  const seen = new Set<string>();

  return places.filter((place) => {
    const key = `${place.name.toLowerCase()}:${place.latitude.toFixed(4)}:${place.longitude.toFixed(4)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
