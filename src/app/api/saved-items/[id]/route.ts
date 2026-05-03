import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { updateSavedItemSchema } from "@/lib/validation/schemas";

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const item = await prisma.savedItem.findUnique({ where: { id } });

  if (!item) {
    return NextResponse.json({ error: "Saved item not found." }, { status: 404 });
  }

  return NextResponse.json({ item });
}

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();
  const parsed = updateSavedItemSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid update." }, { status: 400 });
  }

  const item = await prisma.savedItem.update({
    where: { id },
    data: parsed.data,
  });

  return NextResponse.json({ item });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;
  const item = await prisma.savedItem.update({
    where: { id },
    data: { status: "archived" },
  });

  return NextResponse.json({ item });
}
