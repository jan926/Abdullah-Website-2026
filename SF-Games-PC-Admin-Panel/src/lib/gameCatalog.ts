/** Live catalog — 400+ PC games from FreeToGame API (cached after first use). */
export type CatalogGame = {
  id: number;
  title: string;
  developer: string;
  publisher: string;
  genre: string;
  release_date: string;
  short_description: string;
  thumbnail?: string;
};

let catalogCache: CatalogGame[] | null = null;
let catalogLoading: Promise<CatalogGame[]> | null = null;

async function loadCatalog(): Promise<CatalogGame[]> {
  if (catalogCache) return catalogCache;
  if (catalogLoading) return catalogLoading;

  catalogLoading = fetch("https://www.freetogame.com/api/games")
    .then((r) => (r.ok ? r.json() : []))
    .then((data) => {
      catalogCache = Array.isArray(data) ? data : [];
      return catalogCache;
    })
    .catch(() => {
      catalogCache = [];
      return [];
    })
    .finally(() => {
      catalogLoading = null;
    });

  return catalogLoading;
}

function scoreMatch(query: string, title: string): number {
  const q = query.toLowerCase().trim();
  const t = title.toLowerCase().trim();
  if (t === q) return 100;
  if (t.startsWith(q) || q.startsWith(t)) return 80;
  if (t.includes(q) || q.includes(t)) return 60;
  const qWords = q.split(/\s+/).filter(Boolean);
  const matched = qWords.filter((w) => t.includes(w)).length;
  return (matched / Math.max(qWords.length, 1)) * 50;
}

export async function searchGameCatalog(title: string): Promise<CatalogGame | null> {
  const list = await loadCatalog();
  if (!list.length) return null;

  let best: CatalogGame | null = null;
  let bestScore = 0;
  for (const game of list) {
    const s = scoreMatch(title, game.title);
    if (s > bestScore) {
      bestScore = s;
      best = game;
    }
  }
  return bestScore >= 45 ? best : null;
}

export async function getCatalogSize(): Promise<number> {
  const list = await loadCatalog();
  return list.length;
}
