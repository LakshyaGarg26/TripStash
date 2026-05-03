import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getOrCreateDemoUser } from "@/lib/travel/saved-items";
import { createTripSchema } from "@/lib/validation/schemas";

export async function GET() {
  const user = await getOrCreateDemoUser();
  const trips = await prisma.trip.findMany({
    where: { userId: user.id, status: { not: "archived" } },
    orderBy: { createdAt: "desc" },
    include: { itinerary: true },
  });

  return NextResponse.json({ trips });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createTripSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid trip." }, { status: 400 });
  }

  const user = await getOrCreateDemoUser();
  const trip = await prisma.trip.create({
    data: {
      userId: user.id,
      destination: parsed.data.destination,
      startDate: new Date(parsed.data.startDate),
      endDate: new Date(parsed.data.endDate),
      pace: parsed.data.pace,
      budgetLevel: parsed.data.budgetLevel,
      notes: parsed.data.notes,
    },
  });

  return NextResponse.json({ trip }, { status: 201 });
}
