import {
  buildPlaceSourceUrl,
  normalizeCategory,
  normalizeLimit,
  PLACE_USER_AGENT,
  uniquePlacesByName,
} from "@/lib/places/common";
import type {
  Coordinates,
  PlaceCandidate,
  PlaceCategory,
  PlaceSearchInput,
  PlaceSearchResult,
} from "@/lib/places/types";

type NominatimItem = {
  lat: string;
  lon: string;
  osm_type?: "node" | "way" | "relation";
  osm_id?: number;
  category?: string;
  type?: string;
  importance?: number;
};

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

const OVERPASS_TAGS: Record<PlaceCategory, string[]> = {
  food: ['node["amenity"~"restaurant|cafe|food_court"]', 'way["amenity"~"restaurant|cafe|food_court"]'],
  coffee: ['node["amenity"="cafe"]', 'way["amenity"="cafe"]'],
  nature: [
    'node["tourism"="viewpoint"]',
    'way["tourism"="viewpoint"]',
    'node["natural"~"peak|waterfall|spring"]',
    'way["natural"~"beach|wood|water"]',
  ],
  beach: ['node["natural"="beach"]', 'way["natural"="beach"]'],
  culture: [
    'node["tourism"~"museum|gallery|attraction"]',
    'way["tourism"~"museum|gallery|attraction"]',
    'node["historic"]',
    'way["historic"]',
  ],
  nightlife: ['node["amenity"~"bar|pub|nightclub"]', 'way["amenity"~"bar|pub|nightclub"]'],
  shopping: ['node["shop"]', 'way["shop"]'],
  hotel: ['node["tourism"~"hotel|hostel|guest_house"]', 'way["tourism"~"hotel|hostel|guest_house"]'],
  activity: [
    'node["tourism"~"attraction|theme_park|zoo"]',
    'way["tourism"~"attraction|theme_park|zoo"]',
    'node["leisure"]',
    'way["leisure"]',
  ],
  other: [
    'node["tourism"~"attraction|viewpoint|museum|gallery"]',
    'way["tourism"~"attraction|viewpoint|museum|gallery"]',
    'node["amenity"~"restaurant|cafe"]',
  ],
};

export async function searchOpenStreetMapPlaces(
  input: PlaceSearchInput,
): Promise<PlaceSearchResult> {
  const center = await geocodeWithNominatim(input.destination);

  if (!center) {
    return {
      provider: "openstreetmap",
      attribution: "Place data © OpenStreetMap contributors",
      limits:
        "Nominatim allows max 1 request/second; Overpass public instances must be used lightly.",
      places: [],
      warnings: [`Could not geocode "${input.destination}" with Nominatim.`],
    };
  }

  const category = normalizeCategory(input.category);
  const places = await queryOverpass(center, category, normalizeLimit(input.limit));

  return {
    provider: "openstreetmap",
    attribution: "Place data © OpenStreetMap contributors",
    limits:
      "No API key required. Keep calls minimal: Nominatim max 1 request/second and Overpass public servers are community resources.",
    places,
    warnings: [
      "OpenStreetMap data is real POI data, but it usually does not include live ratings, reviews, or prices.",
    ],
  };
}

async function geocodeWithNominatim(destination: string): Promise<Coordinates | null> {
  const variants = buildGeocodeQueries(destination);

  for (let index = 0; index < variants.length; index += 1) {
    const result = await geocodeOnce(variants[index]);
    if (result) return result;

    if (index < variants.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
    }
  }

  return null;
}

async function geocodeOnce(destination: string): Promise<Coordinates | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", destination);
  url.searchParams.set("limit", "5");

  const response = await fetch(url, {
    headers: {
      "User-Agent": PLACE_USER_AGENT,
      Referer: process.env.APP_BASE_URL ?? "http://localhost:3000",
    },
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) return null;

  const items = (await response.json()) as NominatimItem[];
  const first =
    items.find((item) => isPlaceResult(item)) ??
    [...items].sort((a, b) => (b.importance ?? 0) - (a.importance ?? 0))[0];
  const latitude = Number(first?.lat);
  const longitude = Number(first?.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return {
    latitude,
    longitude,
    osmType: first.osm_type,
    osmId: first.osm_id,
  };
}

function buildGeocodeQueries(destination: string) {
  const trimmed = destination.trim();
  const variants: string[] = [];
  const words = trimmed.split(/\s+/);

  if (!trimmed.includes(",") && words.length === 2) {
    variants.push(`${words[0]}, ${words[1]}`);
  }

  variants.push(trimmed);

  return Array.from(new Set(variants));
}

function isPlaceResult(item: NominatimItem) {
  return (
    item.category === "boundary" ||
    item.category === "place" ||
    item.type === "administrative" ||
    item.type === "city" ||
    item.type === "town" ||
    item.type === "village" ||
    item.type === "island"
  );
}

async function queryOverpass(
  center: Coordinates,
  category: PlaceCategory,
  limit: number,
): Promise<PlaceCandidate[]> {
  const radius = category === "nature" || category === "beach" ? 15000 : 7000;
  const areaId =
    center.osmType === "relation" && center.osmId
      ? 3600000000 + center.osmId
      : center.osmType === "way" && center.osmId
        ? 2400000000 + center.osmId
        : null;
  const scope = areaId
    ? `(area.searchArea)`
    : `(around:${radius},${center.latitude},${center.longitude})`;
  const areaClause = areaId ? `area(${areaId})->.searchArea;` : "";
  const selectors = OVERPASS_TAGS[category]
    .map((selector) => `${selector}${scope};`)
    .join("\n");
  const query = `
[out:json][timeout:12];
${areaClause}
(
${selectors}
);
out center tags ${limit};
`;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
      "User-Agent": PLACE_USER_AGENT,
    },
    body: query,
    next: { revalidate: 60 * 60 },
  });

  if (!response.ok) {
    throw new Error(`OpenStreetMap Overpass search failed with ${response.status}.`);
  }

  const data = (await response.json()) as { elements?: OverpassElement[] };

  return uniquePlacesByName(
    (data.elements ?? [])
      .map((element): PlaceCandidate | null => {
        const latitude = element.lat ?? element.center?.lat;
        const longitude = element.lon ?? element.center?.lon;
        const name = element.tags?.name;

        if (!name || typeof latitude !== "number" || typeof longitude !== "number") {
          return null;
        }

        const fallbackAddress = [
          element.tags?.["addr:street"],
          element.tags?.["addr:city"],
        ]
          .filter(Boolean)
          .join(", ");

        return {
          id: `osm:${element.type}:${element.id}`,
          name,
          category,
          address: element.tags?.["addr:full"] ?? (fallbackAddress || null),
          latitude,
          longitude,
          source: "openstreetmap",
          sourceUrl: buildPlaceSourceUrl(latitude, longitude),
          rating: null,
          priceLevel: element.tags?.["price"] ?? null,
          reviewSummary: null,
          confidence: 0.62,
        };
      })
      .filter((place): place is PlaceCandidate => Boolean(place)),
  ).slice(0, limit);
}
