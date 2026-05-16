import { supabase } from "./supabaseClient";
import { Game } from "../app/data/games";

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

export interface SiteAnalytics {
  totalPageViews: number;
  lastUpdated: string;
}

// ─── GAMES ───────────────────────────────────────────

export const loadGames = async (): Promise<Game[]> => {
  const { data, error } = await supabase.from("games").select("*").order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return data as Game[];
};

export const saveGame = async (game: Game) => {
  const { error } = await supabase.from("games").upsert(game);
  if (error) console.error(error);
};

export const deleteGame = async (id: string) => {
  const { error } = await supabase.from("games").delete().eq("id", id);
  if (error) console.error(error);
};

export const getGameById = async (id: string): Promise<Game | undefined> => {
  const { data, error } = await supabase.from("games").select("*").eq("id", id).single();
  if (error) { console.error(error); return undefined; }
  return data as Game;
};

export const incrementGameView = async (id: string) => {
  await supabase.rpc("increment_views", { game_id: id });
};

export const incrementGameDownload = async (id: string) => {
  await supabase.rpc("increment_downloads", { game_id: id });
};

// ─── CATEGORIES ──────────────────────────────────────

export const loadCategories = async (): Promise<string[]> => {
  const { data, error } = await supabase.from("categories").select("name").order("name");
  if (error) { console.error(error); return []; }
  return data.map((c: any) => c.name);
};

export const saveCategories = async (cats: string[]) => {
  await supabase.from("categories").delete().neq("name", "placeholder");
  const rows = cats.map((name) => ({ name }));
  await supabase.from("categories").insert(rows);
};

// ─── SETTINGS ────────────────────────────────────────

export const loadSiteSettings = async (): Promise<SiteSettings> => {
  const { data, error } = await supabase.from("site_settings").select("*").eq("id", 1).single();
  if (error || !data) return {
    siteName: "Download Your Games", logoUrl: "", showLatestGames: true,
    showMostViewed: true, showGameOfTheDay: true, showTrendingGames: true,
    theme: "dark", heroSliderGameIds: [],
  };
  return {
    siteName: data.site_name,
    logoUrl: data.logo_url,
    showLatestGames: data.show_latest_games,
    showMostViewed: data.show_most_viewed,
    showGameOfTheDay: data.show_game_of_day,
    showTrendingGames: data.show_trending_games,
    theme: data.theme,
    heroSliderGameIds: data.hero_slider_game_ids || [],
  };
};

export const saveSiteSettings = async (settings: SiteSettings) => {
  const { error } = await supabase.from("site_settings").upsert({
    id: 1,
    site_name: settings.siteName,
    logo_url: settings.logoUrl,
    show_latest_games: settings.showLatestGames,
    show_most_viewed: settings.showMostViewed,
    show_game_of_day: settings.showGameOfTheDay,
    show_trending_games: settings.showTrendingGames,
    theme: settings.theme,
    hero_slider_game_ids: settings.heroSliderGameIds,
  });
  if (error) console.error(error);
};

// ─── ANALYTICS ───────────────────────────────────────

export const loadSiteAnalytics = async (): Promise<SiteAnalytics> => {
  const { data, error } = await supabase.from("analytics").select("*").eq("id", 1).single();
  if (error || !data) return { totalPageViews: 0, lastUpdated: new Date().toISOString() };
  return { totalPageViews: data.total_page_views, lastUpdated: data.last_updated };
};

export const incrementSiteViews = async () => {
  await supabase.rpc("increment_site_views");
};