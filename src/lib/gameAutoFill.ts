/** Advanced auto-fill: RAWG + Wikidata + Wikipedia + 400+ game catalog + local DB. */
import { lookupKnownGame, KnownGameEntry } from "./gameDatabase";
import { searchGameCatalog } from "./gameCatalog";

export interface GameAutoFillResult {
  description: string;
  developer: string;
  tags: string;
  screenshots?: string[];
  systemRequirements: {
    minimum: { os: string; processor: string; memory: string; graphics: string; storage: string };
    recommended: { os: string; processor: string; memory: string; graphics: string; storage: string };
  };
  source: "rawg" | "wikidata" | "wikipedia" | "catalog" | "database" | "template" | "openai" | "gemini";
}

type GameInfo = {
  description: string;
  developer?: string;
  publisher?: string;
  genres: string[];
  year?: number;
  sizeHint?: string;
  requirements?: GameAutoFillResult["systemRequirements"];
};

const RAWG_KEY = import.meta.env.VITE_RAWG_API_KEY as string | undefined;
const OPENAI_KEY = import.meta.env.VITE_OPENAI_API_KEY as string | undefined;
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const OPENAI_MODEL = (() => {
  const raw = (import.meta.env.VITE_OPENAI_MODEL as string | undefined)?.trim().toLowerCase();
  const aliases: Record<string, string> = {
    free: "gpt-3.5-turbo",
    "gpt4": "gpt-4.1-mini",
    "gpt4o": "gpt-4o-mini",
  };
  return raw ? aliases[raw] || raw : "gpt-3.5-turbo";
})();

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function extractJsonObject(text: string): string {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return text;
  return text.slice(start, end + 1);
}

function normalizeTags(tags: string | string[] | undefined): string {
  if (!tags) return "";
  if (Array.isArray(tags)) return tags.filter(Boolean).join(", ");
  return String(tags).trim();
}

function normalizeSystemRequirements(
  value: unknown
): GameAutoFillResult["systemRequirements"] | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;
  const normalizeBlock = (block: unknown): GameAutoFillResult["systemRequirements"]["minimum"] | null => {
    if (!block || typeof block !== "object") return null;
    const item = block as Record<string, unknown>;
    const field = (key: string) => String(item[key] ?? item[key.toLowerCase()] ?? item[key.toUpperCase()] ?? "").trim();
    return {
      os: field("os") || field("OS") || field("Operating System") || "",
      processor: field("processor") || field("Processor") || field("CPU") || "",
      memory: field("memory") || field("Memory") || field("RAM") || "",
      graphics: field("graphics") || field("Graphics") || field("GPU") || "",
      storage: field("storage") || field("Storage") || field("Hard Drive") || field("Disk") || "",
    };
  };

  const minimum = normalizeBlock(data.minimum ?? data.min ?? data.minimumRequirements);
  const recommended = normalizeBlock(data.recommended ?? data.rec ?? data.recommendedRequirements);
  if (!minimum || !recommended) return null;

  if (!minimum.os || !minimum.processor || !minimum.memory || !minimum.graphics || !minimum.storage) return null;
  if (!recommended.os || !recommended.processor || !recommended.memory || !recommended.graphics || !recommended.storage) return null;

  return { minimum, recommended };
}

async function fetchGeminiGameDetails(
  title: string,
  categories: string[],
  knownInfo: KnownGameEntry | null
): Promise<GameAutoFillResult | null> {
  if (!GEMINI_KEY?.trim()) return null;

  const categoryList = categories.length ? categories.join(", ") : "General";
  const knownHint = knownInfo
    ? `Known game info: developer ${knownInfo.developer}${knownInfo.publisher ? `, publisher ${knownInfo.publisher}` : ``}${knownInfo.genre ? `, genre ${knownInfo.genre}` : ``}${knownInfo.year ? `, year ${knownInfo.year}` : ``}${knownInfo.sizeHint ? `, estimated size ${knownInfo.sizeHint}` : ``}. `
    : "";
  const prompt = `You are a PC game metadata expert. Given a game title, return ONLY a valid JSON object with: description, developer, tags, systemRequirements (with minimum and recommended having: os, processor, memory, graphics, storage).\nTitle: ${title}\nCategories: ${categoryList}\n${knownHint}Return only JSON, no markdown or extra text.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0, maxOutputTokens: 800 },
        }),
      }
    );

    const data = await res.json();
    const rawText: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const jsonText = extractJsonObject(rawText.trim());
    const parsed = JSON.parse(jsonText) as {
      description?: string;
      developer?: string;
      tags?: string | string[];
      systemRequirements?: unknown;
    };

    const systemRequirements = normalizeSystemRequirements(parsed.systemRequirements);
    if (!parsed.description || !parsed.developer || !systemRequirements) return null;

    return {
      description: parsed.description.trim(),
      developer: parsed.developer.trim() || "Unknown Developer",
      tags: normalizeTags(parsed.tags) || buildTags(title, categories.length ? categories : ["Action"], []),
      systemRequirements,
      source: "gemini",
    };
  } catch {
    return null;
  }
}

async function fetchOpenAIGameDetails(
  title: string,
  categories: string[],
  knownInfo: KnownGameEntry | null
): Promise<GameAutoFillResult | null> {
  if (!OPENAI_KEY?.trim()) return null;

  const categoryList = categories.length ? categories.join(", ") : "General";
  const knownHint = knownInfo
    ? `Known game info: developer ${knownInfo.developer}${knownInfo.publisher ? `, publisher ${knownInfo.publisher}` : ``}${knownInfo.genre ? `, genre ${knownInfo.genre}` : ``}${knownInfo.year ? `, year ${knownInfo.year}` : ``}${knownInfo.sizeHint ? `, estimated size ${knownInfo.sizeHint}` : ``}. `
    : "";
  const prompt = `You are a PC game metadata expert. Given a game title and optional categories, return only a VALID JSON object with exactly these keys: description, developer, tags, systemRequirements. Do not include markdown, code fences, or any extra keys.
- description: 5-7 sentences, game-specific, PC-focused, and written like a store or landing page blurb.
- developer: the exact or most plausible developer for this title.
- tags: SEO-friendly tags separated by commas.
- systemRequirements: an object with realistic minimum and recommended Windows PC specs. Use exact fields {os, processor, memory, graphics, storage}.
If you know the official PC requirements for this game, return those exact values. If not, return the closest accurate estimate for this title.
Minimum should describe a playable setup. Recommended should describe a modern mid/high-end setup for a smooth 1080p or better experience.
Use real CPU/GPU combos, Windows 10/11 64-bit, and believable storage requirements. Avoid vague hardware terms such as "modern CPU" or "high-end GPU".
${knownHint}Title: ${title}
Categories: ${categoryList}`;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          { role: "system", content: "You are a helpful assistant that outputs only JSON and nothing else." },
          { role: "user", content: prompt },
        ],
        max_tokens: 700,
        temperature: 0,
      }),
    });

    const data = await res.json();
    const rawText: string | undefined =
      data?.choices?.[0]?.message?.content ||
      (Array.isArray(data?.choices?.[0]?.message?.content)
        ? data.choices[0].message.content.map((item: any) => item.text || "").join("")
        : undefined);
    if (!rawText) return null;

    const jsonText = extractJsonObject(rawText.trim());
    const parsed = JSON.parse(jsonText) as {
      description?: string;
      developer?: string;
      tags?: string | string[];
      systemRequirements?: unknown;
    };

    const systemRequirements = normalizeSystemRequirements(parsed.systemRequirements);
    if (!parsed.description || !parsed.developer || !systemRequirements) return null;

    return {
      description: parsed.description.trim(),
      developer: parsed.developer.trim() || "Unknown Developer",
      tags: normalizeTags(parsed.tags) || buildTags(title, categories.length ? categories : ["Action"], []),
      systemRequirements,
      source: "openai",
    };
  } catch {
    return null;
  }
}

function hashSeed(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h << 5) - h + text.charCodeAt(i);
  return Math.abs(h);
}

function pick<T>(arr: T[], seed: number, offset = 0): T {
  return arr[(seed + offset) % arr.length];
}

function parseReqLine(text: string, field: string): string | undefined {
  const re = new RegExp(`${field}\\s*:\\s*([^\\n]+)`, "i");
  return text.match(re)?.[1]?.trim();
}

function parseRawgRequirements(
  minimum?: string,
  recommended?: string,
  sizeHint = "50 GB"
): GameAutoFillResult["systemRequirements"] | null {
  if (!minimum && !recommended) return null;

  const parseBlock = (block: string) => ({
    os: parseReqLine(block, "OS") || parseReqLine(block, "Operating System") || "Windows 10 64-bit",
    processor:
      parseReqLine(block, "Processor") || parseReqLine(block, "CPU") || "Intel Core i5-8400 / AMD Ryzen 5 2600",
    memory: parseReqLine(block, "Memory") || parseReqLine(block, "RAM") || "8 GB RAM",
    graphics:
      parseReqLine(block, "Graphics") || parseReqLine(block, "GPU") || "NVIDIA GTX 1060 6GB / AMD RX 580",
    storage: parseReqLine(block, "Storage") || parseReqLine(block, "Hard Drive") || `${sizeHint} available space`,
  });

  return {
    minimum: minimum ? parseBlock(minimum) : parseBlock(recommended || ""),
    recommended: recommended ? parseBlock(recommended) : parseBlock(minimum || ""),
  };
}

async function fetchWikipediaText(title: string, long = true): Promise<string | null> {
  type SearchData = [string, string[]];
  const search = await fetchJson<SearchData>(
    `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(title)}&limit=1&format=json&origin=*`
  );
  const pageTitle = search?.[1]?.[0];
  if (!pageTitle) return null;

  const intro = long ? "" : "&exintro=1";
  type ExtractData = { query?: { pages?: Record<string, { extract?: string }> } };
  const data = await fetchJson<ExtractData>(
    `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1${intro}&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`
  );
  const extract = Object.values(data?.query?.pages ?? {})[0]?.extract?.trim();
  return extract && extract.length >= 80 ? extract : null;
}

function labelFromEntity(
  entities: Record<string, { labels?: { en?: { value: string } } }> | undefined,
  id: string | undefined
): string | undefined {
  if (!id || !entities) return undefined;
  return entities[id]?.labels?.en?.value;
}

function claimEntityId(claim: any): string | undefined {
  return claim?.mainsnak?.datavalue?.value?.id;
}

async function fetchWikidataGame(title: string): Promise<GameInfo | null> {
  type SearchResult = { search?: { id: string; label: string; description?: string }[] };
  const search = await fetchJson<SearchResult>(
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(title)}&language=en&format=json&origin=*&type=item&limit=5`
  );
  const hit =
    search?.search?.find((s) => /video game|game/i.test(s.description || "")) || search?.search?.[0];
  if (!hit) return null;

  type EntityResult = {
    entities?: Record<
      string,
      {
        labels?: { en?: { value: string } };
        descriptions?: { en?: { value: string } };
        claims?: Record<string, { mainsnak?: { datavalue?: { value?: unknown } } }[]>;
      }
    >;
  };
  const data = await fetchJson<EntityResult>(
    `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${hit.id}&props=labels|descriptions|claims&languages=en&format=json&origin=*`
  );
  const entity = data?.entities?.[hit.id];
  if (!entity) return null;

  const devIds = entity.claims?.P178?.map((c) => claimEntityId(c)).filter(Boolean) as string[];
  const pubIds = entity.claims?.P123?.map((c) => claimEntityId(c)).filter(Boolean) as string[];
  const genreIds = entity.claims?.P136?.map((c) => claimEntityId(c)).filter(Boolean) as string[];
  const yearClaim = entity.claims?.P577?.[0]?.mainsnak?.datavalue?.value as { time?: string } | undefined;
  const year = yearClaim?.time ? parseInt(yearClaim.time.slice(1, 5), 10) : undefined;

  const extraIds = [...new Set([...(devIds || []), ...(pubIds || []), ...(genreIds || [])])];
  let extraEntities: EntityResult["entities"] = {};
  if (extraIds.length) {
    const extra = await fetchJson<EntityResult>(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${extraIds.join("|")}&props=labels&languages=en&format=json&origin=*`
    );
    extraEntities = extra?.entities ?? {};
  }
  const allEntities = { ...extraEntities, [hit.id]: entity };

  const developer = devIds?.map((id) => labelFromEntity(allEntities, id)).find(Boolean);
  const publisher = pubIds?.map((id) => labelFromEntity(allEntities, id)).find(Boolean);
  const genres =
    genreIds?.map((id) => labelFromEntity(allEntities, id)).filter((g): g is string => Boolean(g)) || [];

  let description = entity.descriptions?.en?.value || "";
  const wiki = await fetchWikipediaText(hit.label, true);
  if (wiki) description = wiki;

  if (!description || description.length < 60) return null;

  return {
    description,
    developer: developer || publisher,
    publisher,
    genres,
    year,
  };
}

async function fetchRawgGame(title: string): Promise<GameInfo | null> {
  if (!RAWG_KEY?.trim()) return null;

  type RawgSearch = { results?: { id: number; name: string }[] };
  const search = await fetchJson<RawgSearch>(
    `https://api.rawg.io/api/games?key=${RAWG_KEY}&search=${encodeURIComponent(title)}&page_size=5`
  );
  const match =
    search?.results?.find((r) => r.name.toLowerCase().includes(title.toLowerCase().slice(0, 6))) ||
    search?.results?.[0];
  if (!match) return null;

  type RawgGame = {
    name?: string;
    description_raw?: string;
    developers?: { name: string }[];
    publishers?: { name: string }[];
    tags?: { name: string }[];
    genres?: { name: string }[];
    released?: string;
    requirements?: { minimum?: string; recommended?: string };
  };
  const detail = await fetchJson<RawgGame>(`https://api.rawg.io/api/games/${match.id}?key=${RAWG_KEY}`);
  if (!detail) return null;

  const plain = (detail.description_raw || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const year = detail.released ? parseInt(detail.released.slice(0, 4), 10) : undefined;
  const sizeHint = year && year >= 2022 ? "70 GB" : "45 GB";

  return {
    description: plain,
    developer: detail.developers?.[0]?.name,
    publisher: detail.publishers?.[0]?.name,
    genres: [...(detail.genres?.map((g) => g.name) || []), ...(detail.tags?.slice(0, 4).map((t) => t.name) || [])],
    year,
    sizeHint,
    requirements: parseRawgRequirements(
      detail.requirements?.minimum,
      detail.requirements?.recommended,
      sizeHint
    ) || undefined,
  };
}

function buildVariedRequirements(
  title: string,
  year?: number,
  genre?: string,
  sizeHint = "50 GB"
): GameAutoFillResult["systemRequirements"] {
  const seed = hashSeed(title + (genre || ""));
  const y = year ?? 2020;
  const g = (genre || "action").toLowerCase();

  const cpuOptions = {
    low: [
      "Intel Core i3-9100 / AMD Ryzen 3 3100",
      "Intel Core i3-10100 / AMD Ryzen 3 3300X",
      "Intel Core i3-10105 / AMD Ryzen 3 4100",
    ],
    mid: [
      "Intel Core i5-10400 / AMD Ryzen 5 3600",
      "Intel Core i5-11400 / AMD Ryzen 5 4500",
      "Intel Core i5-12400F / AMD Ryzen 5 5600",
    ],
    high: [
      "Intel Core i7-12700F / AMD Ryzen 7 5800X",
      "Intel Core i7-13700 / AMD Ryzen 7 7700X",
      "Intel Core i9-12900K / AMD Ryzen 9 5900X",
    ],
  };

  const gpuOptions = {
    low: [
      "NVIDIA GTX 1650 / AMD RX 6500 XT",
      "NVIDIA GTX 1650 Super / AMD RX 570",
      "NVIDIA GTX 1660 / AMD RX 580",
    ],
    mid: [
      "NVIDIA RTX 2060 / AMD RX 6600 XT",
      "NVIDIA RTX 3060 / AMD RX 6600",
      "NVIDIA RTX 3060 Ti / AMD RX 6700 XT",
    ],
    high: [
      "NVIDIA RTX 3070 / AMD RX 6800",
      "NVIDIA RTX 4070 / AMD RX 7800 XT",
      "NVIDIA RTX 4080 / AMD RX 7900 XTX",
    ],
  };

  const isIndie = /indie|2d|puzzle|platform/.test(g);
  const isSimulation = /simulation|strategy|sports|racing/.test(g);
  const isModernAAA = y >= 2022 && /action|open world|shooter|rpg|adventure/.test(g);

  const minCpu = pick(cpuOptions.low, seed, 0);
  const recCpu = pick(cpuOptions.mid, seed, 1);
  const minGpu = pick(gpuOptions.low, seed, 2);
  const recGpu = pick(gpuOptions.high, seed, 3);

  let memMin = "8 GB RAM";
  let memRec = "16 GB RAM";
  if (isIndie) {
    memMin = "8 GB RAM";
    memRec = "16 GB RAM";
  } else if (isModernAAA || isSimulation) {
    memMin = "16 GB RAM";
    memRec = "32 GB RAM";
  }

  if (y < 2018 && !isModernAAA) {
    memMin = "8 GB RAM";
    memRec = "16 GB RAM";
  }

  const osMin = y >= 2022 ? "Windows 10 64-bit" : "Windows 10 64-bit";
  const osRec = "Windows 10/11 64-bit";
  const storageMin = `${sizeHint} available space`;
  const storageRec = `${sizeHint} SSD space (NVMe recommended)`;

  return {
    minimum: {
      os: osMin,
      processor: minCpu,
      memory: memMin,
      graphics: minGpu,
      storage: storageMin,
    },
    recommended: {
      os: osRec,
      processor: recCpu,
      memory: memRec,
      graphics: recGpu,
      storage: storageRec,
    },
  };
}

function expandDescription(
  base: string,
  title: string,
  developer: string,
  genre: string,
  year?: number,
  publisher?: string
): string {
  const intro = base.trim().slice(0, 1200);
  const yearText = year ? ` Originally released in ${year},` : "";
  const pub = publisher && publisher !== developer ? ` Published by ${publisher},` : "";

  const paragraphs = [
    intro.length > 120
      ? intro
      : `${title} is a widely played ${genre.toLowerCase()} title for Windows PC.${yearText}${pub} it was developed by ${developer} and remains popular with players worldwide.`,
    `${title} blends strong ${genre.toLowerCase()} gameplay with polished presentation, rewarding exploration, and hours of single-player and multiplayer content depending on the edition you install.`,
    `Players searching for ${title} download, ${title} free download for PC, ${title} repack, or ${title} full version setup will find this page updated with direct links, installation notes, and verified file information.`,
    `Before you install ${title}, review the minimum and recommended system requirements listed below. Meeting recommended specs delivers smoother frame rates, faster loading, and better stability on modern Windows builds.`,
    `This ${title} PC build is packaged for easy setup: extract the archive, run the installer or setup executable, follow on-screen prompts, and launch the game from the desktop shortcut. If a password is required, it is shown on this page near the download button.`,
    `Whether you are returning to ${title} or playing for the first time, keep your GPU drivers updated and install latest DirectX / Visual C++ runtimes for the best experience.`,
  ];

  return paragraphs.join("\n\n").slice(0, 2800);
}

function buildTags(title: string, categories: string[], extra: string[] = []): string {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const tags = new Set<string>([
    title,
    `${title} download`,
    `${title} free download`,
    `${title} pc download`,
    `${title} full version`,
    `${title} repack`,
    `${title} highly compressed`,
    `${title} windows 10`,
    `${title} windows 11`,
    "steamfree games",
    "pc game download",
    "free pc games",
    ...words,
    ...categories,
    ...categories.map((c) => `${c} games download`),
    ...extra,
  ]);

  return Array.from(tags).slice(0, 24).join(", ");
}

function parseStudioFromText(text: string): { developer?: string; publisher?: string } {
  return {
    developer:
      text.match(/(?:developed|created)\s+by\s+([^.,;\n]+)/i)?.[1]?.trim() ||
      text.match(/developer[s]?:\s*([^.,;\n]+)/i)?.[1]?.trim(),
    publisher:
      text.match(/published\s+by\s+([^.,;\n]+)/i)?.[1]?.trim() ||
      text.match(/publisher[s]?:\s*([^.,;\n]+)/i)?.[1]?.trim(),
  };
}

function buildScreenshotUrls(title: string, genre: string, count = 3): string[] {
  const query = encodeURIComponent(`${title} ${genre} video game`);
  return Array.from({ length: count }, (_, i) => `https://source.unsplash.com/1600x900/?${query}&sig=${i}`);
}

export async function autoFillGameDetails(
  title: string,
  categories: string[] = []
): Promise<GameAutoFillResult> {
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Enter a game title first");

  const known = lookupKnownGame(trimmed);
  
  // Try Gemini first (free), then OpenAI as fallback
  const aiResult = (await fetchGeminiGameDetails(trimmed, categories, known)) || 
                   (await fetchOpenAIGameDetails(trimmed, categories, known));
  
  const [rawg, wikidata, wikiLong, catalogGame] = await Promise.all([
    fetchRawgGame(trimmed),
    fetchWikidataGame(trimmed),
    fetchWikipediaText(trimmed, true),
    searchGameCatalog(trimmed),
  ]);

  if (aiResult) return aiResult;

  const catalogInfo: GameInfo | null = catalogGame
    ? {
        description: catalogGame.short_description,
        developer: catalogGame.developer,
        publisher: catalogGame.publisher,
        genres: [catalogGame.genre],
        year: catalogGame.release_date ? parseInt(catalogGame.release_date, 10) : undefined,
        sizeHint: "30 GB",
      }
    : null;

  const parsed = wikiLong ? parseStudioFromText(wikiLong) : {};
  const info = rawg || wikidata || catalogInfo;

  const developer =
    info?.developer ||
    parsed.developer ||
    known?.developer ||
    catalogGame?.developer ||
    info?.publisher ||
    parsed.publisher ||
    known?.publisher ||
    "Unknown Developer";

  const publisher = info?.publisher || catalogGame?.publisher || known?.publisher;
  const genre = info?.genres?.[0] || known?.genre || categories[0] || catalogGame?.genre || "Action";
  const year = info?.year || known?.year;
  const sizeHint = info?.sizeHint || known?.sizeHint || (year && year >= 2022 ? "65 GB" : "40 GB");

  const baseDesc =
    info?.description ||
    wikiLong ||
    catalogGame?.short_description ||
    `${trimmed} is a ${genre} game for PC.`;

  const description = expandDescription(baseDesc, trimmed, developer, genre, year, publisher);

  const systemRequirements =
    info?.requirements || buildVariedRequirements(trimmed, year, genre, sizeHint);

  const tags = buildTags(trimmed, categories.length ? categories : [genre], info?.genres || []);

  let source: GameAutoFillResult["source"] = "template";
  if (rawg) source = "rawg";
  else if (wikidata) source = "wikidata";
  else if (wikiLong) source = "wikipedia";
  else if (catalogGame) source = "catalog";
  else if (known) source = "database";

  return { description, developer, tags, systemRequirements, source };
}
