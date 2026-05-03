import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { telegramId: "demo" },
    update: {
      name: "Lakshya",
      telegramFirstName: "Lakshya",
      telegramUsername: "lakshya_demo",
    },
    create: {
      telegramId: "demo",
      name: "Lakshya",
      telegramFirstName: "Lakshya",
      telegramUsername: "lakshya_demo",
    },
  });

  await prisma.savedItem.deleteMany({ where: { userId: user.id } });
  await prisma.trip.deleteMany({ where: { userId: user.id } });

  const scuba = await prisma.savedItem.create({
    data: {
      userId: user.id,
      inputType: "note",
      sourcePlatform: "Telegram",
      title: "Scuba diving inspiration from Thailand",
      summary:
        "A saved water-activity idea that should influence Bali planning as an adventure signal.",
      userNote: "Loved this scuba diving reel. Look for something similar in Bali.",
      detectedDestination: "Thailand",
      category: "activity",
      tags: ["adventure", "water sports", "interest signal"],
      confidence: 0.76,
      status: "active",
      createdAt: new Date("2026-04-18T10:00:00.000Z"),
    },
  });

  const sunrise = await prisma.savedItem.create({
    data: {
      userId: user.id,
      inputType: "url_with_note",
      originalUrl: "https://www.google.com/maps/search/?api=1&query=Campuhan%20Ridge%20Walk",
      sourcePlatform: "Maps",
      title: "Bali sunrise viewpoint",
      summary: "Saved scenic morning idea near Ubud for a light first-day plan.",
      userNote: "Maybe use this for day one morning.",
      detectedPlaceName: "Campuhan Ridge Walk",
      detectedDestination: "Bali",
      category: "nature",
      tags: ["sunrise", "viewpoint", "Ubud"],
      confidence: 0.92,
      isMustVisit: true,
      status: "active",
      createdAt: new Date("2026-04-21T09:00:00.000Z"),
    },
  });

  const food = await prisma.savedItem.create({
    data: {
      userId: user.id,
      inputType: "note",
      sourcePlatform: "Reddit",
      title: "Vegetarian cafes near Ubud",
      summary: "Reddit-style note with multiple veg-friendly food suggestions.",
      userNote: "Need good vegetarian cafes around Ubud.",
      detectedDestination: "Bali",
      detectedPlaceName: "Ubud",
      category: "food",
      tags: ["vegetarian", "cafes", "Ubud"],
      confidence: 0.88,
      status: "active",
      createdAt: new Date("2026-04-24T12:00:00.000Z"),
    },
  });

  await prisma.savedItem.create({
    data: {
      userId: user.id,
      inputType: "url",
      originalUrl: "https://www.google.com/maps/search/?api=1&query=go%20karting%20Bali",
      sourcePlatform: "Maps",
      title: "Go-karting place for the group",
      summary: "Fun activity idea to keep one afternoon playful and less touristy.",
      detectedDestination: "Bali",
      category: "activity",
      tags: ["group", "rainy day", "activity"],
      confidence: 0.48,
      status: "failed_extraction",
      createdAt: new Date("2026-04-26T13:00:00.000Z"),
    },
  });

  const trip = await prisma.trip.create({
    data: {
      userId: user.id,
      destination: "Bali",
      startDate: new Date("2026-06-10T00:00:00.000Z"),
      endDate: new Date("2026-06-16T00:00:00.000Z"),
      pace: "balanced",
      budgetLevel: "medium",
      notes: "Four friends, mix of adventure, scenic places, vegetarian food, and relaxed evenings.",
      status: "generated",
    },
  });

  await prisma.itinerary.create({
    data: {
      tripId: trip.id,
      summary: "A balanced Bali plan shaped by saved sunrise, food, and water-activity memories.",
      estimatedCostRange: "medium",
      aiModel: "seed",
      generationInput: { source: "seed" },
      generationOutput: { source: "seed" },
      days: {
        create: [
          {
            dayNumber: 1,
            date: new Date("2026-06-10T00:00:00.000Z"),
            area: "Ubud",
            summary: "A gentle first day around scenery, food, and low-friction movement.",
            items: {
              create: [
                {
                  timeBlock: "morning",
                  title: "Sunrise viewpoint",
                  selectedOptionName: "Campuhan Ridge Walk",
                  category: "nature",
                  description: "A scenic morning walk that keeps arrival day light.",
                  bestTime: "6:00 AM",
                  estimatedCost: "Free",
                  travelTimeNote: "Best if staying near central Ubud.",
                  reasoning: "Uses the saved Bali sunrise memory without making the first day too packed.",
                  mapSearchUrl:
                    "https://www.google.com/maps/search/?api=1&query=Campuhan%20Ridge%20Walk",
                  sortOrder: 0,
                  influences: {
                    create: [
                      {
                        savedItemId: sunrise.id,
                        influenceReason: "Direct must-visit sunrise memory.",
                      },
                    ],
                  },
                  options: {
                    create: [
                      {
                        name: "Mount Batur Sunrise Trek",
                        area: "Kintamani",
                        priceRange: "$35-$70",
                        pros: ["Iconic sunrise", "Adventure experience"],
                        cons: ["Very early start", "Physically demanding"],
                        bestFor: "Adventure travelers",
                        rank: 1,
                      },
                    ],
                  },
                },
                {
                  timeBlock: "afternoon",
                  title: "Vegetarian lunch and slow Ubud walk",
                  selectedOptionName: "Ubud center",
                  category: "food",
                  description: "Pick a vegetarian cafe and keep the afternoon flexible.",
                  bestTime: "1:00 PM",
                  estimatedCost: "$",
                  travelTimeNote: "Stay close to Ubud center.",
                  reasoning: "Uses saved vegetarian food research instead of guessing food stops.",
                  mapSearchUrl:
                    "https://www.google.com/maps/search/?api=1&query=vegetarian%20cafes%20Ubud",
                  sortOrder: 1,
                  influences: {
                    create: [
                      {
                        savedItemId: food.id,
                        influenceReason: "User saved vegetarian cafes around Ubud.",
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            dayNumber: 2,
            date: new Date("2026-06-11T00:00:00.000Z"),
            area: "Nusa Dua",
            summary: "Adventure day shaped by saved water-activity interests.",
            items: {
              create: [
                {
                  timeBlock: "morning",
                  title: "Beginner-friendly water activity",
                  selectedOptionName: "Nusa Dua dive operator shortlist",
                  category: "activity",
                  description: "Use scuba interest as a signal and compare beginner-friendly options.",
                  bestTime: "Morning",
                  estimatedCost: "$$",
                  travelTimeNote: "Plan this near the coast and avoid long transfers afterward.",
                  reasoning:
                    "The saved Thailand scuba memory is not in Bali, but it strongly signals water-activity interest.",
                  mapSearchUrl:
                    "https://www.google.com/maps/search/?api=1&query=scuba%20diving%20Nusa%20Dua%20Bali",
                  sortOrder: 0,
                  influences: {
                    create: [
                      {
                        savedItemId: scuba.id,
                        influenceReason: "Indirect interest signal for scuba and water sports.",
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
