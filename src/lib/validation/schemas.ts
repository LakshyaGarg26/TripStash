import { z } from "zod";

export const saveItemSchema = z
  .object({
    url: z.string().url().optional().or(z.literal("")),
    note: z.string().max(2000).optional().or(z.literal("")),
  })
  .refine((value) => Boolean(value.url || value.note), {
    message: "Provide a link, note, or both.",
  });

export const updateSavedItemSchema = z.object({
  title: z.string().min(1).max(180).optional(),
  summary: z.string().max(1000).optional().nullable(),
  detectedDestination: z.string().max(120).optional().nullable(),
  detectedPlaceName: z.string().max(180).optional().nullable(),
  category: z.string().max(80).optional(),
  tags: z.array(z.string().max(60)).optional(),
  userNote: z.string().max(2000).optional().nullable(),
  isMustVisit: z.boolean().optional(),
});

export const createTripSchema = z.object({
  destination: z.string().min(1).max(120),
  startDate: z.string().date(),
  endDate: z.string().date(),
  pace: z.enum(["relaxed", "balanced", "packed"]).default("balanced"),
  budgetLevel: z.enum(["low", "medium", "high"]).default("medium"),
  notes: z.string().max(2000).optional().nullable(),
});

export const savedItemClassificationSchema = z.object({
  title: z.string(),
  summary: z.string(),
  detectedDestination: z.string().nullable(),
  detectedPlaceName: z.string().nullable(),
  category: z.string(),
  tags: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  needsUserClarification: z.boolean(),
  clarifyingQuestion: z.string().nullable(),
});

export const itinerarySchema = z.object({
  summary: z.string(),
  estimatedCostRange: z.string(),
  days: z.array(
    z.object({
      dayNumber: z.number(),
      date: z.string(),
      area: z.string(),
      summary: z.string(),
      items: z.array(
        z.object({
          timeBlock: z.string(),
          title: z.string(),
          selectedOptionName: z.string(),
          category: z.string(),
          description: z.string(),
          bestTime: z.string().optional(),
          estimatedCost: z.string().optional(),
          travelTimeNote: z.string().optional(),
          reasoning: z.string(),
          savedItemInfluences: z.array(
            z.object({
              savedItemId: z.string(),
              reason: z.string(),
            }),
          ),
          alternatives: z.array(
            z.object({
              name: z.string(),
              area: z.string().optional(),
              priceRange: z.string().optional(),
              pros: z.array(z.string()),
              cons: z.array(z.string()),
              bestFor: z.string().optional(),
              sourceUrls: z.array(z.string()).default([]),
            }),
          ),
        }),
      ),
    }),
  ),
});
