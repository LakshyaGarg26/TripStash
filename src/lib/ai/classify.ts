import { GoogleGenerativeAI } from "@google/generative-ai";

import { savedItemClassificationSchema } from "@/lib/validation/schemas";

type ClassificationInput = {
  url?: string | null;
  title?: string | null;
  description?: string | null;
  note?: string | null;
  sourcePlatform?: string | null;
};

export async function classifySavedItem(input: ClassificationInput) {
  if (!process.env.GEMINI_API_KEY) {
    return mockClassification(input);
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const prompt = `
Classify this travel memory. Return only JSON with:
title, summary, detectedDestination, detectedPlaceName, category, tags,
confidence, needsUserClarification, clarifyingQuestion.

Do not invent exact place names when uncertain. If destination or place is weak,
set confidence below 0.6 and ask one short clarification question.

Input:
${JSON.stringify(input, null, 2)}
`;

  const response = await model.generateContent(prompt);
  const text = response.response.text().replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(text);

  return savedItemClassificationSchema.parse(parsed);
}

function mockClassification(input: ClassificationInput) {
  const text = `${input.title ?? ""} ${input.description ?? ""} ${input.note ?? ""} ${input.url ?? ""}`.toLowerCase();
  const destination = text.includes("bali")
    ? "Bali"
    : text.includes("thailand")
      ? "Thailand"
      : null;
  const category = text.includes("cafe") || text.includes("food") || text.includes("vegetarian")
    ? "food"
    : text.includes("sunrise") || text.includes("viewpoint")
      ? "nature"
      : text.includes("scuba") || text.includes("kart")
        ? "activity"
        : "other";

  return savedItemClassificationSchema.parse({
    title: input.title ?? input.note ?? "Untitled travel memory",
    summary:
      input.description ??
      input.note ??
      "Saved travel idea. Add a note to make planning more accurate.",
    detectedDestination: destination,
    detectedPlaceName: null,
    category,
    tags: [category, destination ?? "needs review"].filter(Boolean),
    confidence: destination ? 0.78 : 0.42,
    needsUserClarification: !destination,
    clarifyingQuestion: destination
      ? null
      : "Which destination should I connect this memory to?",
  });
}
