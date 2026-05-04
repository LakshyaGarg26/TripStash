import { prisma } from "@/lib/db/prisma";
import { getOrCreateDemoUser } from "@/lib/travel/saved-items";

export async function getSavedItems(filters?: {
  q?: string;
  category?: string;
  destination?: string;
}) {
  const user = await getOrCreateDemoUser();
  const q = filters?.q?.trim();
  const category = filters?.category?.trim();
  const destination = filters?.destination?.trim();
  const categoryWhere =
    category && category !== "all"
      ? category === "tip"
        ? {
            OR: [
              { category: "tip" },
              { inputType: "note" as const },
            ],
          }
        : { category }
      : {};

  return prisma.savedItem.findMany({
    where: {
      userId: user.id,
      status: { not: "archived" },
      ...categoryWhere,
      detectedDestination: destination || undefined,
      OR: q
        ? [
            { title: { contains: q, mode: "insensitive" } },
            { summary: { contains: q, mode: "insensitive" } },
            { userNote: { contains: q, mode: "insensitive" } },
            { detectedDestination: { contains: q, mode: "insensitive" } },
            { detectedPlaceName: { contains: q, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSavedItem(id: string) {
  const exact = await prisma.savedItem.findUnique({ where: { id } });
  if (exact) return exact;

  return prisma.savedItem.findFirst({
    where: { id: { endsWith: id }, status: { not: "archived" } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTrips() {
  const user = await getOrCreateDemoUser();

  return prisma.trip.findMany({
    where: { userId: user.id, status: { not: "archived" } },
    orderBy: { createdAt: "desc" },
    include: {
      itinerary: {
        include: {
          days: {
            orderBy: { dayNumber: "asc" },
            include: { items: { orderBy: { sortOrder: "asc" } } },
          },
        },
      },
    },
  });
}

export async function getTrip(id: string) {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      itinerary: {
        include: {
          days: {
            orderBy: { dayNumber: "asc" },
            include: {
              items: {
                orderBy: { sortOrder: "asc" },
                include: {
                  influences: { include: { savedItem: true } },
                  options: { orderBy: { rank: "asc" } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (trip) return trip;

  return prisma.trip.findFirst({
    where: { id: { endsWith: id }, status: { not: "archived" } },
    orderBy: { createdAt: "desc" },
    include: {
      itinerary: {
        include: {
          days: {
            orderBy: { dayNumber: "asc" },
            include: {
              items: {
                orderBy: { sortOrder: "asc" },
                include: {
                  influences: { include: { savedItem: true } },
                  options: { orderBy: { rank: "asc" } },
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getLatestTripWithItinerary() {
  const trips = await getTrips();
  return trips.find((trip) => trip.itinerary) ?? trips[0] ?? null;
}

export async function getWorkspaceDefaults() {
  const user = await getOrCreateDemoUser();
  const latestTrip = await prisma.trip.findFirst({
    where: { userId: user.id, status: { not: "archived" } },
    orderBy: { createdAt: "desc" },
  });

  if (latestTrip) {
    return {
      label: `${latestTrip.destination} workspace`,
      destination: latestTrip.destination,
      startDate: latestTrip.startDate.toISOString().slice(0, 10),
      endDate: latestTrip.endDate.toISOString().slice(0, 10),
      pace: latestTrip.pace,
      budgetLevel: latestTrip.budgetLevel,
    };
  }

  const latestSavedDestination = await prisma.savedItem.findFirst({
    where: {
      userId: user.id,
      status: { not: "archived" },
      detectedDestination: { not: null },
    },
    orderBy: { createdAt: "desc" },
    select: { detectedDestination: true },
  });

  return {
    label: latestSavedDestination?.detectedDestination
      ? `${latestSavedDestination.detectedDestination} workspace`
      : "Travel memory workspace",
    destination: latestSavedDestination?.detectedDestination ?? "",
    startDate: "",
    endDate: "",
    pace: "balanced" as const,
    budgetLevel: "medium" as const,
  };
}
