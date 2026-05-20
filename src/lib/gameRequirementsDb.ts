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
    title: "GTA IV",
    minimum: {
      os: "Windows Vista, Windows 7, Windows 8",
      processor: "Intel Core 2 Duo @ 1.8GHz",
      memory: "4 GB RAM",
      graphics: "NVIDIA GeForce 8600 GT / ATI Radeon HD 3650",
      storage: "25 GB HDD",
    },
    recommended: {
      os: "Windows Vista, Windows 7, Windows 8",
      processor: "Intel Core i7 or AMD equivalent",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 560 / ATI Radeon HD 5870",
      storage: "25 GB HDD",
    },
  },
  {
    title: "GTA San Andreas",
    minimum: {
      os: "Windows 98 / ME / XP / 2000",
      processor: "Intel Pentium III 800 MHz",
      memory: "128 MB RAM",
      graphics: "NVIDIA GeForce 3 / ATI Radeon 8500",
      storage: "4 GB HDD",
    },
    recommended: {
      os: "Windows Vista / XP / 2000",
      processor: "Intel Pentium IV 2.0 GHz",
      memory: "256 MB RAM",
      graphics: "NVIDIA GeForce4 MX / ATI Radeon 9200",
      storage: "4 GB HDD",
    },
  },
  {
    title: "GTA III",
    minimum: {
      os: "Windows 2000 / XP",
      processor: "Pentium III 500 MHz",
      memory: "64 MB RAM",
      graphics: "16 MB Graphics Card",
      storage: "2.5 GB HDD",
    },
    recommended: {
      os: "Windows 2000 / XP",
      processor: "Pentium III 1000 MHz",
      memory: "128 MB RAM",
      graphics: "32 MB Graphics Card",
      storage: "2.5 GB HDD",
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
    title: "Call of Duty Black Ops Cold War",
    minimum: {
      os: "Windows 10 64-bit",
      processor: "Intel Core i5-8400 / AMD Ryzen 5 1600",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 960 / AMD Radeon RX 480",
      storage: "125 GB SSD",
    },
    recommended: {
      os: "Windows 10 64-bit",
      processor: "Intel Core i7-8700K / AMD Ryzen 7 1700",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce RTX 3070 / AMD Radeon RX 6700 XT",
      storage: "125 GB SSD",
    },
  },
  {
    title: "Call of Duty Modern Warfare II",
    minimum: {
      os: "Windows 10 64-bit",
      processor: "Intel Core i5-9400 / AMD Ryzen 5 3600",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 1050 Ti / AMD Radeon RX 460",
      storage: "125 GB SSD",
    },
    recommended: {
      os: "Windows 10 64-bit",
      processor: "Intel Core i7-9700K / AMD Ryzen 7 2700X",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce RTX 2070 / AMD Radeon RX 5700 XT",
      storage: "125 GB SSD",
    },
  },
  {
    title: "Call of Duty Warzone 2",
    minimum: {
      os: "Windows 10 64-bit",
      processor: "Intel Core i5-9400 / AMD Ryzen 5 3600",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 1050 Ti / AMD Radeon RX 460",
      storage: "125 GB SSD",
    },
    recommended: {
      os: "Windows 10 64-bit",
      processor: "Intel Core i7-9700 / AMD Ryzen 7 2700X",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce RTX 2070 / AMD Radeon RX 5700 XT",
      storage: "125 GB SSD",
    },
  },
  {
    title: "Call of Duty Black Ops",
    minimum: {
      os: "Windows XP / Vista / 7",
      processor: "Intel Core 2 Duo 1.8GHz / AMD equivalent",
      memory: "2 GB RAM",
      graphics: "NVIDIA GeForce 8800 / ATI Radeon 3800",
      storage: "16 GB HDD",
    },
    recommended: {
      os: "Windows Vista / 7",
      processor: "Intel Core i7 / AMD equivalent",
      memory: "4 GB RAM",
      graphics: "NVIDIA GeForce GTX 260 / ATI Radeon HD 4850",
      storage: "16 GB HDD",
    },
  },
  {
    title: "Tekken 8",
    minimum: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i5-9400 / AMD Ryzen 5 2600",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 1060 / AMD Radeon RX 580",
      storage: "100 GB SSD",
    },
    recommended: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i7-10700 / AMD Ryzen 7 3700X",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce RTX 2080 / AMD Radeon RX 5700 XT",
      storage: "100 GB SSD",
    },
  },
  {
    title: "Tekken 7",
    minimum: {
      os: "Windows 7 / 8 / 10 64-bit",
      processor: "Intel Core i5-650 / AMD FX 6100",
      memory: "4 GB RAM",
      graphics: "NVIDIA GeForce GTX 550 Ti / AMD Radeon R9",
      storage: "60 GB HDD",
    },
    recommended: {
      os: "Windows 7 / 8 / 10 64-bit",
      processor: "Intel Core i7-9700 / AMD Ryzen 5 3600",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 1070 / AMD Radeon RX Vega 56",
      storage: "60 GB SSD",
    },
  },
  {
    title: "Tekken 6",
    minimum: {
      os: "Windows Vista / XP / 7",
      processor: "Intel Core Duo 1.6GHz",
      memory: "1 GB RAM",
      graphics: "NVIDIA GeForce 8600 / ATI Radeon 2400",
      storage: "15 GB HDD",
    },
    recommended: {
      os: "Windows Vista / 7",
      processor: "Intel Core 2 Quad 2.4GHz",
      memory: "2 GB RAM",
      graphics: "NVIDIA GeForce GTX 260 / ATI Radeon HD 4870",
      storage: "15 GB HDD",
    },
  },
  {
    title: "Tekken 5",
    minimum: {
      os: "Windows Vista / XP",
      processor: "Intel Pentium 4 1.5GHz",
      memory: "512 MB RAM",
      graphics: "NVIDIA GeForce 4 MX / ATI Radeon 8500",
      storage: "10 GB HDD",
    },
    recommended: {
      os: "Windows Vista",
      processor: "Intel Core 2 Duo 2.0GHz",
      memory: "1 GB RAM",
      graphics: "NVIDIA GeForce 8800 / ATI Radeon X1900",
      storage: "10 GB HDD",
    },
  },
  {
    title: "Need for Speed Unbound",
    minimum: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i5-9600K / AMD Ryzen 5 3600",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce RTX 2070 / AMD Radeon RX 5700 XT",
      storage: "100 GB SSD",
    },
    recommended: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i9-10900K / AMD Ryzen 9 3900X",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce RTX 3080 Ti / AMD Radeon RX 6800 XT",
      storage: "100 GB SSD",
    },
  },
  {
    title: "Need for Speed Heat",
    minimum: {
      os: "Windows 8 / 10 64-bit",
      processor: "Intel Core i5-7600K / AMD Ryzen 5 1600",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 1050 Ti / AMD Radeon RX 460",
      storage: "70 GB HDD",
    },
    recommended: {
      os: "Windows 8 / 10 64-bit",
      processor: "Intel Core i7-9700 / AMD Ryzen 7 3700X",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce RTX 2080 / AMD Radeon RX 5700 XT",
      storage: "70 GB SSD",
    },
  },
  {
    title: "Need for Speed Payback",
    minimum: {
      os: "Windows Vista / 7 / 8 / 10 64-bit",
      processor: "Intel Core i5-4690 / AMD Ryzen 5 1600",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 750 / AMD Radeon R9 290",
      storage: "50 GB HDD",
    },
    recommended: {
      os: "Windows 7 / 8 / 10 64-bit",
      processor: "Intel Core i7-6700 / AMD Ryzen 7 1700",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce GTX 1080 / AMD Radeon RX Fury",
      storage: "50 GB SSD",
    },
  },
  {
    title: "Need for Speed 2015",
    minimum: {
      os: "Windows Vista / 7 / 8 / 10 64-bit",
      processor: "Intel Core i5-4690 / AMD Ryzen 5 1600",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 750 / AMD Radeon R9 290",
      storage: "40 GB HDD",
    },
    recommended: {
      os: "Windows 7 / 8 / 10 64-bit",
      processor: "Intel Core i7-6700 / AMD Ryzen 7 1700",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce GTX 1080 / AMD Radeon RX Fury",
      storage: "40 GB SSD",
    },
  },
  {
    title: "Need for Speed Underground",
    minimum: {
      os: "Windows XP / Vista",
      processor: "Intel Pentium 4 2.0GHz",
      memory: "512 MB RAM",
      graphics: "NVIDIA GeForce 4 MX / ATI Radeon 8500",
      storage: "4 GB HDD",
    },
    recommended: {
      os: "Windows XP / Vista",
      processor: "Intel Pentium 4 3.0GHz",
      memory: "1 GB RAM",
      graphics: "NVIDIA GeForce FX 5900 / ATI Radeon 9900",
      storage: "4 GB HDD",
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
  {
    title: "Assassin's Creed Mirage",
    minimum: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i5-9400 / AMD Ryzen 5 3600",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 1060 / AMD Radeon RX 580",
      storage: "110 GB SSD",
    },
    recommended: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i7-10700 / AMD Ryzen 7 3700X",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce RTX 3070 / AMD Radeon RX 6700 XT",
      storage: "110 GB SSD",
    },
  },
  {
    title: "Assassin's Creed Odyssey",
    minimum: {
      os: "Windows 7 / 8 / 10 64-bit",
      processor: "Intel Core i5-7600K / AMD Ryzen 5 1600",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 960 / AMD Radeon RX 480",
      storage: "100 GB HDD",
    },
    recommended: {
      os: "Windows 10 64-bit",
      processor: "Intel Core i7-9700 / AMD Ryzen 5 3600",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce RTX 2070 / AMD Radeon RX 5700 XT",
      storage: "100 GB SSD",
    },
  },
  {
    title: "Far Cry 6",
    minimum: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i5-9400 / AMD Ryzen 5 3600",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 960 / AMD Radeon RX 480",
      storage: "90 GB SSD",
    },
    recommended: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i7-10700 / AMD Ryzen 7 3700X",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce RTX 2080 / AMD Radeon RX 5700 XT",
      storage: "90 GB SSD",
    },
  },
  {
    title: "Resident Evil Village",
    minimum: {
      os: "Windows 10 64-bit",
      processor: "Intel Core i5-7600K / AMD Ryzen 5 1600",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 1050 Ti / AMD Radeon RX 560",
      storage: "70 GB SSD",
    },
    recommended: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i7-10700 / AMD Ryzen 7 3700X",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce RTX 2080 / AMD Radeon RX 5700 XT",
      storage: "70 GB SSD",
    },
  },
  {
    title: "Street Fighter 6",
    minimum: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i5-9400 / AMD Ryzen 5 2600",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 1060 / AMD Radeon RX 580",
      storage: "130 GB SSD",
    },
    recommended: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i7-10700 / AMD Ryzen 7 3700X",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce RTX 2080 / AMD Radeon RX 5700 XT",
      storage: "130 GB SSD",
    },
  },
  {
    title: "Mortal Kombat 1",
    minimum: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i5-9400 / AMD Ryzen 5 3600",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 1060 / AMD Radeon RX 580",
      storage: "110 GB SSD",
    },
    recommended: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i7-10700 / AMD Ryzen 7 3700X",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce RTX 2080 / AMD Radeon RX 5700 XT",
      storage: "110 GB SSD",
    },
  },
  {
    title: "Hogwarts Legacy",
    minimum: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i5-9400 / AMD Ryzen 5 3600",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 1060 / AMD Radeon RX 580",
      storage: "100 GB SSD",
    },
    recommended: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i7-10700 / AMD Ryzen 7 3700X",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce RTX 3070 / AMD Radeon RX 6800 XT",
      storage: "100 GB SSD",
    },
  },
  {
    title: "Diablo IV",
    minimum: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i5-5600K / AMD Ryzen 5 1600",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 960 / AMD Radeon RX 480",
      storage: "80 GB SSD",
    },
    recommended: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i7-8700K / AMD Ryzen 7 1700",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce RTX 2070 / AMD Radeon RX 5700 XT",
      storage: "80 GB SSD",
    },
  },
  {
    title: "Dragon's Dogma 2",
    minimum: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i7-10700 / AMD Ryzen 5 3600",
      memory: "8 GB RAM",
      graphics: "NVIDIA GeForce GTX 1070 / AMD Radeon RX 5700",
      storage: "150 GB SSD",
    },
    recommended: {
      os: "Windows 10 / 11 64-bit",
      processor: "Intel Core i9-10900K / AMD Ryzen 9 3900X",
      memory: "16 GB RAM",
      graphics: "NVIDIA GeForce RTX 2080 Ti / AMD Radeon RX 6800 XT",
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

  // Try server-side Steam lookup as fallback for games outside the local DB.
  try {
    const steamResponse = await fetch(
      `/api/steam-search?name=${encodeURIComponent(gameName)}`
    );
    if (steamResponse.ok) {
      const steamData = (await steamResponse.json()) as GameRequirements;
      if (steamData) return steamData;
    }
  } catch (error) {
    console.log("Steam lookup failed, using local DB only", error);
  }

  return null;
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
