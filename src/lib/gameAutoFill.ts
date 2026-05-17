/** Free auto-fill: Wikipedia + Wikidata + game database + optional RAWG API. */
import { lookupKnownGame } from "./gameDatabase";

export interface GameAutoFillResult {
  description: string;
  developer: string;
  tags: string;
  systemRequirements: {
    minimum: { os: string; processor: string; memory: string; graphics: string; storage: string };
    recommended: { os: string; processor: string; memory: string; graphics: string; storage: string };
  };
  source: "wikidata" | "wikipedia" | "rawg" | "database" | "template";
}

type WikiGameInfo = {
  pageTitle: string;
  description: string;
  developer?: string;
  publisher?: string;
  genres: string[];
  year?: number;
};

const RAWG_KEY = import.meta.env.VITE_RAWG_API_KEY as string | undefined;

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function labelFromEntity(
  entities: Record<string, { labels?: { en?: { value: string } } }> | undefined,
  id: string | undefined
): string | undefined {
  if (!id || !entities) return undefined;
  return entities[id]?.labels?.en?.value;
}

function claimEntityId(claim: { mainsnak?: { datavalue?: { value?: { id?: string } } } } | undefined): string | undefined {
  return claim?.mainsnak?.datavalue?.value?.id;
}

async function fetchWikidataGame(title: string): Promise<WikiGameInfo | null> {
  type SearchResult = {
    search?: { id: string; label: string; description?: string }[];
  };
  const search = await fetchJson<SearchResult>(
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(title)}&language=en&format=json&origin=*&type=item&limit=5`
  );
  const hit =
    search?.search?.find((s) => /video game|game|series/i.test(s.description || "")) ||
    search?.search?.[0];
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
  const yearClaim = entity.claims?.P577?.[0]?.mainsnak?.datavalue?.value as
    | { time?: string }
    | undefined;
  const year = yearClaim?.time ? parseInt(yearClaim.time.slice(1, 5), 10) : undefined;

  const extraIds = [...new Set([...(devIds || []), ...(pubIds || []), ...(genreIds || [])])];
  let extraEntities: EntityResult["entities"] = {};
  if (extraIds.length > 0) {
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

  let description = entity.descriptions?.en?.value || hit.description || "";
  if (description.length < 60) {
    const wiki = await fetchWikipediaExtract(hit.label);
    if (wiki) description = wiki;
  }

  if (!description || description.length < 30) return null;

  return {
    pageTitle: hit.label,
    description: description.slice(0, 950),
    developer: developer || publisher,
    publisher,
    genres,
    year,
  };
}

async function fetchWikipediaExtract(title: string): Promise<string | null> {
  type SearchData = [string, string[]];
  const search = await fetchJson<SearchData>(
    `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(title)}&limit=1&namespace=0&format=json&origin=*`
  );
  const pageTitle = search?.[1]?.[0];
  if (!pageTitle) return null;

  type ExtractData = {
    query?: { pages?: Record<string, { extract?: string }> };
  };
  const extractData = await fetchJson<ExtractData>(
    `https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=1&explaintext=1&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`
  );
  const extract = Object.values(extractData?.query?.pages ?? {})[0]?.extract?.trim();
  return extract && extract.length >= 40 ? extract.slice(0, 950) : null;
}

function parseStudioFromText(text: string): { developer?: string; publisher?: string } {
  const dev =
    text.match(/(?:developed|created|designed)\s+by\s+([^.,;\n]+)/i)?.[1]?.trim() ||
    text.match(/developer[s]?:\s*([^.,;\n]+)/i)?.[1]?.trim();
  const pub =
    text.match(/published\s+by\s+([^.,;\n]+)/i)?.[1]?.trim() ||
    text.match(/publisher[s]?:\s*([^.,;\n]+)/i)?.[1]?.trim();
  return { developer: dev, publisher: pub };
}

async function fetchRawgGame(title: string): Promise<WikiGameInfo | null> {
  if (!RAWG_KEY?.trim()) return null;

  type RawgSearch = { results?: { id: number; name: string }[] };
  const search = await fetchJson<RawgSearch>(
    `https://api.rawg.io/api/games?key=${RAWG_KEY}&search=${encodeURIComponent(title)}&page_size=3`
  );
  const gameId = search?.results?.[0]?.id;
  if (!gameId) return null;

  type RawgGame = {
    name?: string;
    description_raw?: string;
    developers?: { name: string }[];
    publishers?: { name: string }[];
    tags?: { name: string }[];
    genres?: { name: string }[];
    released?: string;
  };
  const detail = await fetchJson<RawgGame>(`https://api.rawg.io/api/games/${gameId}?key=${RAWG_KEY}`);
  if (!detail?.description_raw && !detail?.name) return null;

  const plain = (detail.description_raw || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return {
    pageTitle: detail.name || title,
    description: plain.slice(0, 950) || `${detail.name} PC game.`,
    developer: detail.developers?.[0]?.name,
    publisher: detail.publishers?.[0]?.name,
    genres: [
      ...(detail.genres?.map((g) => g.name) || []),
      ...(detail.tags?.slice(0, 5).map((t) => t.name) || []),
    ],
    year: detail.released ? parseInt(detail.released.slice(0, 4), 10) : undefined,
  };
}

function buildSystemRequirements(year?: number, genre?: string, sizeHint = "50 GB") {
  const y = year ?? 2020;
  const g = (genre || "").toLowerCase();
  const isHeavy = /open world|racing|simulation|flight|sports|action|rpg|shooter/.test(g);
  const isLight = /indie|puzzle|2d|platform|casual|retro/.test(g);

  if (y >= 2023 || (y >= 2020 && isHeavy)) {
    return {
      minimum: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i5-10400 / AMD Ryzen 5 3600",
        memory: "16 GB RAM",
        graphics: "NVIDIA GTX 1660 Super / AMD RX 5600 XT",
        storage: `${sizeHint} available space (SSD recommended)`,
      },
      recommended: {
        os: "Windows 11 64-bit",
        processor: "Intel Core i7-12700K / AMD Ryzen 7 5800X",
        memory: "32 GB RAM",
        graphics: "NVIDIA RTX 3070 / AMD RX 6800 XT",
        storage: `${sizeHint} SSD space`,
      },
    };
  }

  if (y >= 2018 || isHeavy) {
    return {
      minimum: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i5-8400 / AMD Ryzen 5 2600",
        memory: "8 GB RAM",
        graphics: "NVIDIA GTX 1060 6GB / AMD RX 580",
        storage: `${sizeHint} available space`,
      },
      recommended: {
        os: "Windows 10/11 64-bit",
        processor: "Intel Core i7-9700K / AMD Ryzen 7 3700X",
        memory: "16 GB RAM",
        graphics: "NVIDIA RTX 2060 / AMD RX 5700 XT",
        storage: `${sizeHint} SSD space`,
      },
    };
  }

  if (isLight || y < 2015) {
    return {
      minimum: {
        os: "Windows 7/10 64-bit",
        processor: "Intel Core i3-4130 / AMD FX-6300",
        memory: "4 GB RAM",
        graphics: "NVIDIA GTX 750 Ti / AMD R7 260X",
        storage: `${sizeHint} available space`,
      },
      recommended: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i5-4460 / AMD FX-8350",
        memory: "8 GB RAM",
        graphics: "NVIDIA GTX 960 / AMD R9 380",
        storage: `${sizeHint} available space`,
      },
    };
  }

  return {
    minimum: {
      os: "Windows 10 64-bit",
      processor: "Intel Core i5-4590 / AMD FX-8350",
      memory: "8 GB RAM",
      graphics: "NVIDIA GTX 950 / AMD R7 370",
      storage: `${sizeHint} available space`,
    },
    recommended: {
      os: "Windows 10/11 64-bit",
      processor: "Intel Core i7-4770 / AMD Ryzen 5 1600",
      memory: "16 GB RAM",
      graphics: "NVIDIA GTX 1060 / AMD RX 580",
      storage: `${sizeHint} SSD space`,
    },
  };
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
    `${title} highly compressed`,
    `${title} repack`,
    `${title} windows`,
    "pc game download",
    "free pc games",
    "full version pc game",
    ...words,
    ...categories.map((c) => `${c} game download`),
    ...categories,
    ...extra,
  ]);

  return Array.from(tags)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 20)
    .join(", ");
}

function templateDescription(title: string, categories: string[], developer: string): string {
  const genre = categories[0] || "action";
  return `${title} is a ${genre.toLowerCase()} PC game developed by ${developer}. Download ${title} for Windows with full version setup, installation guide, system requirements, and fast links. Updated for PC players looking for ${title} free download and repack builds.`;
}

export async function autoFillGameDetails(
  title: string,
  categories: string[] = []
): Promise<GameAutoFillResult> {
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Enter a game title first");

  const known = lookupKnownGame(trimmed);

  const [wikidata, rawg, wikiText] = await Promise.all([
    fetchWikidataGame(trimmed),
    fetchRawgGame(trimmed),
    fetchWikipediaExtract(trimmed),
  ]);

  const parsed = wikiText ? parseStudioFromText(wikiText) : {};
  const info = rawg || wikidata;

  const developer =
    info?.developer ||
    parsed.developer ||
    known?.developer ||
    info?.publisher ||
    parsed.publisher ||
    known?.publisher ||
    "Unknown Developer";

  const description =
    info?.description ||
    wikiText ||
    (known
      ? templateDescription(trimmed, categories.length ? categories : [known.genre || "Action"], developer)
      : templateDescription(trimmed, categories, developer));

  const genre = info?.genres?.[0] || known?.genre || categories[0] || "Action";
  const year = info?.year || known?.year;
  const sizeHint = known?.sizeHint || (year && year >= 2022 ? "60 GB" : "40 GB");

  const tags = buildTags(trimmed, categories.length ? categories : [genre], info?.genres || []);

  const systemRequirements = buildSystemRequirements(year, genre, sizeHint);

  let source: GameAutoFillResult["source"] = "template";
  if (rawg) source = "rawg";
  else if (wikidata) source = "wikidata";
  else if (wikiText) source = "wikipedia";
  else if (known) source = "database";

  return {
    description,
    developer,
    tags,
    systemRequirements,
    source,
  };
}
