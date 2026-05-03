import { prisma } from "@/lib/db/prisma";
import { getOrCreateDemoUser } from "@/lib/travel/saved-items";

export async function getSavedItems() {
  const user = await getOrCreateDemoUser();

  return prisma.savedItem.findMany({
    where: { userId: user.id, status: { not: "archived" } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getSavedItem(id: string) {
  return prisma.savedItem.findUnique({ where: { id } });
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
  return prisma.trip.findUnique({
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
