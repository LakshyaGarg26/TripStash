import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { createSavedItem, getOrCreateDemoUser } from "@/lib/travel/saved-items";
import { saveItemSchema } from "@/lib/validation/schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const user = await getOrCreateDemoUser();

  const items = await prisma.savedItem.findMany({
    where: {
      userId: user.id,
      status: { not: "archived" },
      detectedDestination: searchParams.get("destination") ?? undefined,
      category: searchParams.get("category") ?? undefined,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = saveItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid saved item." },
      { status: 400 },
    );
  }

  const item = await createSavedItem({
    url: parsed.data.url || null,
    note: parsed.data.note || null,
  });

  return NextResponse.json({ item }, { status: 201 });
}
