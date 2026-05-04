export type PlaceCategory =
  | "food"
  | "coffee"
  | "nature"
  | "beach"
  | "culture"
  | "nightlife"
  | "shopping"
  | "hotel"
  | "activity"
  | "other";

export type PlaceCandidate = {
  id: string;
  name: string;
  category: PlaceCategory;
  address?: string | null;
  latitude: number;
  longitude: number;
  source: "geoapify" | "opentripmap" | "openstreetmap";
  sourceUrl?: string | null;
  rating?: number | null;
  priceLevel?: string | null;
  reviewSummary?: string | null;
  confidence: number;
};

export type PlaceSearchInput = {
  destination: string;
  category?: PlaceCategory;
  query?: string;
  limit?: number;
};

export type PlaceSearchResult = {
  provider: "geoapify" | "opentripmap" | "openstreetmap";
  attribution: string;
  limits: string;
  places: PlaceCandidate[];
  warnings: string[];
};

export type Coordinates = {
  latitude: number;
  longitude: number;
  osmType?: "node" | "way" | "relation";
  osmId?: number;
};
