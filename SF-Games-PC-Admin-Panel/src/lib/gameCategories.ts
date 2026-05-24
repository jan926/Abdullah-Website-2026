import type { Game } from "../app/data/games";

/** All categories assigned to a game (supports legacy single `category` field). */
export function getGameCategories(game: Game): string[] {
  if (game.categories?.length) {
    return game.categories.filter(Boolean);
  }
  return game.category ? [game.category] : [];
}

export function getPrimaryCategory(game: Game): string {
  return getGameCategories(game)[0] || game.category || "Uncategorized";
}

export function gameHasCategory(game: Game, categoryName: string): boolean {
  const needle = categoryName.toLowerCase();
  return getGameCategories(game).some((c) => c.toLowerCase() === needle);
}

export function formatCategoryList(game: Game): string {
  return getGameCategories(game).join(", ");
}
