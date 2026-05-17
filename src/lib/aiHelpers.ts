import { Game } from "../data/games";
import { gameHasCategory, getGameCategories } from "./gameCategories";

// AI-powered search suggestions using pattern matching
export const getSearchSuggestions = (query: string, games: Game[]): string[] => {
  if (!query.trim()) return [];

  const q = query.toLowerCase();
  const suggestions = new Set<string>();

  // Suggest game titles
  games.forEach(game => {
    if (game.title.toLowerCase().includes(q)) {
      suggestions.add(game.title);
    }
  });

  // Suggest categories
  const categories = new Set(games.map(g => g.category));
  categories.forEach(cat => {
    if (cat.toLowerCase().includes(q)) {
      suggestions.add(cat);
    }
  });

  // Suggest developers
  games.forEach(game => {
    if (game.developer.toLowerCase().includes(q)) {
      suggestions.add(game.developer);
    }
  });

  return Array.from(suggestions).slice(0, 8);
};

// AI-powered game recommendations
export const getRecommendedGames = (
  currentGame: Game,
  allGames: Game[],
  limit: number = 4
): Game[] => {
  const scores: { game: Game; score: number }[] = [];

  allGames.forEach(game => {
    if (game.id === currentGame.id) return;

    let score = 0;

    // Same category (highest priority)
    if (getGameCategories(game).some((c) => getGameCategories(currentGame).includes(c))) score += 100;

    // Similar rating (±0.5)
    if (Math.abs(game.rating - currentGame.rating) <= 0.5) score += 50;

    // Trending/Featured bonus
    if (game.trending) score += 30;
    if (game.featured) score += 20;

    // Higher download count
    score += (game.downloads / 1000) * 0.5;

    scores.push({ game, score });
  });

  return scores
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ game }) => game);
};

// Smart category suggestions based on user viewing patterns
export const smartCategoryFilter = (
  games: Game[],
  recentlyViewed: string[] = []
): string[] => {
  const categoryScores: Record<string, number> = {};

  games.forEach(game => {
    if (!categoryScores[game.category]) {
      categoryScores[game.category] = 0;
    }
    categoryScores[game.category] += game.rating * (game.downloads / 1000) * 0.1;
  });

  // Boost recently viewed categories
  recentlyViewed.forEach(gameId => {
    const game = games.find(g => g.id === gameId);
    if (game && categoryScores[game.category]) {
      categoryScores[game.category] *= 1.2;
    }
  });

  return Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])
    .map(([cat]) => cat);
};

// Quick search filter with fuzzy matching
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
