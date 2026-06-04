/**
 * Repairs games.ts after the edit_file tool split the single gamesData array
 * into multiple `] = [` destructuring-assignment fragments.
 *
 * The file currently looks like:
 *
 *   export const gamesData: Game[] = [
 *     ...games 1-10...
 *     // ── Steam Popular Games ──
 *   ] =
 *   [
 *     ...games 11-46...
 *     // ── More Steam + Ubisoft Games ──
 *     ,
 *   ] =
 *     [
 *       ...games 47-82...
 *     },
 *   ];;
 *
 *   export const categories = [...];
 *
 * We need to turn it into:
 *
 *   export const gamesData: Game[] = [
 *     ...games 1-10...
 *
 *     // ── Steam Popular Games (IDs 11-46) ──────────────────────────────────────
 *     ...games 11-46...
 *
 *     // ── More Steam + Ubisoft Games (IDs 47-82) ───────────────────────────────
 *     ...games 47-82...
 *   ];
 *
 *   export const categories = [...];
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const file = resolve(dirname(fileURLToPath(import.meta.url)), "../src/app/data/games.ts");
let s = readFileSync(file, "utf8");

// ── Repair junction 1: between games 10 and 11 ───────────────────────────────
// Pattern (with Windows line endings handled):
//   \n    // ── Steam Popular Games (IDs 11-46) ──...\n  ] =\n  [\n
// Replace with just the comment line (the game objects in both parts stay)
const JUNCTION_1_RE = /(\n    \/\/ ── Steam Popular Games \(IDs 11-46\)[^\n]*\n)  \] =\n  \[\n/;
const REPLACEMENT_1 = "$1";
if (JUNCTION_1_RE.test(s)) {
  s = s.replace(JUNCTION_1_RE, REPLACEMENT_1);
  console.log("✓ Fixed junction 1 (games 10→11)");
} else {
  // Try alternate whitespace
  const alt1 = s.indexOf("  ] =\n  [\n");
  if (alt1 !== -1) {
    s = s.slice(0, alt1) + s.slice(alt1 + "  ] =\n  [\n".length);
    console.log("✓ Fixed junction 1 (alt) at index", alt1);
  } else {
    console.warn("⚠ Junction 1 not found");
  }
}

// ── Repair junction 2: between games 46 and 47 ───────────────────────────────
// Pattern:
//   \n    // ── More Steam + Ubisoft Games (IDs 47-82) ──...\n\n    ,\n  ] =\n    [\n
const JUNCTION_2_RE = /(\n    \/\/ ── More Steam [^\n]*\n)\n    ,\n  \] =\n    \[\n/;
const REPLACEMENT_2 = "$1";
if (JUNCTION_2_RE.test(s)) {
  s = s.replace(JUNCTION_2_RE, REPLACEMENT_2);
  console.log("✓ Fixed junction 2 (games 46→47)");
} else {
  // Try alternate
  const alt2 = s.indexOf("  ] =\n    [\n");
  if (alt2 !== -1) {
    // Remove the stray ",\n" before it too
    const commaIdx = s.lastIndexOf(",\n", alt2);
    if (commaIdx !== -1 && alt2 - commaIdx < 20) {
      s = s.slice(0, commaIdx) + s.slice(alt2 + "  ] =\n    [\n".length);
      console.log("✓ Fixed junction 2 (alt) at index", commaIdx);
    } else {
      s = s.slice(0, alt2) + s.slice(alt2 + "  ] =\n    [\n".length);
      console.log("✓ Fixed junction 2 (alt, no comma) at index", alt2);
    }
  } else {
    console.warn("⚠ Junction 2 not found");
  }
}

// ── Fix the closing of the gamesData array ────────────────────────────────────
// After all games the array should close with "  },\n];\n\n"
// The current state may have "      },\n    ];\n" or similar
const catIdx = s.indexOf("\nexport const categories");
const beforeCat = s.slice(0, catIdx);

// Normalize whatever closing we have before categories
// Find the last `}` that closes the last game, then ensure the array closes with `];\n`
const lastGameClose = beforeCat.lastIndexOf("},");
if (lastGameClose !== -1) {
  const afterLastGame = beforeCat.slice(lastGameClose + 2).trim();
  if (afterLastGame !== "" && afterLastGame !== ";") {
    // There's extra junk after the last `},` — replace it
    s = beforeCat.slice(0, lastGameClose + 2) + "\n];\n\n" + s.slice(catIdx + 1);
    console.log("✓ Fixed array closing");
  } else {
    console.log("✓ Array closing looks OK");
  }
} else {
  console.warn("⚠ Could not locate last game closing },");
}

// ── Fix the gamesData declaration line ───────────────────────────────────────
// Should be: "export const gamesData: Game[] = ["  (no leading space)
s = s.replace(/^ export const gamesData/m, "export const gamesData");
s = s.replace("export const gamesData: Game[] =\n  ([", "export const gamesData: Game[] = [");

writeFileSync(file, s, "utf8");
console.log("✓ Written. Verifying game count...");

const matches = s.match(/^\s+id: "[0-9]+",$/gm);
console.log(`  Game entries found: ${matches?.length ?? 0}`);
