import { PLACE_USER_AGENT } from "@/lib/places/common";

export type PlaceSuggestion = {
  id: string;
  label: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  source: "geoapify" | "openstreetmap";
};

type GeoapifyFeature = {
  properties?: {
    place_id?: string;
    name?: string;
    formatted?: string;
    city?: string;
    state?: string;
    country?: string;
    lat?: number;
    lon?: number;
  };
};

type NominatimItem = {
  place_id: number;
  display_name: string;
  name?: string;
  lat: string;
  lon: string;
};

export async function autocompletePlaces(query: string) {
  const normalized = query.trim();
  if (normalized.length < 2) return [];

  if (process.env.GEOAPIFY_API_KEY) {
    const geoapify = await autocompleteGeoapify(normalized);
    if (geoapify.length > 0) return geoapify;
  }

  return autocompleteOpenStreetMap(normalized);
}

async function autocompleteGeoapify(query: string): Promise<PlaceSuggestion[]> {
  const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete");
  url.searchParams.set("text", query);
  url.searchParams.set("limit", "8");
  url.searchParams.set("type", "city");
  url.searchParams.set("apiKey", process.env.GEOAPIFY_API_KEY ?? "");

  const response = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!response.ok) return [];

  const data = (await response.json()) as { features?: GeoapifyFeature[] };

  return (data.features ?? [])
    .map((feature): PlaceSuggestion | null => {
      const props = feature.properties;
      if (
        !props?.formatted ||
        typeof props.lat !== "number" ||
        typeof props.lon !== "number"
      ) {
        return null;
      }

      const name =
        props.name ??
        props.city ??
        [props.state, props.country].filter(Boolean).join(", ") ??
        props.formatted;

      return {
        id: props.place_id ?? `geoapify:${props.lat}:${props.lon}:${props.formatted}`,
        label: props.formatted,
        name,
        address: props.formatted,
        latitude: props.lat,
        longitude: props.lon,
        source: "geoapify",
      };
    })
    .filter((suggestion): suggestion is PlaceSuggestion => Boolean(suggestion));
}

async function autocompleteOpenStreetMap(query: string): Promise<PlaceSuggestion[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "8");

  const response = await fetch(url, {
    headers: {
      "User-Agent": PLACE_USER_AGENT,
      Referer: process.env.APP_BASE_URL ?? "http://localhost:3000",
    },
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) return [];

  const data = (await response.json()) as NominatimItem[];

  return data
    .map((item): PlaceSuggestion | null => {
      const latitude = Number(item.lat);
      const longitude = Number(item.lon);
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

      return {
        id: `osm:${item.place_id}`,
        label: item.display_name,
        name: item.name || item.display_name.split(",")[0]?.trim() || item.display_name,
        address: item.display_name,
        latitude,
        longitude,
        source: "openstreetmap",
      };
    })
    .filter((suggestion): suggestion is PlaceSuggestion => Boolean(suggestion));
}
