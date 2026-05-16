import { gamesData, Game, categories as defaultCategories } from "../app/data/games";
import { requireSupabase, isSupabaseConfigured } from "./supabaseClient";

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

export interface SiteAnalytics {
  totalPageViews: number;
  lastUpdated: string;
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

const defaultAnalytics = (): SiteAnalytics => ({
  totalPageViews: 0,
  lastUpdated: new Date().toISOString(),
});

const safeLocalStorage = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

// --- localStorage fallback (offline / missing env) ---

const loadGamesLocal = (): Game[] => {
  const storage = safeLocalStorage();
  if (!storage) return gamesData;
  const raw = storage.getItem(GAMES_KEY);
  if (!raw) {
    storage.setItem(GAMES_KEY, JSON.stringify(gamesData));
    return gamesData;
  }
  try {
    const parsed = JSON.parse(raw) as Game[];
    return Array.isArray(parsed) ? parsed : gamesData;
  } catch {
    return gamesData;
  }
};

const saveGamesLocal = (games: Game[]) => {
  safeLocalStorage()?.setItem(GAMES_KEY, JSON.stringify(games));
};

const loadSiteSettingsLocal = (): SiteSettings => {
  const storage = safeLocalStorage();
  if (!storage) return defaultSettings;
  const raw = storage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;
  try {
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
};

const saveSiteSettingsLocal = (settings: SiteSettings) => {
  safeLocalStorage()?.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

const loadSiteAnalyticsLocal = (): SiteAnalytics => {
  const storage = safeLocalStorage();
  if (!storage) return defaultAnalytics();
  const raw = storage.getItem(ANALYTICS_KEY);
  if (!raw) return defaultAnalytics();
  try {
    return { ...defaultAnalytics(), ...JSON.parse(raw) };
  } catch {
    return defaultAnalytics();
  }
};

const saveSiteAnalyticsLocal = (analytics: SiteAnalytics) => {
  safeLocalStorage()?.setItem(ANALYTICS_KEY, JSON.stringify(analytics));
};

const loadCategoriesLocal = (): string[] => {
  const storage = safeLocalStorage();
  if (!storage) return defaultCategories;
  const raw = storage.getItem(CATEGORIES_KEY);
  if (!raw) return defaultCategories;
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : defaultCategories;
  } catch {
    return defaultCategories;
  }
};

const saveCategoriesLocal = (cats: string[]) => {
  safeLocalStorage()?.setItem(CATEGORIES_KEY, JSON.stringify(cats));
};

// --- Supabase helpers ---

type GameRow = { id: string; payload: Game };
type ConfigRow = { id: string; payload: unknown };

const rowToGame = (row: GameRow): Game => row.payload;

const seedDatabaseIfEmpty = async () => {
  const client = requireSupabase();
  const { count, error: countError } = await client
    .from("games")
    .select("*", { count: "exact", head: true });

  if (countError) throw countError;
  if (count && count > 0) return;

  const rows = gamesData.map((game) => ({
    id: game.id,
    payload: game,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await client.from("games").insert(rows);
  if (error) throw error;

  await client.from("site_config").upsert([
    { id: "settings", payload: defaultSettings, updated_at: new Date().toISOString() },
    { id: "categories", payload: defaultCategories, updated_at: new Date().toISOString() },
    { id: "analytics", payload: defaultAnalytics(), updated_at: new Date().toISOString() },
  ]);
};

const getConfigPayload = async <T>(key: string, fallback: T): Promise<T> => {
  const client = requireSupabase();
  const { data, error } = await client
    .from("site_config")
    .select("payload")
    .eq("id", key)
    .maybeSingle();

  if (error) throw error;
  if (!data?.payload) return fallback;
  return data.payload as T;
};

const setConfigPayload = async <T>(key: string, payload: T) => {
  const client = requireSupabase();
  const { error } = await client.from("site_config").upsert({
    id: key,
    payload,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
};

// --- Public API ---

export const loadGames = async (): Promise<Game[]> => {
  if (!isSupabaseConfigured) return loadGamesLocal();

  const client = requireSupabase();
  await seedDatabaseIfEmpty();

  const { data, error } = await client
    .from("games")
    .select("id, payload")
    .order("updated_at", { ascending: false });

  if (error) throw error;
  const games = (data as GameRow[]).map(rowToGame);
  saveGamesLocal(games);
  return games;
};

export const saveGames = async (games: Game[]) => {
  if (!isSupabaseConfigured) {
    saveGamesLocal(games);
    return;
  }

  const client = requireSupabase();
  const now = new Date().toISOString();
  const rows = games.map((game) => ({
    id: game.id,
    payload: game,
    updated_at: now,
  }));

  const { data: existing, error: fetchError } = await client.from("games").select("id");
  if (fetchError) throw fetchError;

  const newIds = new Set(games.map((g) => g.id));
  const toDelete = (existing ?? []).map((r) => r.id).filter((id) => !newIds.has(id));

  if (toDelete.length > 0) {
    const { error: deleteError } = await client.from("games").delete().in("id", toDelete);
    if (deleteError) throw deleteError;
  }

  if (rows.length > 0) {
    const { error: upsertError } = await client.from("games").upsert(rows);
    if (upsertError) throw upsertError;
  }

  saveGamesLocal(games);
};

export const getGameById = async (id: string): Promise<Game | undefined> => {
  const games = await loadGames();
  return games.find((game) => game.id === id);
};

export const loadSiteSettings = async (): Promise<SiteSettings> => {
  if (!isSupabaseConfigured) return loadSiteSettingsLocal();

  await seedDatabaseIfEmpty();
  const settings = await getConfigPayload("settings", defaultSettings);
  saveSiteSettingsLocal(settings);
  return { ...defaultSettings, ...settings };
};

export const saveSiteSettings = async (settings: SiteSettings) => {
  if (!isSupabaseConfigured) {
    saveSiteSettingsLocal(settings);
    return;
  }
  await setConfigPayload("settings", settings);
  saveSiteSettingsLocal(settings);
};

export const loadSiteAnalytics = async (): Promise<SiteAnalytics> => {
  if (!isSupabaseConfigured) return loadSiteAnalyticsLocal();

  await seedDatabaseIfEmpty();
  const analytics = await getConfigPayload("analytics", defaultAnalytics());
  saveSiteAnalyticsLocal(analytics);
  return analytics;
};

export const saveSiteAnalytics = async (analytics: SiteAnalytics) => {
  if (!isSupabaseConfigured) {
    saveSiteAnalyticsLocal(analytics);
    return;
  }
  await setConfigPayload("analytics", analytics);
  saveSiteAnalyticsLocal(analytics);
};

export const loadCategories = async (): Promise<string[]> => {
  if (!isSupabaseConfigured) return loadCategoriesLocal();

  await seedDatabaseIfEmpty();
  const categories = await getConfigPayload("categories", defaultCategories);
  saveCategoriesLocal(categories);
  return categories;
};

export const saveCategories = async (cats: string[]) => {
  if (!isSupabaseConfigured) {
    saveCategoriesLocal(cats);
    return;
  }
  await setConfigPayload("categories", cats);
  saveCategoriesLocal(cats);
};

export const incrementGameView = async (id: string): Promise<Game | undefined> => {
  const games = await loadGames();
  const updatedGames = games.map((game) =>
    game.id === id ? { ...game, views: (game.views || 0) + 1 } : game
  );
  await saveGames(updatedGames);
  return updatedGames.find((game) => game.id === id);
};

export const incrementGameDownload = async (id: string): Promise<Game | undefined> => {
  const games = await loadGames();
  const updatedGames = games.map((game) =>
    game.id === id ? { ...game, downloads: (game.downloads || 0) + 1 } : game
  );
  await saveGames(updatedGames);
  return updatedGames.find((game) => game.id === id);
};

export const incrementSiteViews = async (): Promise<SiteAnalytics> => {
  const analytics = await loadSiteAnalytics();
  const updatedAnalytics = {
    ...analytics,
    totalPageViews: analytics.totalPageViews + 1,
    lastUpdated: new Date().toISOString(),
  };
  await saveSiteAnalytics(updatedAnalytics);
  return updatedAnalytics;
};

export const resetGameStorage = async () => {
  if (isSupabaseConfigured) {
    const client = requireSupabase();
    await client.from("games").delete().neq("id", "");
    await client.from("site_config").delete().neq("id", "");
    await seedDatabaseIfEmpty();
  }
  const storage = safeLocalStorage();
  if (!storage) return;
  storage.removeItem(GAMES_KEY);
  storage.removeItem(SETTINGS_KEY);
  storage.removeItem(CATEGORIES_KEY);
  storage.removeItem(ANALYTICS_KEY);
};

/** Subscribe to live DB changes (optional, for open tabs) */
export const subscribeToDataChanges = (onChange: () => void) => {
  if (!isSupabaseConfigured) return () => {};

  const client = requireSupabase();
  const channel = client
    .channel("dyg-sync")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "games" },
      () => onChange()
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "site_config" },
      () => onChange()
    )
    .subscribe();

  return () => {
    client.removeChannel(channel);
  };
};
