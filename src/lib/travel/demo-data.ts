import {
  Binoculars,
  Coffee,
  MapPin,
  Mountain,
  NotebookText,
  Waves,
} from "lucide-react";

export type SavedMemory = {
  id: string;
  title: string;
  summary: string;
  destination: string;
  category: string;
  source: "Telegram" | "YouTube" | "Reddit" | "Maps" | "Blog" | "Note";
  confidence: "high" | "medium" | "low";
  tags: string[];
  savedAt: string;
  mustVisit?: boolean;
  image?: string;
};

export type ItineraryDay = {
  day: number;
  date: string;
  area: string;
  summary: string;
  items: Array<{
    time: string;
    title: string;
    place: string;
    cost: string;
    reason: string;
    influencedBy: string[];
  }>;
};

export const categories = [
  { label: "All", icon: Binoculars },
  { label: "Food", icon: Coffee },
  { label: "Nature", icon: Mountain },
  { label: "Beach", icon: Waves },
  { label: "Places", icon: MapPin },
  { label: "Notes", icon: NotebookText },
];

export const savedMemories: SavedMemory[] = [
  {
    id: "mem_1",
    title: "Scuba diving inspiration from Thailand",
    summary:
      "A water-activity save that should become an adventure signal for Bali planning.",
    destination: "Thailand",
    category: "Activity",
    source: "Telegram",
    confidence: "medium",
    tags: ["adventure", "water sports", "interest signal"],
    savedAt: "2026-04-18",
  },
  {
    id: "mem_2",
    title: "Bali sunrise viewpoint",
    summary: "Saved scenic morning idea near Ubud for a light first-day plan.",
    destination: "Bali",
    category: "Nature",
    source: "Maps",
    confidence: "high",
    tags: ["sunrise", "viewpoint", "Ubud"],
    savedAt: "2026-04-21",
    mustVisit: true,
  },
  {
    id: "mem_3",
    title: "Vegetarian cafes near Ubud",
    summary: "Reddit thread with multiple veg-friendly food suggestions.",
    destination: "Bali",
    category: "Food",
    source: "Reddit",
    confidence: "high",
    tags: ["vegetarian", "cafes", "Ubud"],
    savedAt: "2026-04-24",
  },
  {
    id: "mem_4",
    title: "Go-karting place for the group",
    summary: "Fun activity idea to keep one afternoon playful and less touristy.",
    destination: "Bali",
    category: "Activity",
    source: "Maps",
    confidence: "low",
    tags: ["group", "rainy day", "activity"],
    savedAt: "2026-04-26",
  },
];

export const baliItinerary: ItineraryDay[] = [
  {
    day: 1,
    date: "2026-06-10",
    area: "Ubud",
    summary: "A gentle start around scenery, food, and low-friction movement.",
    items: [
      {
        time: "Morning",
        title: "Sunrise viewpoint",
        place: "Campuhan Ridge Walk",
        cost: "Free",
        reason:
          "Keeps arrival day light while matching the saved sunrise memory.",
        influencedBy: ["Bali sunrise viewpoint"],
      },
      {
        time: "Afternoon",
        title: "Vegetarian lunch and slow walk",
        place: "Ubud center",
        cost: "$",
        reason: "Uses your saved vegetarian food research instead of guessing.",
        influencedBy: ["Vegetarian cafes near Ubud"],
      },
      {
        time: "Evening",
        title: "Market and relaxed dinner",
        place: "Ubud Art Market area",
        cost: "$$",
        reason: "Low travel time and easy recovery after the first day.",
        influencedBy: [],
      },
    ],
  },
  {
    day: 2,
    date: "2026-06-11",
    area: "Nusa Dua",
    summary: "Adventure day shaped by saved water-activity interests.",
    items: [
      {
        time: "Morning",
        title: "Beginner-friendly water activity",
        place: "Nusa Dua dive operator shortlist",
        cost: "$$",
        reason:
          "Your Thailand scuba save is used as an interest signal for Bali.",
        influencedBy: ["Scuba diving inspiration from Thailand"],
      },
      {
        time: "Evening",
        title: "Beach club or quiet dinner",
        place: "Nusa Dua / Jimbaran",
        cost: "$$",
        reason: "Keeps the evening close after a higher-energy morning.",
        influencedBy: [],
      },
    ],
  },
];
