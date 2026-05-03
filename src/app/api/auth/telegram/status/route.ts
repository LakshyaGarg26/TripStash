import { NextResponse } from "next/server";

import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const loginId = searchParams.get("loginId");

  if (!loginId) {
    return NextResponse.json({ error: "Missing loginId." }, { status: 400 });
  }

  const loginCode = await prisma.loginCode.findUnique({ where: { id: loginId } });

  if (!loginCode) {
    return NextResponse.json({ error: "Login code not found." }, { status: 404 });
  }

  return NextResponse.json({
    status: loginCode.status,
    telegramId: loginCode.telegramId,
    consumedAt: loginCode.consumedAt,
  });
}
