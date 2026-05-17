export interface Game {
  id: string;
  title: string;
  cover: string;
  description: string;
  category: string;
  /** Additional categories (primary category is also kept in `category`). */
  categories?: string[];
  rating: number;
  downloads: number;
  size: string;
  releaseDate: string;
  developer: string;
  screenshots: string[];
  systemRequirements: {
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
  featured: boolean;
  trending: boolean;
  downloadLink: string;
  downloadParts?: DownloadPart[];
  filePassword?: string;
  comments: Comment[];
  trailer?: string;
  backgroundImage?: string;
  heroMedia?: string;
  views?: number;
  gameOfTheDay?: boolean;
  heroFeatured?: boolean;
  tags?: string[];
}

export interface DownloadPart {
  id: string;
  name: string;
  link: string;
  size?: string;
}

export interface Comment {
  id: string;
  user: string;
  text: string;
  rating: number;
  date: string;
}

export const gamesData: Game[] = [
  {
    id: "1",
    title: "Cyber Warriors 2077",
    cover: "https://images.unsplash.com/photo-1664092815283-19c6196f5319?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjeWJlcnB1bmslMjBnYW1pbmclMjBuZW9ufGVufDF8fHx8MTc3MzQ5NTUzNnww&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Dive into a neon-soaked dystopian future where corporations rule and hackers fight for freedom. Experience intense FPS action combined with deep RPG mechanics in this award-winning cyberpunk adventure.",
    category: "Action",
    rating: 4.8,
    downloads: 125430,
    size: "65 GB",
    releaseDate: "2024-11-15",
    developer: "Neon Studios",
    screenshots: [
      "https://images.unsplash.com/photo-1664092815283-19c6196f5319?w=800",
      "https://images.unsplash.com/photo-1772926390243-7acb97ff34f1?w=800",
      "https://images.unsplash.com/photo-1531812494838-636e337af5a6?w=800"
    ],
    systemRequirements: {
      minimum: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i5-3570K or AMD FX-8310",
        memory: "8 GB RAM",
        graphics: "NVIDIA GTX 780 or AMD Radeon RX 470",
        storage: "70 GB available space"
      },
      recommended: {
        os: "Windows 11 64-bit",
        processor: "Intel Core i7-4790 or AMD Ryzen 3 3200G",
        memory: "16 GB RAM",
        graphics: "NVIDIA GTX 1060 or AMD Radeon RX 590",
        storage: "70 GB SSD"
      }
    },
    featured: true,
    trending: true,
    downloadLink: "https://example.com/download/cyber-warriors",
    trailer: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    gameOfTheDay: true,
    comments: [
      { id: "c1", user: "GamerPro", text: "Best cyberpunk game ever!", rating: 5, date: "2026-03-10" },
      { id: "c2", user: "TechNinja", text: "Graphics are insane, runs smooth on my RTX 3080", rating: 5, date: "2026-03-12" }
    ]
  },
  {
    id: "2",
    title: "Shadow Realm Chronicles",
    cover: "https://images.unsplash.com/photo-1762838362179-1718fce76d22?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkYXJrJTIwZmFudGFzeSUyMHdhcnJpb3IlMjBnYW1lfGVufDF8fHx8MTc3MzU1NTM1OXww&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Embark on an epic dark fantasy journey through cursed lands filled with mythical creatures and ancient magic. Master combat skills and uncover the mysteries of the Shadow Realm.",
    category: "RPG",
    rating: 4.6,
    downloads: 98320,
    size: "45 GB",
    releaseDate: "2025-09-22",
    developer: "Dark Moon Games",
    screenshots: [
      "https://images.unsplash.com/photo-1762838362179-1718fce76d22?w=800",
      "https://images.unsplash.com/photo-1665083294731-17e98c07e823?w=800",
      "https://images.unsplash.com/photo-1705105238704-a62b18e1b985?w=800"
    ],
    systemRequirements: {
      minimum: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i5-6600K or AMD Ryzen 5 1600",
        memory: "8 GB RAM",
        graphics: "NVIDIA GTX 970 or AMD RX 580",
        storage: "50 GB available space"
      },
      recommended: {
        os: "Windows 11 64-bit",
        processor: "Intel Core i7-8700K or AMD Ryzen 5 3600",
        memory: "16 GB RAM",
        graphics: "NVIDIA RTX 2060 or AMD RX 5700",
        storage: "50 GB SSD"
      }
    },
    featured: true,
    trending: true,
    downloadLink: "https://example.com/download/shadow-realm",
    comments: [
      { id: "c3", user: "RPGFan92", text: "The story is incredible, 100+ hours of gameplay!", rating: 5, date: "2026-03-11" }
    ]
  },
  {
    id: "3",
    title: "Velocity Overdrive",
    cover: "https://images.unsplash.com/photo-1758403997877-dd1f5e8db90f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyYWNpbmclMjBjYXIlMjBuaWdodHxlbnwxfHx8fDE3NzM1NTUzNTl8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Hit the streets in the ultimate illegal street racing experience. Customize your ride, dominate the night, and become the king of the underground racing scene.",
    category: "Racing",
    rating: 4.4,
    downloads: 87650,
    size: "35 GB",
    releaseDate: "2026-01-08",
    developer: "Speed Demons Inc",
    screenshots: [
      "https://images.unsplash.com/photo-1758403997877-dd1f5e8db90f?w=800",
      "https://images.unsplash.com/photo-1772926390243-7acb97ff34f1?w=800"
    ],
    systemRequirements: {
      minimum: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i5-4460 or AMD FX-6300",
        memory: "8 GB RAM",
        graphics: "NVIDIA GTX 760 or AMD R9 270X",
        storage: "40 GB available space"
      },
      recommended: {
        os: "Windows 11 64-bit",
        processor: "Intel Core i7-6700K or AMD Ryzen 5 2600",
        memory: "16 GB RAM",
        graphics: "NVIDIA GTX 1070 or AMD RX Vega 56",
        storage: "40 GB SSD"
      }
    },
    featured: false,
    trending: true,
    downloadLink: "https://example.com/download/velocity",
    trailer: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    comments: []
  },
  {
    id: "4",
    title: "Dead Zone Survival",
    cover: "https://images.unsplash.com/photo-1699291534298-100b5c805542?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXJ2aXZhbCUyMGhvcnJvciUyMHpvbWJpZXxlbnwxfHx8fDE3NzM1NTUzNjB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Survive the zombie apocalypse in this intense survival horror game. Scavenge for resources, build shelter, and fight off hordes of the undead in a post-apocalyptic world.",
    category: "Survival",
    rating: 4.7,
    downloads: 156200,
    size: "28 GB",
    releaseDate: "2025-06-30",
    developer: "Apocalypse Studios",
    screenshots: [
      "https://images.unsplash.com/photo-1699291534298-100b5c805542?w=800"
    ],
    systemRequirements: {
      minimum: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i5-7500 or AMD Ryzen 3 1200",
        memory: "8 GB RAM",
        graphics: "NVIDIA GTX 1050 Ti or AMD RX 560",
        storage: "30 GB available space"
      },
      recommended: {
        os: "Windows 11 64-bit",
        processor: "Intel Core i7-8700 or AMD Ryzen 5 3600",
        memory: "16 GB RAM",
        graphics: "NVIDIA GTX 1660 or AMD RX 5600 XT",
        storage: "30 GB SSD"
      }
    },
    featured: true,
    trending: false,
    downloadLink: "https://example.com/download/dead-zone",
    trailer: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    comments: [
      { id: "c4", user: "HorrorFan", text: "Scary and addictive!", rating: 5, date: "2026-03-09" },
      { id: "c5", user: "Survivor101", text: "Best zombie game I've played", rating: 4, date: "2026-03-13" }
    ]
  },
  {
    id: "5",
    title: "Mountain Quest",
    cover: "https://images.unsplash.com/photo-1673505413397-0cd0dc4f5854?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHZlbnR1cmUlMjBtb3VudGFpbiUyMGxhbmRzY2FwZXxlbnwxfHx8fDE3NzM1NTUzNjB8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Explore breathtaking mountain landscapes in this open-world adventure. Climb peaks, discover hidden treasures, and experience the beauty of nature like never before.",
    category: "Adventure",
    rating: 4.5,
    downloads: 72400,
    size: "52 GB",
    releaseDate: "2025-12-12",
    developer: "Peak Entertainment",
    screenshots: [
      "https://images.unsplash.com/photo-1673505413397-0cd0dc4f5854?w=800"
    ],
    systemRequirements: {
      minimum: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i5-6600K or AMD Ryzen 5 1600",
        memory: "8 GB RAM",
        graphics: "NVIDIA GTX 1060 or AMD RX 580",
        storage: "55 GB available space"
      },
      recommended: {
        os: "Windows 11 64-bit",
        processor: "Intel Core i7-9700K or AMD Ryzen 7 3700X",
        memory: "16 GB RAM",
        graphics: "NVIDIA RTX 2070 or AMD RX 5700 XT",
        storage: "55 GB SSD"
      }
    },
    featured: false,
    trending: true,
    downloadLink: "https://example.com/download/mountain-quest",
    comments: []
  },
  {
    id: "6",
    title: "Stellar Combat",
    cover: "https://images.unsplash.com/photo-1531812494838-636e337af5a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGFjZSUyMHNob290ZXIlMjBnYW1lfGVufDF8fHx8MTc3MzU1NTM2MHww&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Take to the stars in this fast-paced space shooter. Engage in epic dogfights, explore alien worlds, and save humanity from extraterrestrial threats.",
    category: "Action",
    rating: 4.3,
    downloads: 65890,
    size: "38 GB",
    releaseDate: "2025-08-18",
    developer: "Cosmos Games",
    screenshots: [
      "https://images.unsplash.com/photo-1531812494838-636e337af5a6?w=800"
    ],
    systemRequirements: {
      minimum: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i5-4670K or AMD FX-8350",
        memory: "8 GB RAM",
        graphics: "NVIDIA GTX 960 or AMD R9 290",
        storage: "40 GB available space"
      },
      recommended: {
        os: "Windows 11 64-bit",
        processor: "Intel Core i7-7700K or AMD Ryzen 5 2600X",
        memory: "16 GB RAM",
        graphics: "NVIDIA GTX 1070 Ti or AMD RX Vega 64",
        storage: "40 GB SSD"
      }
    },
    featured: false,
    trending: false,
    downloadLink: "https://example.com/download/stellar-combat",
    comments: [
      { id: "c6", user: "SpaceAce", text: "Amazing space battles!", rating: 4, date: "2026-03-08" }
    ]
  },
  {
    id: "7",
    title: "Kingdom of Legends",
    cover: "https://images.unsplash.com/photo-1665083294731-17e98c07e823?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpZXZhbCUyMHJwZyUyMGNhc3RsZXxlbnwxfHx8fDE3NzM1NTUzNjF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Build your medieval empire, wage war against rival kingdoms, and become the legendary ruler of the realm. A massive strategy RPG with endless possibilities.",
    category: "RPG",
    rating: 4.9,
    downloads: 203500,
    size: "42 GB",
    releaseDate: "2024-04-25",
    developer: "Royal Games Studio",
    screenshots: [
      "https://images.unsplash.com/photo-1665083294731-17e98c07e823?w=800"
    ],
    systemRequirements: {
      minimum: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i5-6600 or AMD Ryzen 3 1300X",
        memory: "8 GB RAM",
        graphics: "NVIDIA GTX 1050 or AMD RX 560",
        storage: "45 GB available space"
      },
      recommended: {
        os: "Windows 11 64-bit",
        processor: "Intel Core i7-8700 or AMD Ryzen 5 3600",
        memory: "16 GB RAM",
        graphics: "NVIDIA GTX 1660 Ti or AMD RX 5600 XT",
        storage: "45 GB SSD"
      }
    },
    featured: true,
    trending: true,
    downloadLink: "https://example.com/download/kingdom-legends",
    comments: [
      { id: "c7", user: "StrategyKing", text: "Best strategy game of the year!", rating: 5, date: "2026-03-14" }
    ]
  },
  {
    id: "8",
    title: "Battle Royale Arena",
    cover: "https://images.unsplash.com/photo-1764011643213-1f3b3691f678?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXR0bGUlMjByb3lhbGUlMjBhY3Rpb258ZW58MXx8fHwxNzczNTU1MzYxfDA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Drop into the arena and fight to be the last one standing. 100 players, one winner. Fast-paced battle royale action with intense gunplay and strategic gameplay.",
    category: "Action",
    rating: 4.6,
    downloads: 342000,
    size: "48 GB",
    releaseDate: "2025-03-15",
    developer: "Arena Games",
    screenshots: [
      "https://images.unsplash.com/photo-1764011643213-1f3b3691f678?w=800"
    ],
    systemRequirements: {
      minimum: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i5-7400 or AMD Ryzen 5 1500X",
        memory: "8 GB RAM",
        graphics: "NVIDIA GTX 1050 Ti or AMD RX 570",
        storage: "50 GB available space"
      },
      recommended: {
        os: "Windows 11 64-bit",
        processor: "Intel Core i7-8700K or AMD Ryzen 7 2700X",
        memory: "16 GB RAM",
        graphics: "NVIDIA RTX 2060 or AMD RX 5700",
        storage: "50 GB SSD"
      }
    },
    featured: false,
    trending: true,
    downloadLink: "https://example.com/download/battle-royale",
    comments: []
  },
  {
    id: "9",
    title: "Shadow Assassin",
    cover: "https://images.unsplash.com/photo-1705105238704-a62b18e1b985?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdGVhbHRoJTIwbmluamElMjBnYW1lfGVufDF8fHx8MTc3MzU1NTM2Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Master the art of stealth in this tactical action game. Eliminate targets, remain unseen, and complete impossible missions as the world's deadliest assassin.",
    category: "Action",
    rating: 4.7,
    downloads: 118900,
    size: "32 GB",
    releaseDate: "2025-10-05",
    developer: "Stealth Works",
    screenshots: [
      "https://images.unsplash.com/photo-1705105238704-a62b18e1b985?w=800"
    ],
    systemRequirements: {
      minimum: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i5-6500 or AMD Ryzen 3 1200",
        memory: "8 GB RAM",
        graphics: "NVIDIA GTX 960 or AMD RX 470",
        storage: "35 GB available space"
      },
      recommended: {
        os: "Windows 11 64-bit",
        processor: "Intel Core i7-7700 or AMD Ryzen 5 2600",
        memory: "16 GB RAM",
        graphics: "NVIDIA GTX 1060 or AMD RX 580",
        storage: "35 GB SSD"
      }
    },
    featured: false,
    trending: false,
    downloadLink: "https://example.com/download/shadow-assassin",
    comments: [
      { id: "c8", user: "StealthMaster", text: "Perfect stealth mechanics!", rating: 5, date: "2026-03-10" }
    ]
  },
  {
    id: "10",
    title: "Neon City Chronicles",
    cover: "https://images.unsplash.com/photo-1772926390243-7acb97ff34f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdXR1cmlzdGljJTIwY2l0eSUyMGdhbWluZ3xlbnwxfHx8fDE3NzM1NTUzNjJ8MA&ixlib=rb-4.1.0&q=80&w=1080",
    description: "Explore a vibrant futuristic metropolis filled with secrets, danger, and opportunity. An open-world adventure set in a stunning neon-lit cityscape.",
    category: "Adventure",
    rating: 4.8,
    downloads: 145600,
    size: "58 GB",
    releaseDate: "2026-02-20",
    developer: "Future City Games",
    screenshots: [
      "https://images.unsplash.com/photo-1772926390243-7acb97ff34f1?w=800"
    ],
    systemRequirements: {
      minimum: {
        os: "Windows 10 64-bit",
        processor: "Intel Core i5-8400 or AMD Ryzen 5 2600",
        memory: "12 GB RAM",
        graphics: "NVIDIA GTX 1060 or AMD RX 580",
        storage: "60 GB available space"
      },
      recommended: {
        os: "Windows 11 64-bit",
        processor: "Intel Core i7-9700K or AMD Ryzen 7 3700X",
        memory: "16 GB RAM",
        graphics: "NVIDIA RTX 2070 Super or AMD RX 5700 XT",
        storage: "60 GB SSD"
      }
    },
    featured: true,
    trending: true,
    downloadLink: "https://example.com/download/neon-city",
    comments: [
      { id: "c9", user: "CityExplorer", text: "The world is so alive and detailed!", rating: 5, date: "2026-03-15" }
    ]
  }
];

export const categories = ["All", "Action", "Adventure", "Racing", "RPG", "Survival"];
