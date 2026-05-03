import { NextResponse } from "next/server";

import { createLoginCode, getLoginCodeExpiry, hashLoginCode } from "@/lib/auth/login-code";
import { prisma } from "@/lib/db/prisma";
import { createTelegramDeepLink } from "@/lib/telegram/url";

export async function POST() {
  const code = createLoginCode();
  const loginCode = await prisma.loginCode.create({
    data: {
      codeHash: hashLoginCode(code),
      expiresAt: getLoginCodeExpiry(),
    },
  });

  return NextResponse.json({
    loginId: loginCode.id,
    code,
    botDeepLink: createTelegramDeepLink(code),
    expiresAt: loginCode.expiresAt,
  });
}
