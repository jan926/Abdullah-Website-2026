import { gamesData, Game, categories as defaultCategories } from "../app/data/games";

const GAMES_KEY = "dyg-games-v1";
const SETTINGS_KEY = "dyg-site-settings-v1";
const CATEGORIES_KEY = "dyg-categories-v1";
const ANALYTICS_KEY = "dyg-site-analytics-v1";

export interface SiteSettings {
  siteName: string;
  logoUrl: string;
  showLatestGames: boolean;
  showMostViewed: boolean;
  showGameOfTheDay: boolean;
  showTrendingGames: boolean;
  theme: "light" | "dark";
}

const defaultSettings: SiteSettings = {
  siteName: "Download Your Games",
  logoUrl: "",
  showLatestGames: true,
  showMostViewed: true,
  showGameOfTheDay: true,
  showTrendingGames: true,
  theme: "dark",
};

const safeLocalStorage = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

export const loadGames = (): Game[] => {
  const storage = safeLocalStorage();
  if (!storage) return gamesData;

  const raw = storage.getItem(GAMES_KEY);
  if (!raw) {
    storage.setItem(GAMES_KEY, JSON.stringify(gamesData));
    return gamesData;
  }

  try {
    const parsed = JSON.parse(raw) as Game[];
    if (!Array.isArray(parsed)) throw new Error("Invalid games payload");
    return parsed;
  } catch (error) {
    console.error("Failed to parse game storage, resetting to defaults.", error);
    storage.setItem(GAMES_KEY, JSON.stringify(gamesData));
    return gamesData;
  }
};

export const saveGames = (games: Game[]) => {
  const storage = safeLocalStorage();
  if (!storage) return;
  storage.setItem(GAMES_KEY, JSON.stringify(games));
};

export const getGameById = (id: string): Game | undefined => {
  return loadGames().find((game) => game.id === id);
};

export const loadSiteSettings = (): SiteSettings => {
  const storage = safeLocalStorage();
  if (!storage) return defaultSettings;

  const raw = storage.getItem(SETTINGS_KEY);
  if (!raw) {
    storage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  try {
    const parsed = JSON.parse(raw) as SiteSettings;
    return { ...defaultSettings, ...parsed };
  } catch (error) {
    console.error("Failed to parse settings storage, resetting to defaults.", error);
    storage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
    return defaultSettings;
  }
};

export interface SiteAnalytics {
  totalPageViews: number;
  lastUpdated: string;
}

export const saveSiteSettings = (settings: SiteSettings) => {
  const storage = safeLocalStorage();
  if (!storage) return;
  storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const loadSiteAnalytics = (): SiteAnalytics => {
  const storage = safeLocalStorage();
  if (!storage) return { totalPageViews: 0, lastUpdated: new Date().toISOString() };

  const raw = storage.getItem(ANALYTICS_KEY);
  if (!raw) {
    const defaultAnalytics = { totalPageViews: 0, lastUpdated: new Date().toISOString() };
    storage.setItem(ANALYTICS_KEY, JSON.stringify(defaultAnalytics));
    return defaultAnalytics;
  }

  try {
    const parsed = JSON.parse(raw) as SiteAnalytics;
    return { totalPageViews: 0, lastUpdated: new Date().toISOString(), ...parsed };
  } catch (error) {
    console.error("Failed to parse analytics storage, resetting to defaults.", error);
    const defaultAnalytics = { totalPageViews: 0, lastUpdated: new Date().toISOString() };
    storage.setItem(ANALYTICS_KEY, JSON.stringify(defaultAnalytics));
    return defaultAnalytics;
  }
};

export const saveSiteAnalytics = (analytics: SiteAnalytics) => {
  const storage = safeLocalStorage();
  if (!storage) return;
  storage.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
};

export const incrementGameView = (id: string) => {
  const games = loadGames();
  const updatedGames = games.map((game) =>
    game.id === id ? { ...game, views: (game.views || 0) + 1 } : game
  );
  saveGames(updatedGames);
  return updatedGames.find((game) => game.id === id);
};

export const incrementGameDownload = (id: string) => {
  const games = loadGames();
  const updatedGames = games.map((game) =>
    game.id === id ? { ...game, downloads: (game.downloads || 0) + 1 } : game
  );
  saveGames(updatedGames);
  return updatedGames.find((game) => game.id === id);
};

export const incrementSiteViews = () => {
  const analytics = loadSiteAnalytics();
  const updatedAnalytics = {
    ...analytics,
    totalPageViews: analytics.totalPageViews + 1,
    lastUpdated: new Date().toISOString(),
  };
  saveSiteAnalytics(updatedAnalytics);
  return updatedAnalytics;
};

export const resetGameStorage = () => {
  const storage = safeLocalStorage();
  if (!storage) return;
  storage.removeItem(GAMES_KEY);
  storage.removeItem(SETTINGS_KEY);
  storage.removeItem(CATEGORIES_KEY);
};

export const loadCategories = (): string[] => {
  const storage = safeLocalStorage();
  if (!storage) return defaultCategories;

  const raw = storage.getItem(CATEGORIES_KEY);
  if (!raw) {
    storage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
    return defaultCategories;
  }

  try {
    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed)) throw new Error("Invalid categories payload");
    return parsed;
  } catch (error) {
    console.error("Failed to parse categories storage, resetting to defaults.", error);
    storage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
    return defaultCategories;
  }
};

export const saveCategories = (cats: string[]) => {
  const storage = safeLocalStorage();
  if (!storage) return;
  storage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
};
