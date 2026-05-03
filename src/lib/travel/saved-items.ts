import { classifySavedItem } from "@/lib/ai/classify";
import { prisma } from "@/lib/db/prisma";
import { extractMetadata } from "@/lib/metadata/extract";

export async function getOrCreateDemoUser() {
  return prisma.user.upsert({
    where: { telegramId: "demo" },
    update: {},
    create: {
      telegramId: "demo",
      name: "Demo Traveler",
      telegramFirstName: "Demo",
    },
  });
}

export async function createSavedItem(input: {
  url?: string | null;
  note?: string | null;
  userId?: string;
}) {
  const user = input.userId ? null : await getOrCreateDemoUser();
  const metadata = await extractMetadata(input.url);
  const classification = await classifySavedItem({
    url: input.url,
    title: metadata.title,
    description: metadata.description,
    note: input.note,
    sourcePlatform: metadata.sourcePlatform,
  });

  return prisma.savedItem.create({
    data: {
      userId: input.userId ?? user!.id,
      inputType: input.url && input.note ? "url_with_note" : input.url ? "url" : "note",
      originalUrl: input.url || null,
      sourcePlatform: metadata.sourcePlatform,
      title: classification.title,
      summary: classification.summary,
      thumbnailUrl: metadata.image,
      rawMetadata: metadata,
      userNote: input.note || null,
      detectedPlaceName: classification.detectedPlaceName,
      detectedDestination: classification.detectedDestination,
      category: classification.category,
      tags: classification.tags,
      confidence: classification.confidence,
      status: classification.needsUserClarification ? "failed_extraction" : "active",
    },
  });
}
