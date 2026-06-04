import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const file = resolve(dirname(fileURLToPath(import.meta.url)), "../src/app/data/games.ts");
let s = readFileSync(file, "utf8");

// The problem: gamesData array closes with "    ];;", needs to be "];"
// Also the extra indentation is wrong. The structure should be:
// ...last game...
//   },
// ];
//
// export const categories = [

s = s.replace("      },\n    ];;\n", "  },\n];\n\n");

writeFileSync(file, s, "utf8");
console.log("Fixed.");
