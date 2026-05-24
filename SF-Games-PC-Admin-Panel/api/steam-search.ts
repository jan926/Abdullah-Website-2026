type GameRequirements = {
  title: string;
  developer?: string;
  description?: string;
  tags?: string[];
  minimum: {
    os: string;
    processor: string;
    memory: string;
    graphics: string;
    storage: string;
  };
  recommended: {
    os: string;
    processor: string;
    memory: string;
    graphics: string;
    storage: string;
  };
};

const SUPPORTED_STORES = new Set(["steam", "epic", "ea", "ubisoft", "arealgamer", "all"]);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  const url = new URL(req.url || "", "http://localhost");
  const name =
    req.query?.name ||
    url.searchParams.get("name");
  const type =
    (req.query?.type || url.searchParams.get("type") || "search").toString().toLowerCase();
  const store =
    (req.query?.store || url.searchParams.get("store") || "all").toString().toLowerCase();

  if (!name || typeof name !== "string" || !name.trim()) {
    return res.status(400).json({ error: "Missing required query parameter: name" });
  }

  if (!SUPPORTED_STORES.has(store)) {
    return res.status(400).json({ error: "Unsupported store source" });
  }

  const query = name.trim();

  try {
    if (type === "suggest") {
      const suggestions = await getStoreSuggestions(query, store);
      return res.status(200).json({ suggestions });
    }

    const result = await getStoreRequirements(query, store);
    if (!result) {
      return res.status(404).json({ error: "Game requirements not available for this store" });
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error("Store lookup error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getStoreSuggestions(gameName: string, store: string): Promise<string[]> {
  if (store === "epic") {
    return await fetchEpicSuggestions(gameName);
  }

  if (store === "arealgamer") {
    return await fetchArealGamerSuggestions(gameName);
  }

  if (store === "steam") {
    return await fetchSteamSuggestions(gameName);
  }

  if (store === "all") {
    const [steam, epic, areal] = await Promise.all([
      fetchSteamSuggestions(gameName),
      fetchEpicSuggestions(gameName),
      fetchArealGamerSuggestions(gameName),
    ]);

    return Array.from(
      new Set([...(steam || []), ...(epic || []), ...(areal || [])])
    ).slice(0, 15);
  }

  return [];
}

async function getStoreRequirements(gameName: string, store: string): Promise<GameRequirements | null> {
  if (store === "steam") {
    return await searchSteamStore(gameName);
  }

  if (store === "epic") {
    return await searchEpicStore(gameName);
  }

  if (store === "ea") {
    return await searchEAStore(gameName);
  }

  if (store === "ubisoft") {
    return await searchUbisoftStore(gameName);
  }

  if (store === "arealgamer") {
    return await searchArealGamerStore(gameName);
  }

  if (store === "all") {
    const steamResult = await searchSteamStore(gameName);
    if (steamResult) return steamResult;
    const epicResult = await searchEpicStore(gameName);
    if (epicResult) return epicResult;
    const arealResult = await searchArealGamerStore(gameName);
    if (arealResult) return arealResult;
  }

  return null;
}

async function searchSteamStore(gameName: string): Promise<GameRequirements | null> {
  try {
    const searchResponse = await fetch(
      `https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(gameName)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json",
        },
      }
    );
    if (!searchResponse.ok) return null;

    const searchResults = await searchResponse.json();
    if (!Array.isArray(searchResults) || searchResults.length === 0) return null;

    const bestMatch = searchResults[0];
    const appId = bestMatch?.appid;
    if (!appId) return null;

    const storeResponse = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&l=english`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json",
        },
      }
    );
    if (!storeResponse.ok) return null;

    const storeData = await storeResponse.json();
    const appData = storeData[String(appId)];
    if (!appData?.success || !appData?.data) return null;

    const requirements = parseSteamRequirements(appData.data.pc_requirements);
    if (!requirements) return null;

    const developer = Array.isArray(appData.data.developers)
      ? appData.data.developers.join(", ")
      : String(appData.data.developer || "").trim();

    const description = String(
      appData.data.short_description ||
      appData.data.about_the_game ||
      appData.data.detailed_description ||
      ""
    )
      .replace(/<[^>]+>/gi, "")
      .trim();

    const steamTags = Array.isArray(appData.data.genres)
      ? appData.data.genres.map((genre) => String(genre?.description || "").trim()).filter(Boolean)
      : [];

    return {
      ...requirements,
      developer: developer || undefined,
      description: description || undefined,
      tags: steamTags.length ? steamTags : undefined,
    };
  } catch (error) {
    console.error("Steam store lookup failed", error);
    return null;
  }
}

async function fetchSteamSuggestions(gameName: string): Promise<string[]> {
  try {
    const searchResponse = await fetch(
      `https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(gameName)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json",
        },
      }
    );
    if (!searchResponse.ok) return [];

    const searchResults = await searchResponse.json();
    if (!Array.isArray(searchResults)) return [];

    return Array.from(
      new Set(
        searchResults
          .slice(0, 10)
          .map((item) => String(item.name || "").trim())
          .filter(Boolean),
      ),
    );
  } catch (error) {
    console.error("Steam suggestion lookup failed", error);
    return [];
  }
}

async function fetchEpicSuggestions(gameName: string): Promise<string[]> {
  try {
    const response = await fetch("https://www.epicgames.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
      },
      body: JSON.stringify({
        query: "query searchStoreQuery($queryString:String!, $locale:String!, $region:String!){ Catalog { searchStore(query:$queryString, locale:$locale, region:$region) { elements { title } } } }",
        variables: {
          queryString: gameName,
          locale: "en-US",
          region: "US",
        },
      }),
    });
    if (!response.ok) return [];

    const result = await response.json();
    const elements = result?.data?.Catalog?.searchStore?.elements;
    if (!Array.isArray(elements)) return [];

    return Array.from(
      new Set(
        elements
          .map((item) => String(item?.title || "").trim())
          .filter(Boolean),
      ),
    ).slice(0, 10);
  } catch (error) {
    console.error("Epic suggestion lookup failed", error);
    return [];
  }
}

async function fetchArealGamerSearchResults(gameName: string): Promise<Array<{ title: string; url: string }>> {
  try {
    const response = await fetch(
      `https://www.arealgamer.org/?s=${encodeURIComponent(gameName)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "text/html",
        },
      }
    );

    if (!response.ok) return [];

    const html = await response.text();
    const results: Array<{ title: string; url: string }> = [];
    const regex = /<article[^>]*class=["']?[^"'>]*apg-card[^"'>]*["']?[^>]*>[\s\S]*?<a[^>]*class=["']?apg-thumb["']?[^>]*>[\s\S]*?<\/a>[\s\S]*?<a[^>]*href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
    let match: RegExpExecArray | null = null;

    while ((match = regex.exec(html)) !== null && results.length < 20) {
      const url = String(match[1] || "").trim();
      const title = String(match[2] || "").trim();
      if (title && url) {
        results.push({ title, url });
      }
    }

    return results;
  } catch (error) {
    console.error("ARealGamer search failed", error);
    return [];
  }
}

async function fetchArealGamerSuggestions(gameName: string): Promise<string[]> {
  const results = await fetchArealGamerSearchResults(gameName);
  return Array.from(new Set(results.map((item) => item.title))).slice(0, 10);
}

async function searchArealGamerStore(gameName: string): Promise<GameRequirements | null> {
  try {
    const results = await fetchArealGamerSearchResults(gameName);
    if (results.length === 0) return null;

    const exactMatch = results.find(
      (result) => result.title.toLowerCase() === gameName.toLowerCase()
    );
    const bestMatch = exactMatch || results[0];

    const pageResponse = await fetch(bestMatch.url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "text/html",
      },
    });
    if (!pageResponse.ok) return null;

    const html = await pageResponse.text();
    const titleMatch = /<title>([^<]+)<\/title>/i.exec(html);
    const title = titleMatch ? titleMatch[1].trim() : bestMatch.title;

    const metaDescriptionMatch = /<meta property=["']og:description["'] content=["']([^"']+)["']\/?>/i.exec(html);
    const rawMetaDescription = metaDescriptionMatch ? metaDescriptionMatch[1] : "";
    const decodedMeta = rawMetaDescription
      .replace(/&#8211;/g, "-")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"');

    const developerMatch = /Developer:\s*([^<>\n\r]+?)(?:\s*Publisher:|\s*$)/i.exec(decodedMeta);
    const descriptionMatch = /Description:\s*([^<>\n\r]+)$/i.exec(decodedMeta);
    const genreMatch = /Genre:\s*([^<>\n\r]+?)(?:\s*Release Date:|\s*Developer:|\s*$)/i.exec(decodedMeta);
    const description = descriptionMatch ? descriptionMatch[1].trim() : rawMetaDescription;
    const tags = genreMatch
      ? genreMatch[1].split(",").map((tag) => tag.trim()).filter(Boolean)
      : [];

    const requirementsMatch = /Minimum System Requirements:[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/i.exec(html);
    if (!requirementsMatch) return null;

    const minimum = parseRequirementBlock(requirementsMatch[1]);
    return {
      title,
      developer: developerMatch ? developerMatch[1].trim() : undefined,
      description: description ? description.trim() : undefined,
      tags: tags.length ? tags : undefined,
      minimum,
      recommended: minimum,
    };
  } catch (error) {
    console.error("ARealGamer lookup failed", error);
    return null;
  }
}

async function searchEpicStore(_gameName: string): Promise<GameRequirements | null> {
  return null;
}

async function searchEAStore(_gameName: string): Promise<GameRequirements | null> {
  return null;
}

async function searchUbisoftStore(_gameName: string): Promise<GameRequirements | null> {
  return null;
}

function parseSteamRequirements(pcRequirements) {
  if (!pcRequirements) {
    return null;
  }

  if (typeof pcRequirements === "string") {
    return {
      title: "Steam Game",
      minimum: parseRequirementBlock(pcRequirements),
      recommended: parseRequirementBlock(pcRequirements),
    };
  }

  if (typeof pcRequirements === "object") {
    const minimumText = String(pcRequirements.minimum || "");
    const recommendedText = String(pcRequirements.recommended || "");

    return {
      title: "Steam Game",
      minimum: parseRequirementBlock(minimumText),
      recommended: parseRequirementBlock(recommendedText),
    };
  }

  return null;
}

function parseRequirementBlock(text) {
  const normalized = String(text)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>|<\/p>|<\/div>|<\/ul>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\r/g, "")
    .replace(/\n+/g, "\n")
    .trim();

  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const parsed = {
    os: "",
    processor: "",
    memory: "",
    graphics: "",
    storage: "",
  };

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.startsWith("os:")) {
      parsed.os = line.slice(3).trim();
      continue;
    }
    if (lower.startsWith("processor:") || lower.startsWith("cpu:")) {
      parsed.processor = line.split(":").slice(1).join(":").trim();
      continue;
    }
    if (lower.startsWith("memory:")) {
      parsed.memory = line.slice(7).trim();
      continue;
    }
    if (lower.startsWith("graphics:") || lower.startsWith("video card:")) {
      parsed.graphics = line.split(":").slice(1).join(":").trim();
      continue;
    }
    if (
      lower.startsWith("storage:") ||
      lower.startsWith("space required:") ||
      lower.startsWith("storage required:")
    ) {
      parsed.storage = line.split(":").slice(1).join(":").trim();
      continue;
    }
  }

  const fallbackValue = lines.join(" \u2022 ");
  return {
    os: parsed.os || fallbackValue,
    processor: parsed.processor || fallbackValue,
    memory: parsed.memory || fallbackValue,
    graphics: parsed.graphics || fallbackValue,
    storage: parsed.storage || fallbackValue,
  };
}
