import { Game } from "../data/games";
import { gameHasCategory, getGameCategories } from "./gameCategories";

// Prefer calling server-side proxy at /api/gemini-proxy to keep keys secret.
const CLIENT_GEMINI_URL = (import.meta.env as any).VITE_GEMINI_API_URL || "";

async function callGemini(prompt: string) {
  // Try server-side service-account proxy first
  try {
    const saRes = await fetch("/api/gemini-proxy-sa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (saRes.ok) {
      const saJson = await saRes.json();
      if (saJson?.text) return saJson.text;
      if (saJson?.raw) return saJson.raw;
    }
  } catch (e) {
    // continue to other fallbacks
  }

  // Next try the simple proxy (if present)
  try {
    const proxyRes = await fetch("/api/gemini-proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (proxyRes.ok) {
      const proxyJson = await proxyRes.json();
      if (proxyJson?.text) return proxyJson.text;
      if (proxyJson?.raw) return proxyJson.raw;
    }
  } catch (e) {
    // continue to direct fallback
  }

  // Fallback: call configured client URL directly (requires client key and is less secure)
  if (!CLIENT_GEMINI_URL) return null;
  try {
    const res = await fetch(CLIENT_GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.text || json.output || json.result || null;
  } catch (e) {
    console.warn("Gemini direct call failed:", e);
    return null;
  }
}

// Local heuristic fallbacks (kept for offline/no-key usage)
export const getSearchSuggestions = async (query: string, games: Game[]): Promise<string[]> => {
  if (!query.trim()) return [];
  const remote = await callGemini(`Provide up to 8 short search suggestions for the query: ${query}`);
  if (remote) {
    try {
      const parsed = JSON.parse(remote);
      if (Array.isArray(parsed)) return parsed.slice(0, 8);
    } catch {}
    return remote.split("\n").map(s => s.trim()).filter(Boolean).slice(0, 8);
  }

  const q = query.toLowerCase();
  const suggestions = new Set<string>();
  games.forEach(game => {
    if (game.title.toLowerCase().includes(q)) suggestions.add(game.title);
    if (game.developer.toLowerCase().includes(q)) suggestions.add(game.developer);
  });
  const categories = new Set(games.map(g => g.category));
  categories.forEach(cat => { if (cat.toLowerCase().includes(q)) suggestions.add(cat); });
  return Array.from(suggestions).slice(0, 8);
};

export const getRecommendedGames = async (
  currentGame: Game,
  allGames: Game[],
  limit: number = 4
): Promise<Game[]> => {
  // Try remote recommendation first
  const remote = await callGemini(`Recommend up to ${limit} similar games to: ${currentGame.title}. Return JSON array of game titles.`);
  if (remote) {
    try {
      const parsed = JSON.parse(remote);
      if (Array.isArray(parsed)) {
        const mapped = parsed.map((t: string) => allGames.find(g => g.title === t)).filter(Boolean) as Game[];
        if (mapped.length) return mapped.slice(0, limit);
      }
    } catch {}
  }

  // Fallback heuristic
  const scores: { game: Game; score: number }[] = [];
  allGames.forEach(game => {
    if (game.id === currentGame.id) return;
    let score = 0;
    if (getGameCategories(game).some((c) => getGameCategories(currentGame).includes(c))) score += 100;
    if (Math.abs(game.rating - currentGame.rating) <= 0.5) score += 50;
    if (game.trending) score += 30;
    if (game.featured) score += 20;
    score += (game.downloads / 1000) * 0.5;
    scores.push({ game, score });
  });
  return scores.sort((a, b) => b.score - a.score).slice(0, limit).map(s => s.game);
};

export const smartCategoryFilter = async (
  games: Game[],
  recentlyViewed: string[] = []
): Promise<string[]> => {
  const remote = await callGemini(`Given these game categories and recent views, suggest ordered categories: ${recentlyViewed.join(",")} `);
  if (remote) {
    try {
      const parsed = JSON.parse(remote);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
  }
  const categoryScores: Record<string, number> = {};
  games.forEach(game => {
    if (!categoryScores[game.category]) categoryScores[game.category] = 0;
    categoryScores[game.category] += game.rating * (game.downloads / 1000) * 0.1;
  });
  recentlyViewed.forEach(gameId => {
    const game = games.find(g => g.id === gameId);
    if (game && categoryScores[game.category]) categoryScores[game.category] *= 1.2;
  });
  return Object.entries(categoryScores).sort((a,b)=>b[1]-a[1]).map(([cat])=>cat);
};

export const fuzzySearch = (query: string, games: Game[]): Game[] => {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const scoredGames: { game: Game; score: number }[] = [];

  games.forEach(game => {
    let score = 0;

    // Exact match in title
    if (game.title.toLowerCase() === q) score += 1000;

    // Title starts with query
    if (game.title.toLowerCase().startsWith(q)) score += 500;

    // Title contains query
    if (game.title.toLowerCase().includes(q)) score += 300;

    // Category match
    if (game.category.toLowerCase().includes(q)) score += 200;

    // Developer match
    if (game.developer.toLowerCase().includes(q)) score += 150;

    // Description contains query
    if (game.description.toLowerCase().includes(q)) score += 100;

    if (score > 0) {
      scoredGames.push({ game, score });
    }
  });

  return scoredGames
    .sort((a, b) => b.score - a.score)
    .map(({ game }) => game);
};
