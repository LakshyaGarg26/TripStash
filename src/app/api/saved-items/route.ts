import { NextResponse } from "next/server";

import { createSavedItem } from "@/lib/travel/saved-items";
import { getSavedItems } from "@/lib/travel/queries";
import { saveItemSchema } from "@/lib/validation/schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const items = await getSavedItems({
    q: searchParams.get("q") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    destination: searchParams.get("destination") ?? undefined,
  });

  return NextResponse.json({
    items: items.map((item) => ({
      id: item.id,
      userId: item.userId,
      inputType: item.inputType,
      originalUrl: item.originalUrl,
      sourcePlatform: item.sourcePlatform,
      title: cleanRequiredText(item.title),
      summary: cleanText(item.summary),
      thumbnailUrl: item.thumbnailUrl,
      userNote: cleanText(item.userNote),
      detectedPlaceName: cleanText(item.detectedPlaceName),
      detectedDestination: cleanText(item.detectedDestination),
      latitude: item.latitude,
      longitude: item.longitude,
      category: item.category,
      tags: item.tags.map(cleanRequiredText).filter(Boolean),
      confidence: item.confidence,
      importance: item.importance,
      isMustVisit: item.isMustVisit,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = saveItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid saved item." },
      { status: 400 },
    );
  }

  try {
    const item = await createSavedItem({
      url: parsed.data.url || null,
      note: parsed.data.note || null,
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Could not save this memory.",
      },
      { status: 500 },
    );
  }
}

function cleanText(value: string | null) {
  return value?.replace(/[\u0000-\u001F\u007F]/g, " ").trim() || null;
}

function cleanRequiredText(value: string) {
  return cleanText(value) ?? "";
}
