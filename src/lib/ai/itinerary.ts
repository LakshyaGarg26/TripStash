import { GoogleGenerativeAI } from "@google/generative-ai";

import { parseJsonFromModel } from "@/lib/ai/json";
import type { PlaceCandidate } from "@/lib/places/types";
import { itinerarySchema } from "@/lib/validation/schemas";

type ItineraryInput = {
  destination: string;
  startDate: string;
  endDate: string;
  pace: string;
  budgetLevel: string;
  notes?: string | null;
  savedItems: Array<{
    id: string;
    title: string;
    summary?: string | null;
    detectedDestination?: string | null;
    category: string;
    tags: string[];
    isMustVisit: boolean;
  }>;
  placeResearch?: PlaceCandidate[];
};

export async function generateItinerary(input: ItineraryInput) {
  if (!process.env.GEMINI_API_KEY) {
    return {
      itinerary: fallbackItinerary(input),
      aiModel: "local-fallback",
      usedFallback: true,
      error: null,
    };
  }

  const aiModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: aiModel,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.4,
    },
  });
  const prompt = `
Generate a practical travel itinerary as strict JSON.

Return JSON only with this shape:
{
  "summary": "string",
  "estimatedCostRange": "string",
  "days": [
    {
      "dayNumber": 1,
      "date": "YYYY-MM-DD",
      "area": "string",
      "summary": "string",
      "items": [
        {
          "timeBlock": "morning | breakfast | afternoon | evening | dinner | late_night | flex",
          "title": "string",
          "selectedOptionName": "string",
          "category": "string",
          "description": "string",
          "bestTime": "string",
          "estimatedCost": "string",
          "travelTimeNote": "string",
          "reasoning": "string",
          "savedItemInfluences": [{ "savedItemId": "string", "reason": "string" }],
          "alternatives": [
            {
              "name": "string",
              "area": "string",
              "priceRange": "string",
              "pros": ["string"],
              "cons": ["string"],
              "bestFor": "string",
              "sourceUrls": ["string"]
            }
          ]
        }
      ]
    }
  ]
}

Rules:
- Use saved items directly when relevant.
- Use indirectly related saved items as interest signals.
- Do not pretend to have live prices or ratings.
- Use placeResearch as grounded real-world place candidates when relevant.
- If a placeResearch item has null rating or null priceLevel, do not invent exact ratings or prices.
- Prefer alternatives that include sourceUrls from placeResearch when available.
- Keep each day realistic geographically.
- Include must-visit saved items when feasible.
- Only use savedItemId values that appear in the input.

Input:
${JSON.stringify(input, null, 2)}
`;

  try {
    const response = await model.generateContent(prompt);
    return {
      itinerary: parseJsonFromModel(response.response.text(), itinerarySchema),
      aiModel,
      usedFallback: false,
      error: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Gemini error.";
    console.warn(
      "Gemini itinerary generation failed; using local fallback.",
      message,
    );
    return {
      itinerary: fallbackItinerary(input),
      aiModel: `${aiModel}-failed-local-fallback`,
      usedFallback: true,
      error: message,
    };
  }
}

function fallbackItinerary(input: ItineraryInput) {
  const days = getTripDates(input.startDate, input.endDate).slice(0, 5);
  const places = input.placeResearch ?? [];
  const savedItems = input.savedItems;

  return itinerarySchema.parse({
    summary: `A ${input.pace} ${input.destination} plan built from saved memories and available place research. Gemini was not available, so this uses the local fallback planner.`,
    estimatedCostRange: input.budgetLevel,
    days: days.map((date, dayIndex) => {
      const dayPlaces = pickPlacesForDay(places, dayIndex);
      const savedItem = savedItems[dayIndex % Math.max(savedItems.length, 1)];

      return {
        dayNumber: dayIndex + 1,
        date,
        area: input.destination,
        summary:
          dayIndex === 0
            ? "Start with nearby, low-friction places so the plan does not feel rushed."
            : "Use a mix of food, culture, and flexible stops from real place research.",
        items: dayPlaces.map((place, itemIndex) =>
          fallbackItem({
            place,
            savedItem,
            destination: input.destination,
            budgetLevel: input.budgetLevel,
            timeBlock: ["morning", "afternoon", "evening"][itemIndex] ?? "flex",
          }),
        ),
      };
    }),
  });
}

function fallbackItem(input: {
  place?: PlaceCandidate;
  savedItem?: ItineraryInput["savedItems"][number];
  destination: string;
  budgetLevel: string;
  timeBlock: string;
}) {
  const selectedName =
    input.place?.name ??
    input.savedItem?.title ??
    `${input.destination} flexible local stop`;
  const sourceUrls = input.place?.sourceUrl ? [input.place.sourceUrl] : [];

  return {
    timeBlock: input.timeBlock,
    title: input.place ? `${labelForCategory(input.place.category)} stop` : "Saved-memory stop",
    selectedOptionName: selectedName,
    category: input.place?.category ?? input.savedItem?.category ?? "activity",
    description:
      input.place?.address ??
      input.savedItem?.summary ??
      "A flexible stop based on your saved travel interests.",
    bestTime: input.timeBlock === "morning" ? "Morning" : "Flexible",
    estimatedCost: input.place?.priceLevel ?? input.budgetLevel,
    travelTimeNote: "Check the map before leaving and group nearby stops together.",
    reasoning: input.place
      ? "Chosen from live place research so the fallback plan is still grounded in real places."
      : "Chosen from saved memories because no matching live place was available.",
    savedItemInfluences: input.savedItem
      ? [{ savedItemId: input.savedItem.id, reason: "Used as an interest signal." }]
      : [],
    alternatives: [
      {
        name: selectedName,
        area: input.place?.address ?? input.destination,
        priceRange: input.place?.priceLevel ?? "Not available",
        pros: input.place
          ? ["Grounded in real place data", "Useful as a flexible itinerary stop"]
          : ["Based on your saved memory"],
        cons: ["Live reviews and exact prices are not available from free data sources"],
        bestFor: input.timeBlock,
        sourceUrls,
      },
    ],
  };
}

function pickPlacesForDay(places: PlaceCandidate[], dayIndex: number) {
  if (places.length === 0) return [undefined, undefined, undefined];

  const start = (dayIndex * 3) % places.length;
  return [0, 1, 2].map((offset) => places[(start + offset) % places.length]);
}

function getTripDates(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);
  const dates: string[] = [];

  for (
    const cursor = new Date(start);
    cursor <= end && dates.length < 10;
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    dates.push(cursor.toISOString().slice(0, 10));
  }

  return dates.length > 0 ? dates : [startDate];
}

function labelForCategory(category: string) {
  const labels: Record<string, string> = {
    food: "Food",
    coffee: "Coffee",
    culture: "Culture",
    nature: "Nature",
    beach: "Beach",
    activity: "Activity",
    nightlife: "Evening",
    shopping: "Shopping",
    hotel: "Stay",
  };

  return labels[category] ?? "Local";
}
