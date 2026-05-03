import * as cheerio from "cheerio";

export type ExtractedMetadata = {
  title: string | null;
  description: string | null;
  image: string | null;
  sourcePlatform: string;
};

export function detectSourcePlatform(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");

    if (hostname.includes("instagram")) return "Instagram";
    if (hostname.includes("tiktok")) return "TikTok";
    if (hostname.includes("youtube") || hostname.includes("youtu.be")) return "YouTube";
    if (hostname.includes("reddit")) return "Reddit";
    if (hostname.includes("google") && url.includes("maps")) return "Maps";
    if (hostname.includes("x.com") || hostname.includes("twitter")) return "X";

    return hostname;
  } catch {
    return "Unknown";
  }
}

export async function extractMetadata(url?: string | null): Promise<ExtractedMetadata> {
  if (!url) {
    return {
      title: null,
      description: null,
      image: null,
      sourcePlatform: "Note",
    };
  }

  const sourcePlatform = detectSourcePlatform(url);

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "TripStash/0.1 metadata preview",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return { title: null, description: null, image: null, sourcePlatform };
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html")) {
      return { title: null, description: null, image: null, sourcePlatform };
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    const title =
      $('meta[property="og:title"]').attr("content") ??
      $("title").first().text() ??
      null;
    const description =
      $('meta[property="og:description"]').attr("content") ??
      $('meta[name="description"]').attr("content") ??
      null;
    const image = $('meta[property="og:image"]').attr("content") ?? null;

    return {
      title: title?.trim() || null,
      description: description?.trim() || null,
      image,
      sourcePlatform,
    };
  } catch {
    return { title: null, description: null, image: null, sourcePlatform };
  }
}
