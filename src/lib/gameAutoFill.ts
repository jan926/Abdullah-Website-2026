/** Free auto-fill using Wikipedia (no API key). Falls back to smart templates. */

export interface GameAutoFillResult {
  description: string;
  developer: string;
  tags: string;
  systemRequirements: {
    minimum: { os: string; processor: string; memory: string; graphics: string; storage: string };
    recommended: { os: string; processor: string; memory: string; graphics: string; storage: string };
  };
  source: "wikipedia" | "template";
}

const defaultReqs = (sizeHint = "50 GB") => ({
  minimum: {
    os: "Windows 10 64-bit",
    processor: "Intel Core i5-8400 / AMD Ryzen 5 2600",
    memory: "8 GB RAM",
    graphics: "NVIDIA GTX 1060 6GB / AMD RX 580",
    storage: `${sizeHint} available space`,
  },
  recommended: {
    os: "Windows 11 64-bit",
    processor: "Intel Core i7-10700 / AMD Ryzen 7 3700X",
    memory: "16 GB RAM",
    graphics: "NVIDIA RTX 3060 / AMD RX 6600 XT",
    storage: `${sizeHint} SSD space`,
  },
});

async function fetchWikipediaExtract(title: string): Promise<string | null> {
  try {
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(title)}&limit=1&namespace=0&format=json&origin=*`;
    const searchRes = await fetch(searchUrl);
    const searchData = (await searchRes.json()) as [string, string[]];
    const pageTitle = searchData[1]?.[0];
    if (!pageTitle) return null;

    const extractUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=extracts|info&exintro=1&explaintext=1&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
    const extractRes = await fetch(extractUrl);
    const extractData = (await extractRes.json()) as {
      query?: { pages?: Record<string, { extract?: string; fullurl?: string }> };
    };
    const page = Object.values(extractData.query?.pages ?? {})[0];
    const extract = page?.extract?.trim();
    if (!extract || extract.length < 40) return null;
    return extract.slice(0, 900);
  } catch {
    return null;
  }
}

function guessDeveloper(title: string): string {
  const known: Record<string, string> = {
    "need for speed": "Electronic Arts",
    "call of duty": "Activision",
    "grand theft auto": "Rockstar Games",
    "assassin's creed": "Ubisoft",
    "fifa": "EA Sports",
    "forza": "Microsoft / Turn 10",
    "minecraft": "Mojang Studios",
    "cyberpunk": "CD Projekt Red",
    "elden ring": "FromSoftware",
    "god of war": "Santa Monica Studio",
  };
  const lower = title.toLowerCase();
  for (const [key, dev] of Object.entries(known)) {
    if (lower.includes(key)) return dev;
  }
  return "Game Studio";
}

function buildTags(title: string, categories: string[]): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const tags = new Set<string>([
    ...base,
    `${title} download`,
    `${title} free download`,
    `${title} pc download`,
    "pc game",
    "free download",
    "full version",
    ...categories.map((c) => `${c.toLowerCase()} game`),
  ]);
  return Array.from(tags).slice(0, 12).join(", ");
}

function templateDescription(title: string, categories: string[]): string {
  const genre = categories[0] || "action";
  return `${title} is a ${genre.toLowerCase()} PC game you can download and play on Windows. Experience engaging gameplay, polished visuals, and hours of entertainment. This page includes direct download options, system requirements, screenshots, and regular updates so you can get started quickly.`;
}

export async function autoFillGameDetails(
  title: string,
  categories: string[] = []
): Promise<GameAutoFillResult> {
  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Enter a game title first");
  }

  const wikiExtract = await fetchWikipediaExtract(trimmed);
  const developer = guessDeveloper(trimmed);
  const tags = buildTags(trimmed, categories);
  const systemRequirements = defaultReqs();

  if (wikiExtract) {
    return {
      description: wikiExtract,
      developer,
      tags,
      systemRequirements,
      source: "wikipedia",
    };
  }

  return {
    description: templateDescription(trimmed, categories),
    developer,
    tags,
    systemRequirements,
    source: "template",
  };
}
