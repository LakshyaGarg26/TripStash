import { NextResponse } from "next/server";

import { normalizeCategory } from "@/lib/places/common";
import { searchPlaces } from "@/lib/places/search";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const destination = url.searchParams.get("destination")?.trim();
  const query = url.searchParams.get("q")?.trim() || undefined;
  const category = normalizeCategory(url.searchParams.get("category"));
  const limit = Number(url.searchParams.get("limit") ?? "8");

  if (!destination) {
    return NextResponse.json(
      { error: "destination query param is required." },
      { status: 400 },
    );
  }

  const result = await searchPlaces({
    destination,
    category,
    query,
    limit,
  });

  return NextResponse.json(result);
}
