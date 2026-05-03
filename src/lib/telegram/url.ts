const urlPattern = /https?:\/\/[^\s]+/i;

export function extractUrlFromText(text: string) {
  return text.match(urlPattern)?.[0] ?? null;
}

export function removeUrlFromText(text: string, url: string | null) {
  if (!url) return text.trim();
  return text.replace(url, "").trim();
}

export function createTelegramDeepLink(code: string) {
  const botUsername = process.env.TELEGRAM_BOT_USERNAME ?? "your_bot";
  return `https://t.me/${botUsername}?start=login_${code}`;
}
