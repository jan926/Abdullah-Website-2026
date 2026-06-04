/**
 * Merge games-batch-a.ts and games-batch-b.ts into games.ts.
 * Extracts the object literals from each batch, appends them to gamesData,
 * updates the categories export, then deletes the temp batch files.
 */
import { readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dir, "../src/app/data");

const read = (name) => readFileSync(resolve(dataDir, name), "utf8");

// Extract the raw game-object block from a batch file.
// The batch files look like:
//   import type { Game } from "./games";
//   export const gamesBatchX: Partial<Game>[] = [
//     { id: "11", ... },
//     ...
//   ];
// We want everything between the opening `[` and the closing `];`.
function extractObjects(src) {
  const start = src.indexOf("[") + 1; // after the `[`
  const end = src.lastIndexOf("]");    // before the `]`
  return src.slice(start, end).trim();
}

const batchAObjs = extractObjects(read("games-batch-a.ts"));
const batchBObjs = extractObjects(read("games-batch-b.ts"));

// The block we are replacing at the end of games.ts
const ANCHOR =
  `      { id: "c9", user: "CityExplorer", text: "The world is so alive and detailed!", rating: 5, date: "2026-03-15" }
    ]
  }
];

export const categories = ["All", "Action", "Adventure", "Racing", "RPG", "Survival"];`;

const REPLACEMENT =
  `      { id: "c9", user: "CityExplorer", text: "The world is so alive and detailed!", rating: 5, date: "2026-03-15" }
    ]
  },

  // ── Steam Popular Games (IDs 11-46) ──────────────────────────────────────
${batchAObjs},

  // ── More Steam + Ubisoft Games (IDs 47-82) ───────────────────────────────
${batchBObjs}
];

export const categories = [
  "All",
  "Action",
  "Adventure",
  "Racing",
  "RPG",
  "Survival",
  "Horror",
  "Sports",
  "Fighting",
  "Strategy",
  "Simulation",
  "Simulation",
  "Multiplayer",
];`;

const gamesTs = read("games.ts");

if (!gamesTs.includes(ANCHOR)) {
  console.error("ERROR: Anchor text not found in games.ts — aborting.");
  process.exit(1);
}

const merged = gamesTs.replace(ANCHOR, REPLACEMENT);
writeFileSync(resolve(dataDir, "games.ts"), merged, "utf8");
console.log("✓ games.ts updated");

// Clean up temp batch files
unlinkSync(resolve(dataDir, "games-batch-a.ts"));
unlinkSync(resolve(dataDir, "games-batch-b.ts"));
console.log("✓ Temp batch files deleted");
console.log("Done — games.ts now contains all 82 game entries.");
