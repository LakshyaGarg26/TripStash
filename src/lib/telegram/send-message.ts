export async function sendTelegramMessage(chatId: number | string, text: string) {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    return { ok: false, skipped: true };
  }

  const response = await fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    },
  );

  return response.json();
}
