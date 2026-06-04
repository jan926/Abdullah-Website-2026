import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const file = resolve(dirname(fileURLToPath(import.meta.url)), "../src/app/data/games.ts");
let s = readFileSync(file, "utf8");

// Find the closing ]); of the gamesData array (last ]); before "export const categories")
// The file ends with gamesData closing, then categories export
const catIdx = s.lastIndexOf("export const categories");
const gamesEnd = s.lastIndexOf("]", catIdx);

// Check what's around that closing ]
const snippet = s.slice(gamesEnd - 5, gamesEnd + 5);
console.log("Snippet around last ] before categories:", JSON.stringify(snippet));

// Look for ]); or just ] at the end of gamesData
// The gamesData array closes and is followed by the categories export
// We need to find the pattern: closing of the last game object, then ]); or ];
const beforeCat = s.slice(0, catIdx).trimEnd();
console.log("Last 30 chars before categories:", JSON.stringify(beforeCat.slice(-30)));

// Replace the closing ]); or ]); with ];
let fixed = s;
if (beforeCat.endsWith("]);")) {
  const lastIdx = s.lastIndexOf("]);", catIdx);
  fixed = s.slice(0, lastIdx) + "];" + s.slice(lastIdx + 3);
  console.log("Fixed ]); -> ];");
} else if (beforeCat.endsWith("];")) {
  console.log("Already has ]; - no fix needed");
} else {
  console.log("Unexpected ending:", JSON.stringify(beforeCat.slice(-20)));
}

writeFileSync(file, fixed, "utf8");
console.log("Done.");
