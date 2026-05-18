// Popular game system requirements database (can be extended)
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

const GAME_REQUIREMENTS_DB: GameRequirements[] = [
  {
    title: "Cyberpunk 2077",
    minimum: {
      os: "Windows 10 64-bit",
      processor: "Intel Core i7-12700 / AMD Ryzen 5 5600",
      memory: "12 GB RAM",
      graphics: "NVIDIA GeForce GTX 1070 / AMD Radeon RX 5600 XT 6GB VRAM",
      storage: "150 GB SSD",
    },
    recommended: {
      os: "Windows 10/11 64-bit",
      processor: "Intel Core i9-12900K / AMD Ryzen 9 5950X",
      memory: "20 GB RAM",
      graphics: "NVIDIA GeForce RTX 4090 / AMD Radeon RX 7900 XTX",
      storage: "150 GB SSD (NVMe)",
    },
  },
  {
    title: "Elden Ring",
    minimum: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i5-8400 / AMD Ryzen 5 2600",
      memory: "12 GB RAM",
      graphics: "NVIDIA GeForce GTX 1060 / AMD Radeon RX 580",
      storage: "60 GB SSD",
    },
    recommended: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i7-10700 / AMD Ryzen 5 3600",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce RTX 2080 / AMD Radeon RX 5700 XT",
      storage: "60 GB SSD",
    },
  },
  {
    title: "Baldur's Gate 3",
    minimum: {
      os: "Windows 10 64-bit",
      processor: "Intel Core i7-9700 / AMD FX 8350",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 580",
      storage: "150 GB SSD",
    },
    recommended: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i9-9900K / AMD Ryzen 5 3600",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce RTX 2080 / AMD Radeon RX 5700 XT",
      storage: "150 GB SSD",
    },
  },
  {
    title: "GTA V",
    minimum: {
      os: "Windows Vista, Windows 7, Windows 8 or Windows 8.1",
      processor: "Intel Core 2 Duo @ 1.8GHz or AMD equivalent",
      memory: "4 GB RAM",
      graphics: "NVIDIA 9800 GT / AMD Radeon HD 4870",
      storage: "65 GB SSD",
    },
    recommended: {
      os: "Windows Vista, Windows 7, Windows 8 or Windows 8.1",
      processor: "Intel Core i5 or AMD equivalent",
      memory: "8 GB RAM",
      graphics: "NVIDIA GTX 660 / AMD Radeon HD 7870",
      storage: "65 GB SSD",
    },
  },
  {
    title: "Call of Duty Modern Warfare III",
    minimum: {
      os: "Windows 10 64-Bit or Windows 11 64-Bit",
      processor: "Intel Core i7-8700K / AMD Ryzen 7 1700",
      memory: "16 GB RAM",
      graphics: "NVIDIA RTX 3060 Ti / AMD RX 6700 XT",
      storage: "149 GB SSD",
    },
    recommended: {
      os: "Windows 10 64-Bit or Windows 11 64-Bit",
      processor: "Intel Core i9-13900KS / AMD Ryzen 9 7950X",
      memory: "32 GB RAM",
      graphics: "NVIDIA RTX 4080 / AMD RX 7900 XTX",
      storage: "149 GB SSD",
    },
  },
  {
    title: "Palworld",
    minimum: {
      os: "Windows 10/11 64-bit",
      processor: "Intel Core i9-9900K / AMD Ryzen 5 2600",
      memory: "32 GB RAM",
      graphics: "NVIDIA GeForce RTX 2080 / AMD Radeon RX 5700 XT",
      storage: "130 GB SSD",
    },
    recommended: {
      os: "Windows 10/11 64-bit",
      processor: "Intel Core i9-13900KS / AMD Ryzen 9 7950X3D",
      memory: "64 GB RAM",
      graphics: "NVIDIA GeForce RTX 4090 / AMD Radeon RX 7900 XTX",
      storage: "130 GB SSD",
    },
  },
  {
    title: "Starfield",
    minimum: {
      os: "Windows 10/11 64-bit",
      processor: "Intel Core i7-10700 / AMD Ryzen 5 3600",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce GTX 970 / AMD Radeon RX 470",
      storage: "125 GB SSD",
    },
    recommended: {
      os: "Windows 10/11 64-bit",
      processor: "Intel Core i9-12900K / AMD Ryzen 9 5900X",
      memory: "32 GB RAM",
      graphics: "NVIDIA GeForce RTX 3080 / AMD Radeon RX 6800 XT",
      storage: "125 GB SSD",
    },
  },
  {
    title: "Fortnite",
    minimum: {
      os: "Windows 7/8/10 64-bit",
      processor: "Intel Core i5-7600K or AMD equivalent",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 960 or AMD equivalent",
      storage: "90 GB SSD",
    },
    recommended: {
      os: "Windows 10/11 64-bit",
      processor: "Intel Core i7-8700 or AMD equivalent",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce GTX 1080 or AMD equivalent",
      storage: "90 GB SSD",
    },
  },
  {
    title: "Valorant",
    minimum: {
      os: "Windows Vista, Windows 7, Windows 8, Windows 10, or Windows 11",
      processor: "Intel 2.4 GHz processor or AMD equivalent",
      memory: "4 GB RAM",
      graphics: "Intel HD Graphics 4000",
      storage: "20 GB SSD",
    },
    recommended: {
      os: "Windows 10 or Windows 11",
      processor: "Intel Core 2 Duo E8400 or AMD equivalent",
      memory: "4 GB RAM",
      graphics: "NVIDIA GeForce GT 730 or AMD equivalent",
      storage: "20 GB SSD",
    },
  },
  {
    title: "The Witcher 3",
    minimum: {
      os: "Windows 7 or Windows 10 64-bit",
      processor: "Intel Core i5 or AMD FX-8320",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 960 / AMD R9 290",
      storage: "150 GB SSD",
    },
    recommended: {
      os: "Windows 7 or Windows 10 64-bit",
      processor: "Intel Core i7 or AMD Ryzen 5 1600",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce GTX 1080 / AMD Radeon RX Fury",
      storage: "150 GB SSD",
    },
  },
];

export async function searchGameRequirements(
  gameName: string
): Promise<GameRequirements | null> {
  if (!gameName.trim()) return null;

  const searchTerm = gameName.toLowerCase().trim();

  // Exact match first
  const exact = GAME_REQUIREMENTS_DB.find(
    (g) => g.title.toLowerCase() === searchTerm
  );
  if (exact) return exact;

  // Partial match
  const partial = GAME_REQUIREMENTS_DB.find((g) =>
    g.title.toLowerCase().includes(searchTerm)
  );
  if (partial) return partial;

  // Reverse partial match
  const reverse = GAME_REQUIREMENTS_DB.find((g) =>
    searchTerm.includes(g.title.toLowerCase())
  );
  if (reverse) return reverse;

  // Try Steam API as fallback (public search, limited)
  try {
    const steamResult = await searchSteamAppId(gameName);
    if (steamResult) {
      return steamResult;
    }
  } catch (error) {
    console.log("Steam API lookup failed, using local DB only");
  }

  return null;
}

async function searchSteamAppId(gameName: string): Promise<GameRequirements | null> {
  try {
    // Using Steam's public API (no auth required for search)
    const response = await fetch(
      `https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(gameName)}`
    );
    if (!response.ok) return null;

    const data = (await response.json()) as Array<{ appid: number; name: string }>;
    if (!data.length) return null;

    const appId = data[0].appid;

    // Fetch store page data (limited info available without auth)
    const storeResponse = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appId}&l=english`
    );
    if (!storeResponse.ok) return null;

    const storeData = (await storeResponse.json()) as Record<
      string,
      { data?: { pc_requirements?: unknown } }
    >;
    
    // Steam data structure is complex and may not always have requirements
    // For now, return null and let local DB be the primary source
    return null;
  } catch (error) {
    console.log("Steam API error:", error);
    return null;
  }
}

export function getGameRequirementsSuggestions(query: string): string[] {
  if (!query.trim()) return [];

  const searchTerm = query.toLowerCase();
  return GAME_REQUIREMENTS_DB
    .filter(
      (g) =>
        g.title.toLowerCase().includes(searchTerm) ||
        searchTerm.includes(g.title.toLowerCase())
    )
    .slice(0, 5)
    .map((g) => g.title);
}
