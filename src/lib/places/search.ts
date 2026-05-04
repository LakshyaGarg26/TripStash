import { searchGeoapifyPlaces } from "@/lib/places/geoapify";
import { searchOpenStreetMapPlaces } from "@/lib/places/openstreetmap";
import { searchOpenTripMapPlaces } from "@/lib/places/opentripmap";
import type {
  PlaceCandidate,
  PlaceCategory,
  PlaceSearchInput,
  PlaceSearchResult,
} from "@/lib/places/types";

export async function searchPlaces(
  input: PlaceSearchInput,
): Promise<PlaceSearchResult> {
  const attempts = [
    () => searchGeoapifyPlaces(input),
    () => searchOpenTripMapPlaces(input),
  ];
  const warnings: string[] = [];

  for (const attempt of attempts) {
    try {
      const result = await attempt();
      if (result && result.places.length > 0) return result;
      if (result) warnings.push(...result.warnings);
    } catch (error) {
      warnings.push(error instanceof Error ? error.message : "Place provider failed.");
    }
  }

  try {
    const fallback = await searchOpenStreetMapPlaces(input);
    return {
      ...fallback,
      warnings: [...warnings, ...fallback.warnings],
    };
  } catch (error) {
    return {
      provider: "openstreetmap",
      attribution: "Place data © OpenStreetMap contributors",
      limits:
        "No-key fallback failed. Use a free Geoapify or OpenTripMap API key for more reliable local development.",
      places: [],
      warnings: [
        ...warnings,
        error instanceof Error ? error.message : "OpenStreetMap fallback failed.",
      ],
    };
  }
}

export async function researchPlacesForTrip(input: {
  destination: string;
  savedItems: Array<{
    title: string;
    category: string;
    detectedPlaceName?: string | null;
    tags: string[];
    isMustVisit: boolean;
  }>;
}) {
  const categories = chooseResearchCategories(input.savedItems);
  const results = await Promise.all(
    categories.map((category) =>
      searchPlaces({
        destination: input.destination,
        category,
        limit: 5,
      }),
    ),
  );

  const places = dedupePlaceCandidates(results.flatMap((result) => result.places));
  const warnings = results.flatMap((result) => result.warnings);

  return {
    places: places.slice(0, 16),
    providers: Array.from(new Set(results.map((result) => result.provider))),
    warnings: Array.from(new Set(warnings)),
    attribution: Array.from(new Set(results.map((result) => result.attribution))).join(" · "),
  };
}

function chooseResearchCategories(
  savedItems: Array<{ category: string; tags: string[]; isMustVisit: boolean }>,
): PlaceCategory[] {
  const categories = new Set<PlaceCategory>(["food", "culture", "activity"]);

  for (const item of savedItems) {
    const haystack = [item.category, ...item.tags].join(" ").toLowerCase();
    if (haystack.includes("food") || haystack.includes("restaurant")) categories.add("food");
    if (haystack.includes("coffee") || haystack.includes("cafe")) categories.add("coffee");
    if (haystack.includes("beach")) categories.add("beach");
    if (haystack.includes("nature") || haystack.includes("view")) categories.add("nature");
    if (haystack.includes("night")) categories.add("nightlife");
    if (haystack.includes("shop") || haystack.includes("market")) categories.add("shopping");
    if (item.isMustVisit) categories.add("activity");
  }

  return Array.from(categories).slice(0, 5);
}

function dedupePlaceCandidates(places: PlaceCandidate[]) {
  const seen = new Set<string>();

  return places.filter((place) => {
    const key = `${place.name.toLowerCase()}:${place.latitude.toFixed(3)}:${place.longitude.toFixed(3)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
