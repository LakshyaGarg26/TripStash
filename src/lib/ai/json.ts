import { z } from "zod";

export function parseJsonFromModel<T>(text: string, schema: z.ZodType<T>) {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return schema.parse(JSON.parse(cleaned));
  } catch (firstError) {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw firstError;

    return schema.parse(JSON.parse(jsonMatch[0]));
  }
}
