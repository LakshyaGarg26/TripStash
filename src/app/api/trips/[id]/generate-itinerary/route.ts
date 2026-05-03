import { NextResponse } from "next/server";

import { generateItinerary } from "@/lib/ai/itinerary";
import { prisma } from "@/lib/db/prisma";
import { createMapSearchUrl } from "@/lib/utils";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { user: { include: { savedItems: true } } },
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found." }, { status: 404 });
  }

  const savedItems = trip.user.savedItems.filter((item) => item.status !== "archived");
  const generated = await generateItinerary({
    destination: trip.destination,
    startDate: trip.startDate.toISOString().slice(0, 10),
    endDate: trip.endDate.toISOString().slice(0, 10),
    pace: trip.pace,
    budgetLevel: trip.budgetLevel,
    notes: trip.notes,
    savedItems: savedItems.map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      detectedDestination: item.detectedDestination,
      category: item.category,
      tags: item.tags,
      isMustVisit: item.isMustVisit,
    })),
  });

  const itinerary = await prisma.itinerary.upsert({
    where: { tripId: trip.id },
    update: {
      summary: generated.summary,
      estimatedCostRange: generated.estimatedCostRange,
      aiModel: process.env.GEMINI_API_KEY ? "gemini-2.0-flash" : "mock",
      generationInput: { tripId: trip.id, savedItemCount: savedItems.length },
      generationOutput: generated,
      days: { deleteMany: {} },
    },
    create: {
      tripId: trip.id,
      summary: generated.summary,
      estimatedCostRange: generated.estimatedCostRange,
      aiModel: process.env.GEMINI_API_KEY ? "gemini-2.0-flash" : "mock",
      generationInput: { tripId: trip.id, savedItemCount: savedItems.length },
      generationOutput: generated,
    },
  });

  for (const day of generated.days) {
    await prisma.itineraryDay.create({
      data: {
        itineraryId: itinerary.id,
        dayNumber: day.dayNumber,
        date: new Date(day.date),
        area: day.area,
        summary: day.summary,
        items: {
          create: day.items.map((item, index) => ({
            timeBlock: item.timeBlock,
            title: item.title,
            selectedOptionName: item.selectedOptionName,
            category: item.category,
            description: item.description,
            bestTime: item.bestTime,
            estimatedCost: item.estimatedCost,
            travelTimeNote: item.travelTimeNote,
            reasoning: item.reasoning,
            mapSearchUrl: createMapSearchUrl(item.selectedOptionName),
            sortOrder: index,
            options: {
              create: item.alternatives.map((option, rank) => ({
                name: option.name,
                area: option.area,
                priceRange: option.priceRange,
                pros: option.pros,
                cons: option.cons,
                bestFor: option.bestFor,
                sourceUrls: option.sourceUrls,
                rank,
              })),
            },
          })),
        },
      },
    });
  }

  await prisma.trip.update({
    where: { id: trip.id },
    data: { status: "generated" },
  });

  return NextResponse.json({ itinerary: generated });
}
