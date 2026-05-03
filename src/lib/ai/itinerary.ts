import { GoogleGenerativeAI } from "@google/generative-ai";

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
};

export async function generateItinerary(input: ItineraryInput) {
  if (!process.env.GEMINI_API_KEY) {
    return mockItinerary(input);
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `
Generate a practical travel itinerary as strict JSON matching this shape:
summary, estimatedCostRange, days[] with dayNumber/date/area/summary/items[].
Each item needs timeBlock, title, selectedOptionName, category, description,
bestTime, estimatedCost, travelTimeNote, reasoning, savedItemInfluences[],
alternatives[].

Rules:
- Use saved items directly when relevant.
- Use indirectly related saved items as interest signals.
- Do not pretend to have live prices or ratings.
- Keep each day realistic geographically.
- Include must-visit saved items when feasible.

Input:
${JSON.stringify(input, null, 2)}
`;

  const response = await model.generateContent(prompt);
  const text = response.response.text().replace(/```json|```/g, "").trim();
  return itinerarySchema.parse(JSON.parse(text));
}

function mockItinerary(input: ItineraryInput) {
  const firstSavedItem = input.savedItems[0];

  return itinerarySchema.parse({
    summary: `A ${input.pace} ${input.destination} plan shaped by saved travel memories.`,
    estimatedCostRange: input.budgetLevel,
    days: [
      {
        dayNumber: 1,
        date: input.startDate,
        area: input.destination,
        summary: "Start with a light day that uses saved inspiration without rushing.",
        items: [
          {
            timeBlock: "morning",
            title: "Saved-memory starter activity",
            selectedOptionName: firstSavedItem?.title ?? `${input.destination} orientation walk`,
            category: firstSavedItem?.category ?? "activity",
            description:
              "A practical first stop generated from the strongest saved memory.",
            bestTime: "Morning",
            estimatedCost: input.budgetLevel,
            travelTimeNote: "Keep this close to the main stay area for day one.",
            reasoning:
              "This keeps the first day simple while proving saved memories influence the plan.",
            savedItemInfluences: firstSavedItem
              ? [{ savedItemId: firstSavedItem.id, reason: "Directly related saved memory." }]
              : [],
            alternatives: [
              {
                name: `${input.destination} relaxed neighborhood walk`,
                area: input.destination,
                priceRange: "Free",
                pros: ["Low effort", "Good for arrival day"],
                cons: ["Less unique"],
                bestFor: "Arrival day",
                sourceUrls: [],
              },
            ],
          },
        ],
      },
    ],
  });
}
