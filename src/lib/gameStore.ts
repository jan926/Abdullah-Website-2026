import type { Game } from "../app/data/games";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabase, isSupabaseConfigured } from "./supabaseClient";

export type DatabaseStatus =
  | "ready"
  | "missing_tables"
  | "not_configured"
  | "error";

let databaseStatus: DatabaseStatus = isSupabaseConfigured
  ? "ready"
  : "not_configured";
let dbReadyCache: boolean | null = null;
let gamesMemoryCache: Game[] | null = null;
let gamesMemoryCacheAt = 0;
const GAMES_CACHE_MS = 60_000;

/** Instant read from localStorage (for first paint). */
export const getGamesSync = (): Game[] => loadGamesLocal();

export const getDatabaseStatus = () => databaseStatus;

const isTableMissingError = (error: unknown): boolean => {
  const err = error as { code?: string; message?: string };
  return (
    err?.code === "PGRST205" ||
    err?.message?.includes("Could not find the table") ||
    err?.message?.includes("relation") ||
    false
  );
};

const handleSupabaseError = (error: unknown): never | void => {
  if (isTableMissingError(error)) {
    databaseStatus = "missing_tables";
    return;
  }
  databaseStatus = "error";
  throw error;
};

const GAMES_KEY = "dyg-games-v1";
const SETTINGS_KEY = "dyg-site-settings-v1";
const CATEGORIES_KEY = "dyg-categories-v1";
const ANALYTICS_KEY = "dyg-site-analytics-v1";

const defaultCategories = [
  "All",
  "Action",
  "Adventure",
  "Racing",
  "RPG",
  "Survival",
  "Horror",
  "Sports",
  "Fighting",
  "Strategy",
  "Simulation",
  "Multiplayer",
];

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
  siteName: "AQ Gaming Hub",
  logoUrl: "",
  showLatestGames: true,
  showMostViewed: true,
  showGameOfTheDay: true,
  showTrendingGames: true,
  theme: "dark",
};

const normalizeSiteSettings = (settings: SiteSettings): SiteSettings => ({
  ...settings,
  siteName: ["SF Games PC", "Aq Games"].includes(settings.siteName)
    ? "AQ Gaming Hub"
    : settings.siteName,
});

const defaultAnalytics = (): SiteAnalytics => ({
  totalPageViews: 0,
  lastUpdated: new Date().toISOString(),
});

const safeLocalStorage = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

const loadSeedGames = async (): Promise<Game[]> => {
  const { gamesData } = await import("../app/data/games");
  return gamesData;
};

// --- localStorage fallback (offline / missing env) ---

const loadGamesLocal = (): Game[] => {
  const storage = safeLocalStorage();
  if (!storage) return [];
  const raw = storage.getItem(GAMES_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Game[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveGamesLocal = (games: Game[]) => {
  safeLocalStorage()?.setItem(GAMES_KEY, JSON.stringify(games));
};

const loadGamesLocalWithSeed = async (): Promise<Game[]> => {
  const local = loadGamesLocal();
  if (local.length > 0) return local;

  const seed = await loadSeedGames();
  saveGamesLocal(seed);
  return seed;
};

const loadSiteSettingsLocal = (): SiteSettings => {
  const storage = safeLocalStorage();
  if (!storage) return defaultSettings;
  const raw = storage.getItem(SETTINGS_KEY);
  if (!raw) return defaultSettings;
  try {
    return normalizeSiteSettings({ ...defaultSettings, ...JSON.parse(raw) });
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

const ensureDatabaseReady = async (): Promise<boolean> => {
  if (dbReadyCache === true) return true;
  if (dbReadyCache === false) return false;
  const ok = await seedDatabaseIfEmpty();
  dbReadyCache = ok;
  return ok;
};

const seedDatabaseIfEmpty = async (): Promise<boolean> => {
  const client = await requireSupabase();
  const { count, error: countError } = await client
    .from("games")
    .select("*", { count: "exact", head: true });

  if (countError) {
    handleSupabaseError(countError);
    return false;
  }

  databaseStatus = "ready";

  if (count && count > 0) return true;

  const gamesData = await loadSeedGames();
  const rows = gamesData.map((game) => ({
    id: game.id,
    payload: game,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await client.from("games").insert(rows);
  if (error) {
    handleSupabaseError(error);
    return false;
  }

  const { error: configError } = await client.from("site_config").upsert([
    {
      id: "settings",
      payload: defaultSettings,
      updated_at: new Date().toISOString(),
    },
    {
      id: "categories",
      payload: defaultCategories,
      updated_at: new Date().toISOString(),
    },
    {
      id: "analytics",
      payload: defaultAnalytics(),
      updated_at: new Date().toISOString(),
    },
  ]);

  if (configError) {
    handleSupabaseError(configError);
    return false;
  }

  return true;
};

const getConfigPayload = async <T>(key: string, fallback: T): Promise<T> => {
  const client = await requireSupabase();
  const { data, error } = await client
    .from("site_config")
    .select("payload")
    .eq("id", key)
    .maybeSingle();

  if (error) {
    handleSupabaseError(error);
    return fallback;
  }
  if (!data?.payload) return fallback;
  return data.payload as T;
};

const setConfigPayload = async <T>(key: string, payload: T) => {
  const client = await requireSupabase();
  const { error } = await client.from("site_config").upsert({
    id: key,
    payload,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    handleSupabaseError(error);
    throw new Error("TABLES_MISSING");
  }
};

// --- Public API ---

export const loadGames = async (options?: {
  background?: boolean;
}): Promise<Game[]> => {
  const local = loadGamesLocal();

  if (gamesMemoryCache && Date.now() - gamesMemoryCacheAt < GAMES_CACHE_MS) {
    return gamesMemoryCache;
  }

  if (!isSupabaseConfigured) {
    databaseStatus = "not_configured";
    const fallback = local.length > 0 ? local : await loadGamesLocalWithSeed();
    gamesMemoryCache = fallback;
    gamesMemoryCacheAt = Date.now();
    return fallback;
  }

  if (options?.background && local.length > 0) {
    void loadGames().catch(() => undefined);
    return local;
  }

  try {
    const seeded = await ensureDatabaseReady();
    if (!seeded) {
      const fallback = local.length > 0 ? local : await loadGamesLocalWithSeed();
      gamesMemoryCache = fallback;
      gamesMemoryCacheAt = Date.now();
      return fallback;
    }

    const client = await requireSupabase();
    const { data, error } = await client
      .from("games")
      .select("id, payload")
      .order("updated_at", { ascending: false });

    if (error) {
      handleSupabaseError(error);
      const fallback = local.length > 0 ? local : await loadGamesLocalWithSeed();
      gamesMemoryCache = fallback;
      gamesMemoryCacheAt = Date.now();
      return fallback;
    }

    databaseStatus = "ready";
    const games = (data as GameRow[]).map(rowToGame);
    saveGamesLocal(games);
    gamesMemoryCache = games;
    gamesMemoryCacheAt = Date.now();
    return games;
  } catch (error) {
    if (isTableMissingError(error)) {
      const fallback = local.length > 0 ? local : await loadGamesLocalWithSeed();
      gamesMemoryCache = fallback;
      gamesMemoryCacheAt = Date.now();
      return fallback;
    }
    throw error;
  }
};

export const saveGames = async (games: Game[]) => {
  saveGamesLocal(games);
  gamesMemoryCache = games;
  gamesMemoryCacheAt = Date.now();

  if (!isSupabaseConfigured) return;

  try {
    const seeded = await ensureDatabaseReady();
    if (!seeded) {
      throw new Error("TABLES_MISSING");
    }

    const client = await requireSupabase();
    const now = new Date().toISOString();
    const rows = games.map((game) => ({
      id: game.id,
      payload: game,
      updated_at: now,
    }));

    const { data: existing, error: fetchError } = await client
      .from("games")
      .select("id");
    if (fetchError) {
      handleSupabaseError(fetchError);
      throw new Error("TABLES_MISSING");
    }

    const newIds = new Set(games.map((g) => g.id));
    const toDelete = (existing ?? [])
      .map((r) => r.id)
      .filter((id) => !newIds.has(id));

    if (toDelete.length > 0) {
      const { error: deleteError } = await client
        .from("games")
        .delete()
        .in("id", toDelete);
      if (deleteError) throw deleteError;
    }

    if (rows.length > 0) {
      const { error: upsertError } = await client.from("games").upsert(rows);
      if (upsertError) throw upsertError;
    }

    databaseStatus = "ready";
  } catch (error) {
    if (
      isTableMissingError(error) ||
      (error as Error).message === "TABLES_MISSING"
    ) {
      databaseStatus = "missing_tables";
      throw new Error("TABLES_MISSING");
    }
    throw error;
  }
};

export const getGameById = async (id: string): Promise<Game | undefined> => {
  const games = await loadGames();
  return games.find((game) => game.id === id);
};

export const loadSiteSettings = async (): Promise<SiteSettings> => {
  if (!isSupabaseConfigured) return loadSiteSettingsLocal();

  try {
    const seeded = await ensureDatabaseReady();
    if (!seeded) return loadSiteSettingsLocal();
    const settings = normalizeSiteSettings({
      ...defaultSettings,
      ...(await getConfigPayload("settings", defaultSettings)),
    });
    saveSiteSettingsLocal(settings);
    return settings;
  } catch (error) {
    if (isTableMissingError(error)) return loadSiteSettingsLocal();
    throw error;
  }
};

export const saveSiteSettings = async (settings: SiteSettings) => {
  saveSiteSettingsLocal(settings);
  if (!isSupabaseConfigured) return;

  const seeded = await ensureDatabaseReady();
  if (!seeded) throw new Error("TABLES_MISSING");
  await setConfigPayload("settings", settings);
};

export const loadSiteAnalytics = async (): Promise<SiteAnalytics> => {
  if (!isSupabaseConfigured) return loadSiteAnalyticsLocal();

  try {
    const seeded = await ensureDatabaseReady();
    if (!seeded) return loadSiteAnalyticsLocal();
    const analytics = await getConfigPayload("analytics", defaultAnalytics());
    saveSiteAnalyticsLocal(analytics);
    return analytics;
  } catch (error) {
    if (isTableMissingError(error)) return loadSiteAnalyticsLocal();
    throw error;
  }
};

export const saveSiteAnalytics = async (analytics: SiteAnalytics) => {
  saveSiteAnalyticsLocal(analytics);
  if (!isSupabaseConfigured) return;

  const seeded = await ensureDatabaseReady();
  if (!seeded) throw new Error("TABLES_MISSING");
  await setConfigPayload("analytics", analytics);
};

export const loadCategories = async (): Promise<string[]> => {
  if (!isSupabaseConfigured) return loadCategoriesLocal();

  try {
    const seeded = await ensureDatabaseReady();
    if (!seeded) return loadCategoriesLocal();
    const categories = await getConfigPayload("categories", defaultCategories);
    saveCategoriesLocal(categories);
    return categories;
  } catch (error) {
    if (isTableMissingError(error)) return loadCategoriesLocal();
    throw error;
  }
};

export const saveCategories = async (cats: string[]) => {
  saveCategoriesLocal(cats);
  if (!isSupabaseConfigured) return;

  const seeded = await ensureDatabaseReady();
  if (!seeded) throw new Error("TABLES_MISSING");
  await setConfigPayload("categories", cats);
};

export const incrementGameView = async (
  id: string,
): Promise<Game | undefined> => {
  const games = await loadGames();
  const updatedGames = games.map((game) =>
    game.id === id ? { ...game, views: (game.views || 0) + 1 } : game,
  );
  await saveGames(updatedGames);
  return updatedGames.find((game) => game.id === id);
};

export const incrementGameDownload = async (
  id: string,
): Promise<Game | undefined> => {
  const games = await loadGames();
  const updatedGames = games.map((game) =>
    game.id === id ? { ...game, downloads: (game.downloads || 0) + 1 } : game,
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
    const client = await requireSupabase();
    await client.from("games").delete().neq("id", "");
    await client.from("site_config").delete().neq("id", "");
    await ensureDatabaseReady();
    dbReadyCache = null;
    gamesMemoryCache = null;
  }
  const storage = safeLocalStorage();
  if (!storage) return;
  storage.removeItem(GAMES_KEY);
  storage.removeItem(SETTINGS_KEY);
  storage.removeItem(CATEGORIES_KEY);
  storage.removeItem(ANALYTICS_KEY);
};

/**
 * Optimised home-page loader.
 *
 * Priority chain:
 *   1. In-memory cache (instant, 60 s TTL)
 *   2. /api/games — CDN-cached Vercel edge route (s-maxage=60, stale-while-revalidate=300)
 *      Avoids the expensive `ensureDatabaseReady()` seeding check for every visitor.
 *   3. Direct Supabase via loadGames() — full fallback
 */
export const loadGamesHome = async (): Promise<Game[]> => {
  // 1. In-memory cache
  if (gamesMemoryCache && Date.now() - gamesMemoryCacheAt < GAMES_CACHE_MS) {
    return gamesMemoryCache;
  }

  // 2. CDN-cached API route (only when Supabase is configured)
  if (isSupabaseConfigured) {
    try {
      const controller = new AbortController();
      const tid = setTimeout(() => controller.abort(), 5_000);

      const res = await fetch("/api/games", { signal: controller.signal });
      clearTimeout(tid);

      if (res.ok) {
        const body = (await res.json()) as { games: Game[] };
        if (Array.isArray(body.games) && body.games.length > 0) {
          saveGamesLocal(body.games);
          gamesMemoryCache = body.games;
          gamesMemoryCacheAt = Date.now();
          databaseStatus = "ready";
          return body.games;
        }
      }
    } catch {
      // Timeout, network error, or bad JSON — fall through to direct Supabase
    }
  }

  // 3. Direct Supabase fallback
  return loadGames();
};

/** Subscribe to live DB changes (optional, for open tabs) */
export const subscribeToDataChanges = (onChange: () => void) => {
  if (!isSupabaseConfigured || databaseStatus === "missing_tables")
    return () => {};

  let disposed = false;
  let channel: ReturnType<SupabaseClient["channel"]> | null = null;
  let client: SupabaseClient | null = null;

  requireSupabase()
    .then((loadedClient) => {
      if (disposed) return;
      client = loadedClient;
      channel = loadedClient
        .channel("dyg-sync")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "games" },
          () => onChange(),
        )
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "site_config" },
          () => onChange(),
        )
        .subscribe();
    })
    .catch(() => undefined);

  return () => {
    disposed = true;
    if (client && channel) {
      client.removeChannel(channel);
    }
  };
};
