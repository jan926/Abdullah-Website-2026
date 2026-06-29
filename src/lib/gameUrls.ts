import type { Game } from "../app/data/games";

export const slugifyGameTitle = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const buildGameSlug = (game: Pick<Game, "id" | "title">) => {
  const titleSlug = slugifyGameTitle(game.title) || "game";
  const idSlug = slugifyGameTitle(game.id);

  if (idSlug === titleSlug || idSlug.startsWith(`${titleSlug}-`)) {
    return idSlug;
  }

  return titleSlug;
};

export const getGamePath = (game: Pick<Game, "id" | "title">) =>
  `/game/${buildGameSlug(game)}`;

export const getGameUrl = (game: Pick<Game, "id" | "title">, siteUrl: string) =>
  `${siteUrl.replace(/\/$/, "")}${getGamePath(game)}`;

export const findGameByRouteParam = <T extends Pick<Game, "id" | "title">>(
  games: T[],
  routeParam?: string,
) => {
  if (!routeParam) return undefined;

  const decoded = decodeURIComponent(routeParam).toLowerCase();
  return games.find((game) => {
    const id = game.id.toLowerCase();
    const idSlug = slugifyGameTitle(game.id);
    const titleSlug = slugifyGameTitle(game.title);
    return (
      decoded === id ||
      decoded === idSlug ||
      decoded === titleSlug ||
      decoded === buildGameSlug(game) ||
      decoded.endsWith(`-${id}`)
    );
  });
};

export const buildUniqueGameId = (
  title: string,
  existingGames: Array<Pick<Game, "id" | "title">>,
  currentId?: string,
) => {
  const base = slugifyGameTitle(title) || "game";
  const used = new Set(
    existingGames
      .filter((game) => game.id !== currentId)
      .flatMap((game) => [
        game.id.toLowerCase(),
        slugifyGameTitle(game.id),
        buildGameSlug(game),
      ]),
  );

  if (!used.has(base)) return base;

  let suffix = 2;
  while (used.has(`${base}-${suffix}`)) {
    suffix += 1;
  }

  return `${base}-${suffix}`;
};
