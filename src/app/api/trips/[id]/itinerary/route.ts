import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const itinerary = await prisma.itinerary.findUnique({
    where: { tripId: id },
    include: {
      days: {
        orderBy: { dayNumber: "asc" },
        include: {
          items: {
            orderBy: { sortOrder: "asc" },
            include: { options: { orderBy: { rank: "asc" } }, influences: true },
          },
        },
      },
    },
  });

  if (!itinerary) {
    return NextResponse.json({ error: "Itinerary not found." }, { status: 404 });
  }

  return NextResponse.json({ itinerary });
}
