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

type OpenTripMapPlace = {
  xid: string;
  name?: string;
  point?: { lat?: number; lon?: number };
  kinds?: string;
  rate?: number;
};

type OpenTripMapGeoname = {
  lat?: number;
  lon?: number;
};

const OPENTRIPMAP_KINDS: Record<PlaceCategory, string> = {
  food: "foods",
  coffee: "foods",
  nature: "natural",
  beach: "beaches",
  culture: "cultural,historic,museums",
  nightlife: "adult,amusements",
  shopping: "shops",
  hotel: "accomodations",
  activity: "interesting_places,sport,tourist_facilities",
  other: "interesting_places",
};

export async function searchOpenTripMapPlaces(
  input: PlaceSearchInput,
): Promise<PlaceSearchResult | null> {
  const apiKey = process.env.OPENTRIPMAP_API_KEY;
  if (!apiKey) return null;

  const center = await geocodeWithOpenTripMap(input.destination, apiKey);
  if (!center) {
    return {
      provider: "opentripmap",
      attribution: "Powered by OpenTripMap",
      limits: "OpenTripMap free plan: non-commercial use, 5,000 requests/day; API key required.",
      places: [],
      warnings: [`Could not geocode "${input.destination}" with OpenTripMap.`],
    };
  }

  const category = normalizeCategory(input.category);
  const limit = normalizeLimit(input.limit);
  const url = new URL("https://api.opentripmap.com/0.1/en/places/radius");
  url.searchParams.set("radius", category === "nature" || category === "beach" ? "15000" : "7000");
  url.searchParams.set("lon", String(center.longitude));
  url.searchParams.set("lat", String(center.latitude));
  url.searchParams.set("kinds", OPENTRIPMAP_KINDS[category]);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("apikey", apiKey);

  const response = await fetch(url, { next: { revalidate: 60 * 60 } });
  if (!response.ok) {
    throw new Error(`OpenTripMap search failed with ${response.status}.`);
  }

  const data = (await response.json()) as OpenTripMapPlace[];
  const places = uniquePlacesByName(
    data
      .map((place): PlaceCandidate | null => {
        const latitude = place.point?.lat;
        const longitude = place.point?.lon;

        if (!place.name || !latitude || !longitude) return null;

        return {
          id: `opentripmap:${place.xid}`,
          name: place.name,
          category,
          address: place.kinds ?? null,
          latitude,
          longitude,
          source: "opentripmap",
          sourceUrl: buildPlaceSourceUrl(latitude, longitude),
          rating: place.rate ? Math.min(place.rate, 5) : null,
          priceLevel: null,
          reviewSummary: null,
          confidence: 0.7,
        };
      })
      .filter((place): place is PlaceCandidate => Boolean(place)),
  );

  return {
    provider: "opentripmap",
    attribution: "Powered by OpenTripMap",
    limits: "OpenTripMap free plan: non-commercial use, 5,000 requests/day; API key required.",
    places,
    warnings: [
      "OpenTripMap is useful for attractions and travel POIs, but not reliable for live reviews or prices.",
    ],
  };
}

async function geocodeWithOpenTripMap(
  destination: string,
  apiKey: string,
): Promise<Coordinates | null> {
  const url = new URL("https://api.opentripmap.com/0.1/en/places/geoname");
  url.searchParams.set("name", destination);
  url.searchParams.set("apikey", apiKey);

  const response = await fetch(url, { next: { revalidate: 60 * 60 * 24 } });
  if (!response.ok) return null;

  const data = (await response.json()) as OpenTripMapGeoname;
  if (typeof data.lat !== "number" || typeof data.lon !== "number") return null;

  return { latitude: data.lat, longitude: data.lon };
}
