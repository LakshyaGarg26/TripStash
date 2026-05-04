import { NextResponse } from "next/server";

import { autocompletePlaces } from "@/lib/places/autocomplete";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const suggestions = await autocompletePlaces(query);

  return NextResponse.json({ suggestions });
}
