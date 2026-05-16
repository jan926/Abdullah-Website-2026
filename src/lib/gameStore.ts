import { gamesData, Game, categories as defaultCategories } from "../app/data/games";
import { supabase } from "./supabaseClient";

export interface SiteSettings {
  siteName: string;
  logoUrl: string;
  showLatestGames: boolean;
  showMostViewed: boolean;
  showGameOfTheDay: boolean;
  showTrendingGames: boolean;
  theme: "light" | "dark";
  heroSliderGameIds: string[];
}

const defaultSettings: SiteSettings = {
  siteName: "Download Your Games",
  logoUrl: "",
  showLatestGames: true,
  showMostViewed: true,
  showGameOfTheDay: true,
  showTrendingGames: true,
  theme: "dark",
  heroSliderGameIds: [],
};

export interface SiteAnalytics {
  totalPageViews: number;
  lastUpdated: string;
}

const toJsonbArray = <T,>(v: unknown, fallback: T[] = []): T[] => {
  if (!v) return fallback;
  try {
    return Array.isArray(v) ? (v as T[]) : fallback;
  } catch {
    return fallback;
  }
};

const mapGameRowToGame = (row: any): Game => {
  // Supabase returns snake_case columns exactly as created.
  // Our frontend Game type uses camelCase in places.
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description,
    cover: row.cover,
    heroMedia: row.heroMedia ?? "",
    backgroundImage: row.backgroundImage ?? "",
    size: row.size ?? "",
    developer: row.developer ?? "",
    downloadLink: row.downloadLink ?? "",
    filePassword: row.filePassword ?? "",
    downloadParts: toJsonbArray(row.downloadParts, []),
    trailer: row.trailer ?? "",
    screenshots: toJsonbArray(row.screenshots, []),
    featured: !!row.featured,
    trending: !!row.trending,
    gameOfTheDay: !!row.gameOfTheDay,
    rating: row.rating ?? 0,
    downloads: row.downloads ?? 0,
    views: row.views ?? 0,
    releaseDate: row.releaseDate ?? "",
    systemRequirements: row.systemRequirements ?? { minimum: {}, recommended: {} },
    comments: [], // comments separate table (optional). Frontend currently uses comments from storage only.
  } as Game;
};

// --------------------
// GAMES
// --------------------
export const loadGames = async (): Promise<Game[]> => {
  // App ke code me is function ko sync treat kiya ja raha hai.
  // Isliye browser me data load karne ke liye calling pages me useEffect async add karna padega.
  // Lekin "instant" fallback ke liye we keep default games while fetch in progress.

  // For now: fetch and return.
  const { data, error } = await supabase
    .from("games")
    .select(
      "id,title,category,description,cover,heroMedia,backgroundImage,size,developer,downloadLink,filePassword,downloadParts,trailer,screenshots,systemRequirements,featured,trending,gameOfTheDay,rating,downloads,views,releaseDate"
    )
    .order("releaseDate", { ascending: false });

  if (error) {
    console.error("loadGames error:", error);
    return gamesData;
  }

  return (data ?? []).map(mapGameRowToGame);
};

export const saveGames = async (games: Game[]): Promise<void> => {
  // Upsert all games by primary key id.
  const rows = games.map((g) => ({
    id: g.id,
    title: g.title,
    category: g.category,
    description: g.description,
    cover: g.cover,
    heroMedia: g.heroMedia ?? null,
    backgroundImage: g.backgroundImage ?? null,
    size: g.size ?? null,
    developer: g.developer ?? null,
    downloadLink: g.downloadLink ?? null,
    filePassword: g.filePassword ?? null,
    downloadParts: (g.downloadParts ?? []) as any,
    trailer: g.trailer ?? null,
    screenshots: (g.screenshots ?? []) as any,
    systemRequirements: g.systemRequirements ?? ({ minimum: {}, recommended: {} } as any),
    featured: !!g.featured,
    trending: !!g.trending,
    gameOfTheDay: !!g.gameOfTheDay,
    rating: g.rating ?? 0,
    downloads: g.downloads ?? 0,
    views: g.views ?? 0,
    releaseDate: g.releaseDate ?? null,
  }));

  const { error } = await supabase.from("games").upsert(rows, { onConflict: "id" });
  if (error) console.error("saveGames error:", error);
};

export const getGameById = (id: string): Game | undefined => {
  // Existing synchronous callers rely on local cache.
  // Until pages are updated to await loadGames(), keep returning from static data.
  // If you want fully correct behavior, update callers to use an async fetch.
  return gamesData.find((g) => g.id === id);
};

export const incrementGameView = async (id: string): Promise<Game | undefined> => {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("incrementGameView fetch error:", error);
    return undefined;
  }

  const currentViews = (data?.views ?? 0) as number;
  const newViews = currentViews + 1;

  const { error: upErr } = await supabase.from("games").update({ views: newViews }).eq("id", id);
  if (upErr) console.error("incrementGameView update error:", upErr);

  return data ? mapGameRowToGame({ ...data, views: newViews }) : undefined;
};

export const incrementGameDownload = async (id: string): Promise<Game | undefined> => {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("incrementGameDownload fetch error:", error);
    return undefined;
  }

  const currentDownloads = (data?.downloads ?? 0) as number;
  const newDownloads = currentDownloads + 1;

  const { error: upErr } = await supabase.from("games").update({ downloads: newDownloads }).eq("id", id);
  if (upErr) console.error("incrementGameDownload update error:", upErr);

  return data ? mapGameRowToGame({ ...data, downloads: newDownloads }) : undefined;
};

export const incrementSiteViews = async (): Promise<SiteAnalytics | undefined> => {
  const { data, error } = await supabase
    .from("site_analytics")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    console.error("incrementSiteViews fetch error:", error);
    return undefined;
  }

  const current = (data?.totalPageViews ?? 0) as number;
  const updated = {
    totalPageViews: current + 1,
    lastUpdated: new Date().toISOString(),
  };

  const { error: upErr } = await supabase.from("site_analytics").update(updated).eq("id", 1);
  if (upErr) console.error("incrementSiteViews update error:", upErr);

  return { totalPageViews: updated.totalPageViews, lastUpdated: updated.lastUpdated };
};

export const resetGameStorage = async (): Promise<void> => {
  const { error } = await supabase.from("games").delete().neq("id", "");
  if (error) console.error("resetGameStorage error:", error);
};

// --------------------
// CATEGORIES
// --------------------
export const loadCategories = async (): Promise<string[]> => {
  const { data, error } = await supabase.from("categories").select("name").order("name");
  if (error) {
    console.error("loadCategories error:", error);
    return defaultCategories;
  }
  const names = (data ?? []).map((r: any) => r.name).filter(Boolean);
  // keep existing UI expectation of having an "All" category in local code
  return names.includes("All") ? names : ["All", ...names];
};

export const saveCategories = async (cats: string[]): Promise<void> => {
  // Upsert by name primary key.
  const rows = cats
    .filter(Boolean)
    .map((name) => ({ name }));

  const { error } = await supabase.from("categories").upsert(rows, { onConflict: "name" });
  if (error) console.error("saveCategories error:", error);
};

// --------------------
// SITE SETTINGS
// --------------------
export const loadSiteSettings = async (): Promise<SiteSettings> => {
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  if (error) {
    console.error("loadSiteSettings error:", error);
    return defaultSettings;
  }

  return {
    ...defaultSettings,
    siteName: data?.siteName ?? defaultSettings.siteName,
    logoUrl: data?.logoUrl ?? defaultSettings.logoUrl,
    showLatestGames: data?.showLatestGames ?? defaultSettings.showLatestGames,
    showMostViewed: data?.showMostViewed ?? defaultSettings.showMostViewed,
    showGameOfTheDay: data?.showGameOfTheDay ?? defaultSettings.showGameOfTheDay,
    showTrendingGames: data?.showTrendingGames ?? defaultSettings.showTrendingGames,
    theme: (data?.theme ?? defaultSettings.theme) as any,
    heroSliderGameIds: toJsonbArray<string>(data?.heroSliderGameIds, []),
  };
};

export const saveSiteSettings = async (settings: SiteSettings): Promise<void> => {
  const payload = {
    id: 1,
    siteName: settings.siteName,
    logoUrl: settings.logoUrl,
    showLatestGames: settings.showLatestGames,
    showMostViewed: settings.showMostViewed,
    showGameOfTheDay: settings.showGameOfTheDay,
    showTrendingGames: settings.showTrendingGames,
    theme: settings.theme,
    heroSliderGameIds: (settings.heroSliderGameIds ?? []) as any,
  };

  const { error } = await supabase.from("site_settings").upsert(payload, { onConflict: "id" });
  if (error) console.error("saveSiteSettings error:", error);
};

// --------------------
// ANALYTICS
// --------------------
export const loadSiteAnalytics = async (): Promise<SiteAnalytics> => {
  const { data, error } = await supabase.from("site_analytics").select("*").eq("id", 1).single();
  if (error) {
    console.error("loadSiteAnalytics error:", error);
    return { totalPageViews: 0, lastUpdated: new Date().toISOString() };
  }

  return {
    totalPageViews: data?.totalPageViews ?? 0,
    lastUpdated: (data?.lastUpdated ?? new Date().toISOString()) as string,
  };
};

export const saveSiteAnalytics = async (_analytics: SiteAnalytics): Promise<void> => {
  // optional: you can implement update.
};

