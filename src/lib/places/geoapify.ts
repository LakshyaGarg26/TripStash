import {
  buildPlaceSourceUrl,
  normalizeCategory,
  normalizeLimit,
  uniquePlacesByName,
} from "@/lib/places/common";
import type {
  Coordinates,
  PlaceCandidate,
  PlaceCategory,
  PlaceSearchInput,
  PlaceSearchResult,
} from "@/lib/places/types";

type GeoapifyFeature = {
  properties?: {
    place_id?: string;
    name?: string;
    formatted?: string;
    lat?: number;
    lon?: number;
    categories?: string[];
    datasource?: { raw?: { website?: string } };
  };
};

const GEOAPIFY_CATEGORY_MAP: Record<PlaceCategory, string> = {
  food: "catering.restaurant,catering.cafe",
  coffee: "catering.cafe",
  nature: "natural,tourism.sights",
  beach: "beach",
  culture: "entertainment.museum,tourism.sights",
  nightlife: "catering.bar,entertainment.nightclub",
  shopping: "commercial",
  hotel: "accommodation.hotel,accommodation.hostel,accommodation.guest_house",
  activity: "tourism.sights,leisure",
  other: "tourism.sights,catering.restaurant,entertainment",
};

export async function searchGeoapifyPlaces(
  input: PlaceSearchInput,
): Promise<PlaceSearchResult | null> {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  if (!apiKey) return null;

  const center = await geocodeWithGeoapify(input.destination, apiKey);
  if (!center) {
    return {
      provider: "geoapify",
      attribution: "Powered by Geoapify",
      limits: "Geoapify free plan: 3,000 credits/day; API key required.",
      places: [],
      warnings: [`Could not geocode "${input.destination}" with Geoapify.`],
    };
  }

  const category = normalizeCategory(input.category);
  const limit = normalizeLimit(input.limit);
  const url = new URL("https://api.geoapify.com/v2/places");
  url.searchParams.set("categories", GEOAPIFY_CATEGORY_MAP[category]);
  url.searchParams.set(
    "filter",
    `circle:${center.longitude},${center.latitude},7000`,
  );
  url.searchParams.set("bias", `proximity:${center.longitude},${center.latitude}`);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("apiKey", apiKey);

  const response = await fetch(url, { next: { revalidate: 60 * 60 } });

  if (!response.ok) {
    throw new Error(`Geoapify place search failed with ${response.status}.`);
  }

  const data = (await response.json()) as { features?: GeoapifyFeature[] };
  const places = uniquePlacesByName(
    (data.features ?? [])
      .map((feature): PlaceCandidate | null => {
        const props = feature.properties;
        if (!props?.name || typeof props.lat !== "number" || typeof props.lon !== "number") {
          return null;
        }

        return {
          id: props.place_id ?? `geoapify:${props.lat}:${props.lon}:${props.name}`,
          name: props.name,
          category,
          address: props.formatted ?? null,
          latitude: props.lat,
          longitude: props.lon,
          source: "geoapify",
          sourceUrl:
            props.datasource?.raw?.website ?? buildPlaceSourceUrl(props.lat, props.lon),
          rating: null,
          priceLevel: null,
          reviewSummary: null,
          confidence: 0.78,
        };
      })
      .filter((place): place is PlaceCandidate => Boolean(place)),
  );

  return {
    provider: "geoapify",
    attribution: "Powered by Geoapify",
    limits: "Geoapify free plan: 3,000 credits/day; API key required.",
    places,
    warnings: [
      "Free place search does not include reliable live reviews or menu prices.",
    ],
  };
}

async function geocodeWithGeoapify(
  destination: string,
  apiKey: string,
): Promise<Coordinates | null> {
  const url = new URL("https://api.geoapify.com/v1/geocode/search");
  url.searchParams.set("text", destination);
  url.searchParams.set("limit", "1");
  url.searchParams.set("apiKey", apiKey);

  const response = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
  if (!response.ok) return null;

  const data = (await response.json()) as { features?: GeoapifyFeature[] };
  const props = data.features?.[0]?.properties;

  if (typeof props?.lat !== "number" || typeof props.lon !== "number") {
    return null;
  }

  return { latitude: props.lat, longitude: props.lon };
}
