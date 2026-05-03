import { NextResponse } from "next/server";

import { hashLoginCode } from "@/lib/auth/login-code";
import { prisma } from "@/lib/db/prisma";
import { sendTelegramMessage } from "@/lib/telegram/send-message";
import { extractUrlFromText, removeUrlFromText } from "@/lib/telegram/url";
import { createSavedItem } from "@/lib/travel/saved-items";

type TelegramUpdate = {
  message?: {
    chat: { id: number };
    from?: {
      id: number;
      username?: string;
      first_name?: string;
      last_name?: string;
    };
    text?: string;
  };
};

export async function POST(request: Request) {
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  if (process.env.TELEGRAM_WEBHOOK_SECRET && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Invalid webhook secret." }, { status: 401 });
  }

  const update = (await request.json()) as TelegramUpdate;
  const message = update.message;

  if (!message?.text || !message.from) {
    return NextResponse.json({ ok: true });
  }

  const text = message.text.trim();
  const chatId = message.chat.id;
  const telegramId = String(message.from.id);

  if (text.startsWith("/start login_") || text.startsWith("/login ")) {
    const code = text.startsWith("/start login_")
      ? text.replace("/start login_", "").trim()
      : text.replace("/login", "").trim();

    const loginCode = await prisma.loginCode.findUnique({
      where: { codeHash: hashLoginCode(code) },
    });

    if (!loginCode || loginCode.status !== "pending" || loginCode.expiresAt < new Date()) {
      await sendTelegramMessage(chatId, "This login code is expired or invalid. Please request a new one.");
      return NextResponse.json({ ok: true });
    }

    await prisma.user.upsert({
      where: { telegramId },
      update: {
        telegramUsername: message.from.username,
        telegramFirstName: message.from.first_name,
        telegramLastName: message.from.last_name,
        name: message.from.first_name,
      },
      create: {
        telegramId,
        telegramUsername: message.from.username,
        telegramFirstName: message.from.first_name,
        telegramLastName: message.from.last_name,
        name: message.from.first_name,
      },
    });

    await prisma.loginCode.update({
      where: { id: loginCode.id },
      data: { telegramId, status: "consumed", consumedAt: new Date() },
    });

    await sendTelegramMessage(chatId, "Logged in. You can return to TripStash.");
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.upsert({
    where: { telegramId },
    update: {
      telegramUsername: message.from.username,
      telegramFirstName: message.from.first_name,
      telegramLastName: message.from.last_name,
      name: message.from.first_name,
    },
    create: {
      telegramId,
      telegramUsername: message.from.username,
      telegramFirstName: message.from.first_name,
      telegramLastName: message.from.last_name,
      name: message.from.first_name,
    },
  });

  const url = extractUrlFromText(text);
  const note = removeUrlFromText(text, url);
  const item = await createSavedItem({ url, note, userId: user.id });
  const confidenceLabel = item.confidence < 0.6 ? "low confidence" : "saved";

  await sendTelegramMessage(
    chatId,
    `Saved: ${item.title}\nDetected: ${item.detectedDestination ?? "needs review"}, ${item.category}\nStatus: ${confidenceLabel}`,
  );

  return NextResponse.json({ ok: true });
}
