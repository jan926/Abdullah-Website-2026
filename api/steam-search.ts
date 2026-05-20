type GameRequirements = {
  title: string;
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

const SUPPORTED_STORES = new Set(["steam", "epic", "ea", "ubisoft", "all"]);

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

  if (store === "steam" || store === "all") {
    return await fetchSteamSuggestions(gameName);
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

  if (store === "all") {
    const steamResult = await searchSteamStore(gameName);
    if (steamResult) return steamResult;
    const epicResult = await searchEpicStore(gameName);
    if (epicResult) return epicResult;
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

    return parseSteamRequirements(appData.data.pc_requirements);
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
    if (lower.startsWith("graphics:")) {
      parsed.graphics = line.slice(9).trim();
      continue;
    }
    if (lower.startsWith("storage:")) {
      parsed.storage = line.slice(8).trim();
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
