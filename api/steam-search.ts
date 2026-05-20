export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).send("");
  }

  const name =
    req.query?.name ||
    new URL(req.url || "", "http://localhost").searchParams.get("name");
  if (!name || typeof name !== "string" || !name.trim()) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(400).json({ error: "Missing required query parameter: name" });
  }

  const query = name.trim();
  try {
    const searchResponse = await fetch(
      `https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json",
        },
      }
    );

    if (!searchResponse.ok) {
      console.error("Steam search failed", searchResponse.status);
      return res.status(502).json({ error: "Steam search unavailable" });
    }

    const searchResults = await searchResponse.json();
    if (!Array.isArray(searchResults) || searchResults.length === 0) {
      return res.status(404).json({ error: "Game not found" });
    }

    const normalizedName = query.toLowerCase();
    const bestMatch =
      searchResults.find((item) => item.name?.toLowerCase() === normalizedName) ||
      searchResults[0];
    const appId = bestMatch?.appid;
    if (!appId) {
      return res.status(404).json({ error: "Steam app id not found" });
    }

    const storeResponse = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&l=english`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json",
        },
      }
    );
    if (!storeResponse.ok) {
      console.error("Steam store details failed", storeResponse.status);
      return res.status(502).json({ error: "Steam store details unavailable" });
    }

    const storeData = await storeResponse.json();
    const appData = storeData[String(appId)];
    if (!appData?.success || !appData?.data) {
      return res.status(404).json({ error: "Steam app details missing" });
    }

    const pcRequirements = appData.data.pc_requirements;
    const parsed = parseSteamRequirements(pcRequirements);
    if (!parsed) {
      return res.status(404).json({ error: "Unable to parse system requirements" });
    }

    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(200).json(parsed);
  } catch (error) {
    console.error("Steam lookup error", error);
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(500).json({ error: "Internal server error" });
  }
}

function parseSteamRequirements(pcRequirements) {
  if (!pcRequirements) {
    return null;
  }

  if (typeof pcRequirements === "string") {
    return {
      minimum: parseRequirementBlock(pcRequirements),
      recommended: parseRequirementBlock(pcRequirements),
    };
  }

  if (typeof pcRequirements === "object") {
    const minimumText = String(pcRequirements.minimum || "");
    const recommendedText = String(pcRequirements.recommended || "");

    return {
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
