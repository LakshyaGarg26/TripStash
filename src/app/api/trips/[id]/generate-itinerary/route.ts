import { NextResponse } from "next/server";

import { generateItinerary } from "@/lib/ai/itinerary";
import { prisma } from "@/lib/db/prisma";
import { researchPlacesForTrip } from "@/lib/places/search";
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
  const placeResearch = await researchPlacesForTrip({
    destination: trip.destination,
    savedItems: savedItems.map((item) => ({
      title: item.title,
      category: item.category,
      detectedPlaceName: item.detectedPlaceName,
      tags: item.tags,
      isMustVisit: item.isMustVisit,
    })),
  });
  let generated: Awaited<ReturnType<typeof generateItinerary>>;

  try {
    generated = await generateItinerary({
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
      placeResearch: placeResearch.places,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Could not generate a valid itinerary.",
      },
      { status: 502 },
    );
  }

  await prisma.$transaction(async (tx) => {
    const itinerary = await tx.itinerary.upsert({
      where: { tripId: trip.id },
      update: {
        summary: generated.itinerary.summary,
        estimatedCostRange: generated.itinerary.estimatedCostRange,
        aiModel: generated.aiModel,
        generationInput: {
          tripId: trip.id,
          savedItemCount: savedItems.length,
          placeResearchCount: placeResearch.places.length,
          placeResearchProviders: placeResearch.providers,
          placeResearchAttribution: placeResearch.attribution,
          placeResearchWarnings: placeResearch.warnings,
          usedFallback: generated.usedFallback,
          generationError: generated.error,
        },
        generationOutput: generated.itinerary,
        days: { deleteMany: {} },
      },
      create: {
        tripId: trip.id,
        summary: generated.itinerary.summary,
        estimatedCostRange: generated.itinerary.estimatedCostRange,
        aiModel: generated.aiModel,
        generationInput: {
          tripId: trip.id,
          savedItemCount: savedItems.length,
          placeResearchCount: placeResearch.places.length,
          placeResearchProviders: placeResearch.providers,
          placeResearchAttribution: placeResearch.attribution,
          placeResearchWarnings: placeResearch.warnings,
          usedFallback: generated.usedFallback,
          generationError: generated.error,
        },
        generationOutput: generated.itinerary,
      },
    });

    for (const day of generated.itinerary.days) {
      await tx.itineraryDay.create({
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
              mapSearchUrl: createMapSearchUrl(
                `${item.selectedOptionName} ${trip.destination}`,
              ),
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
              influences: {
                create: item.savedItemInfluences
                  .filter((influence) =>
                    savedItems.some(
                      (savedItem) => savedItem.id === influence.savedItemId,
                    ),
                  )
                  .map((influence) => ({
                    savedItemId: influence.savedItemId,
                    influenceReason: influence.reason,
                  })),
              },
            })),
          },
        },
      });
    }

    await tx.trip.update({
      where: { id: trip.id },
      data: { status: "generated" },
    });
  });

  return NextResponse.json({
    itinerary: generated.itinerary,
    placeResearch,
    generation: {
      aiModel: generated.aiModel,
      usedFallback: generated.usedFallback,
      error: generated.error,
    },
  });
}
