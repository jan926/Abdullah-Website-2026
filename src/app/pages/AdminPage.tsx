import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  loadGames,
  saveGame,
  deleteGame,
  loadSiteSettings,
  saveSiteSettings,
  loadCategories,
  saveCategories,
  SiteSettings,
  loadSiteAnalytics,
} from "../../lib/gameStore";
import { Game } from "../data/games";

const ADMIN_PASSWORD = "Malik0cr7";

type AdminSection =
  | "dashboard"
  | "analytics"
  | "manage"
  | "upload"
  | "categories"
  | "hero"
  | "gameofday"
  | "settings";

const emptyGame: Partial<Game> = {
  title: "", category: "", developer: "", fileSize: "", description: "",
  coverImage: "", heroImage: "", backgroundMedia: "", downloadLink: "",
  filePassword: "", downloadParts: [], trailerUrl: "", screenshots: [],
  isFeatured: false, isTrending: false, isGameOfDay: false, status: "published",
  systemRequirements: {
    minimum: { os: "", processor: "", memory: "", graphics: "", storage: "" },
    recommended: { os: "", processor: "", memory: "", graphics: "", storage: "" },
  },
};

export default function AdminPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [section, setSection] = useState<AdminSection>("dashboard");
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: "Download Your Games", logoUrl: "", showLatestGames: true,
    showMostViewed: true, showGameOfTheDay: true, showTrendingGames: true,
    theme: "dark", heroSliderGameIds: [],
  });
  const [analytics, setAnalytics] = useState({ totalPageViews: 0, lastUpdated: new Date().toISOString() });
  const [newGame, setNewGame] = useState<Partial<Game>>(emptyGame);
  const [newCategory, setNewCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [gameOfDayId, setGameOfDayId] = useState<string>("");
  const [heroSliderIds, setHeroSliderIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("admin-auth");
    if (auth === "true") setIsAuthenticated(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      setLoading(true);
      Promise.all([
        loadGames(),
        loadCategories(),
        loadSiteSettings(),
        loadSiteAnalytics(),
      ]).then(([g, c, s, a]) => {
        setGames(g);
        setCategories(c);
        setSettings(s);
        setAnalytics(a);
        setGameOfDayId(g.find((x) => x.isGameOfDay)?.id || "");
        setHeroSliderIds(s.heroSliderGameIds || []);
        setLoading(false);
      });
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin-auth", "true");
      setAuthError("");
    } else {
      setAuthError("Incorrect password");
    }
  };

  const handleAddGame = async () => {
    if (!newGame.title) return;
    const game: Game = {
      id: Date.now().toString(),
      title: newGame.title || "",
      category: newGame.category || "",
      developer: newGame.developer || "",
      fileSize: newGame.fileSize || "",
      description: newGame.description || "",
      coverImage: newGame.coverImage || "",
      heroImage: newGame.heroImage || "",
      backgroundMedia: newGame.backgroundMedia || "",
      downloadLink: newGame.downloadLink || "",
      filePassword: newGame.filePassword || "",
      downloadParts: newGame.downloadParts || [],
      trailerUrl: newGame.trailerUrl || "",
      screenshots: newGame.screenshots || [],
      isFeatured: newGame.isFeatured || false,
      isTrending: newGame.isTrending || false,
      isGameOfDay: newGame.isGameOfDay || false,
      status: newGame.status || "published",
      views: 0,
      downloads: 0,
      createdAt: new Date().toISOString(),
      systemRequirements: newGame.systemRequirements || {
        minimum: { os: "", processor: "", memory: "", graphics: "", storage: "" },
        recommended: { os: "", processor: "", memory: "", graphics: "", storage: "" },
      },
    };
    await saveGame(game);
    setGames([game, ...games]);
    setNewGame(emptyGame);
    setSection("manage");
  };

  const handleDeleteGame = async (id: string) => {
    await deleteGame(id);
    setGames(games.filter((g) => g.id !== id));
  };

  const handleEditGame = (game: Game) => {
    setEditingGame(game);
    setSection("upload");
    setNewGame(game);
  };

  const handleUpdateGame = async () => {
    if (!editingGame) return;
    const updated = { ...editingGame, ...newGame };
    await saveGame(updated as Game);
    setGames(games.map((g) => g.id === editingGame.id ? updated as Game : g));
    setEditingGame(null);
    setNewGame(emptyGame);
    setSection("manage");
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    const updated = [...categories, newCategory.trim()];
    await saveCategories(updated);
    setCategories(updated);
    setNewCategory("");
  };

  const handleDeleteCategory = async (cat: string) => {
    const updated = categories.filter((c) => c !== cat);
    await saveCategories(updated);
    setCategories(updated);
  };

  const handleSaveSettings = async () => {
    const updated = { ...settings, heroSliderGameIds: heroSliderIds };
    await saveSiteSettings(updated);
    setSettings(updated);
  };

  const handleSetGameOfDay = async () => {
    const updatedGames = await Promise.all(
      games.map(async (g) => {
        const updated = { ...g, isGameOfDay: g.id === gameOfDayId };
        await saveGame(updated);
        return updated;
      })
    );
    setGames(updatedGames);
  };

  const handleClearGameOfDay = async () => {
    const updatedGames = await Promise.all(
      games.map(async (g) => {
        const updated = { ...g, isGameOfDay: false };
        await saveGame(updated);
        return updated;
      })
    );
    setGames(updatedGames);
    setGameOfDayId("");
  };

  const handleAddToHeroSlider = (gameId: string) => {
    if (heroSliderIds.length >= 6) return;
    if (!heroSliderIds.includes(gameId)) setHeroSliderIds([...heroSliderIds, gameId]);
  };

  const handleRemoveFromHeroSlider = (gameId: string) => {
    setHeroSliderIds(heroSliderIds.filter((id) => id !== gameId));
  };

  const handleSaveHeroSlider = async () => {
    const updated = { ...settings, heroSliderGameIds: heroSliderIds };
    await saveSiteSettings(updated);
    setSettings(updated);
  };

  const filteredGames = games.filter((g) =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalDownloads = games.reduce((sum, g) => sum + (g.downloads || 0), 0);
  const totalViews = games.reduce((sum, g) => sum + (g.views || 0), 0);

  // AUTH SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="bg-gray-900 p-8 rounded-2xl w-full max-w-md shadow-2xl border border-gray-800">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-gray-400 text-sm mt-1">Download Your Game</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>
            {authError && <p className="text-red-400 text-sm text-center">{authError}</p>}
            <button onClick={handleLogin} className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-cyan-500/30">
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-cyan-400 text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-full z-10">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-white font-bold">Admin Panel</h2>
              <p className="text-gray-400 text-xs">Download Your Game</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
            { id: "analytics", label: "Analytics", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" },
            { id: "manage", label: "Manage Games", icon: "M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" },
            { id: "upload", label: "Upload Game", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" },
            { id: "categories", label: "Categories", icon: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" },
            { id: "hero", label: "Homepage Hero", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
            { id: "gameofday", label: "Game of the Day", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" },
            { id: "settings", label: "Site Settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id as AdminSection)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                section === item.id ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30" : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">M</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Malik0cr7</p>
              <p className="text-gray-400 text-xs">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => { sessionStorage.removeItem("admin-auth"); setIsAuthenticated(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg text-sm transition-colors mt-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Home
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">

        {/* DASHBOARD */}
        {section === "dashboard" && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">Overview</h1>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Games</p>
                    <p className="text-3xl font-bold text-white">{games.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Categories</p>
                    <p className="text-3xl font-bold text-white">{categories.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Total Downloads</p>
                    <p className="text-3xl font-bold text-white">{(totalDownloads / 1000).toFixed(1)}k</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-900 rounded-2xl border border-gray-800">
              <div className="p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">Recent Uploads</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">GAME</th>
                      <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">CATEGORY</th>
                      <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">DATE</th>
                      <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.slice(0, 10).map((game) => (
                      <tr key={game.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={game.coverImage} alt={game.title} className="w-10 h-10 rounded-lg object-cover bg-gray-800" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                            <span className="text-white font-medium">{game.title}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400">{game.category}</td>
                        <td className="px-6 py-4 text-gray-400">{game.createdAt?.split("T")[0]}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium flex items-center gap-1 w-fit">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
                            {game.status || "Published"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS */}
        {section === "analytics" && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">Analytics</h1>
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <p className="text-gray-400 text-sm mb-2">Total Site Views</p>
                <p className="text-4xl font-bold text-white">{analytics.totalPageViews.toLocaleString()}</p>
                <p className="text-gray-500 text-xs mt-2">Last updated {new Date(analytics.lastUpdated).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <p className="text-gray-400 text-sm mb-2">Total Game Views</p>
                <p className="text-4xl font-bold text-white">{totalViews.toLocaleString()}</p>
              </div>
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <p className="text-gray-400 text-sm mb-2">Total Downloads</p>
                <p className="text-4xl font-bold text-white">{totalDownloads.toLocaleString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-white font-bold mb-4">Top Viewed Games</h3>
                <div className="space-y-3">
                  {[...games].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5).map((game) => (
                    <div key={game.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-white text-sm font-medium">{game.title}</p>
                        <p className="text-gray-400 text-xs">{game.category}</p>
                      </div>
                      <span className="text-gray-400 text-sm">{(game.views || 0).toLocaleString()} views</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-white font-bold mb-4">Top Downloads</h3>
                <div className="space-y-3">
                  {[...games].sort((a, b) => (b.downloads || 0) - (a.downloads || 0)).slice(0, 5).map((game) => (
                    <div key={game.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-white text-sm font-medium">{game.title}</p>
                        <p className="text-gray-400 text-xs">{game.category}</p>
                      </div>
                      <span className="text-gray-400 text-sm">{(game.downloads || 0).toLocaleString()} downloads</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MANAGE GAMES */}
        {section === "manage" && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-white">Manage Games</h1>
              <button
                onClick={() => { setEditingGame(null); setNewGame(emptyGame); setSection("upload"); }}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-medium transition-colors shadow-lg shadow-cyan-500/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add New Game
              </button>
            </div>
            <div className="bg-gray-900 rounded-2xl border border-gray-800 mb-6 p-4">
              <input type="text" placeholder="Search games by title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent text-white placeholder-gray-500 outline-none" />
            </div>
            <div className="space-y-4">
              {filteredGames.map((game) => (
                <div key={game.id} className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <img src={game.coverImage} alt={game.title} className="w-20 h-20 rounded-xl object-cover bg-gray-800" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      <div>
                        <h3 className="text-white font-bold text-lg">{game.title}</h3>
                        <p className="text-gray-400 text-sm">{game.category} • {game.developer} • {game.fileSize}</p>
                        <div className="flex gap-2 mt-2">
                          {game.isFeatured && <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">FEATURED</span>}
                          {game.isTrending && <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs">TRENDING</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleEditGame(game)} className="flex items-center gap-2 px-4 py-2 border border-gray-700 hover:border-cyan-500 text-gray-300 hover:text-cyan-400 rounded-xl text-sm transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteGame(game.id)} className="flex items-center gap-2 px-4 py-2 border border-gray-700 hover:border-red-500 text-gray-300 hover:text-red-400 rounded-xl text-sm transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* UPLOAD GAME */}
        {section === "upload" && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">{editingGame ? "Edit Game" : "Upload New Game"}</h1>
            <div className="space-y-6">
              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <span className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center text-sm">1</span>
                  Basic Information
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Game Title</label>
                    <input value={newGame.title || ""} onChange={(e) => setNewGame({...newGame, title: e.target.value})} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Category</label>
                    <select value={newGame.category || ""} onChange={(e) => setNewGame({...newGame, category: e.target.value})} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500">
                      <option value="">Select category</option>
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Developer / Publisher</label>
                    <input value={newGame.developer || ""} onChange={(e) => setNewGame({...newGame, developer: e.target.value})} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">File Size</label>
                    <input value={newGame.fileSize || ""} onChange={(e) => setNewGame({...newGame, fileSize: e.target.value})} placeholder="e.g. 45 GB" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm text-gray-400 mb-2">Description</label>
                    <textarea value={newGame.description || ""} onChange={(e) => setNewGame({...newGame, description: e.target.value})} rows={4} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none" />
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <span className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center text-sm">2</span>
                  Media & Links
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Cover Image URL</label>
                    <input value={newGame.coverImage || ""} onChange={(e) => setNewGame({...newGame, coverImage: e.target.value})} placeholder="https://..." className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Homepage Hero Image URL</label>
                    <input value={newGame.heroImage || ""} onChange={(e) => setNewGame({...newGame, heroImage: e.target.value})} placeholder="https://..." className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Background Media URL</label>
                    <input value={newGame.backgroundMedia || ""} onChange={(e) => setNewGame({...newGame, backgroundMedia: e.target.value})} placeholder="YouTube / video / image URL" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Main Download Link</label>
                    <input value={newGame.downloadLink || ""} onChange={(e) => setNewGame({...newGame, downloadLink: e.target.value})} placeholder="magnet:?xt=... or https://..." className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">File Password</label>
                    <input value={newGame.filePassword || ""} onChange={(e) => setNewGame({...newGame, filePassword: e.target.value})} placeholder="Password for the download file" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm text-gray-400">Download Parts (Multi-Part)</label>
                      <button onClick={() => setNewGame({...newGame, downloadParts: [...(newGame.downloadParts || []), { label: "", url: "", size: "" }]})} className="text-cyan-400 text-sm hover:text-cyan-300">+ Add Part</button>
                    </div>
                    {(newGame.downloadParts || []).map((part, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
                        <input value={part.label} onChange={(e) => { const parts = [...(newGame.downloadParts || [])]; parts[idx].label = e.target.value; setNewGame({...newGame, downloadParts: parts}); }} placeholder="e.g. Part 1" className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" />
                        <input value={part.url} onChange={(e) => { const parts = [...(newGame.downloadParts || [])]; parts[idx].url = e.target.value; setNewGame({...newGame, downloadParts: parts}); }} placeholder="Download link" className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" />
                        <input value={part.size} onChange={(e) => { const parts = [...(newGame.downloadParts || [])]; parts[idx].size = e.target.value; setNewGame({...newGame, downloadParts: parts}); }} placeholder="Size (e.g. 5 GB)" className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-cyan-500" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Trailer Video URL</label>
                    <input value={newGame.trailerUrl || ""} onChange={(e) => setNewGame({...newGame, trailerUrl: e.target.value})} placeholder="https://....mp4" className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm text-gray-400">Screenshots</label>
                      <button onClick={() => setNewGame({...newGame, screenshots: [...(newGame.screenshots || []), ""]})} className="text-cyan-400 text-sm hover:text-cyan-300">+ Add Image</button>
                    </div>
                    {(newGame.screenshots || []).map((ss, idx) => (
                      <input key={idx} value={ss} onChange={(e) => { const shots = [...(newGame.screenshots || [])]; shots[idx] = e.target.value; setNewGame({...newGame, screenshots: shots}); }} placeholder="Screenshot URL..." className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 mb-2" />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <span className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center text-sm">3</span>
                  Visibility Settings
                </h2>
                <div className="space-y-3">
                  {[
                    { key: "isFeatured", label: "Featured Game", desc: "Show in featured section on homepage." },
                    { key: "isTrending", label: "Trending", desc: "Add a 'Trending' badge and show in most viewed sections." },
                    { key: "isGameOfDay", label: "Game of the Day", desc: "Promote this game as the daily highlighted release." },
                  ].map(({ key, label, desc }) => (
                    <label key={key} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl cursor-pointer">
                      <div>
                        <p className="text-white font-medium">{label}</p>
                        <p className="text-gray-400 text-sm">{desc}</p>
                      </div>
                      <input type="checkbox" checked={!!(newGame as any)[key]} onChange={(e) => setNewGame({...newGame, [key]: e.target.checked})} className="w-5 h-5 accent-cyan-500" />
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
                <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                  <span className="w-7 h-7 bg-cyan-500 rounded-lg flex items-center justify-center text-sm">4</span>
                  System Requirements
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Minimum OS", field: "os", type: "min" },
                    { label: "Recommended OS", field: "os", type: "rec" },
                    { label: "Minimum Processor", field: "processor", type: "min" },
                    { label: "Recommended Processor", field: "processor", type: "rec" },
                    { label: "Minimum Memory", field: "memory", type: "min" },
                    { label: "Recommended Memory", field: "memory", type: "rec" },
                    { label: "Minimum Graphics", field: "graphics", type: "min" },
                    { label: "Recommended Graphics", field: "graphics", type: "rec" },
                    { label: "Minimum Storage", field: "storage", type: "min" },
                    { label: "Recommended Storage", field: "storage", type: "rec" },
                  ].map(({ label, field, type }) => (
                    <div key={label}>
                      <label className="block text-sm text-gray-400 mb-2">{label}</label>
                      <input
                        value={(type === "rec" ? newGame.systemRequirements?.recommended : newGame.systemRequirements?.minimum)?.[field as keyof typeof newGame.systemRequirements.minimum] || ""}
                        onChange={(e) => {
                          const sr = { ...newGame.systemRequirements! };
                          if (type === "rec") sr.recommended = { ...sr.recommended, [field]: e.target.value };
                          else sr.minimum = { ...sr.minimum, [field]: e.target.value };
                          setNewGame({ ...newGame, systemRequirements: sr });
                        }}
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 justify-end">
                <button onClick={() => { setEditingGame(null); setSection("manage"); }} className="px-6 py-3 border border-gray-700 text-gray-300 hover:text-white rounded-xl font-medium transition-colors">Cancel</button>
                <button
                  onClick={editingGame ? handleUpdateGame : handleAddGame}
                  className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-medium transition-colors shadow-lg shadow-cyan-500/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  {editingGame ? "Update Game" : "Publish Game"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CATEGORIES */}
        {section === "categories" && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">Manage Categories</h1>
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-2xl">
              <div className="flex gap-3 mb-6">
                <input value={newCategory} onChange={(e) => setNewCategory(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddCategory()} placeholder="New Category Name..." className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500" />
                <button onClick={handleAddCategory} className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-medium transition-colors">+ Add</button>
              </div>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <div key={cat} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
                    <span className="text-white">{cat}</span>
                    {cat !== "All" && (
                      <button onClick={() => handleDeleteCategory(cat)} className="text-gray-400 hover:text-red-400 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* HOMEPAGE HERO */}
        {section === "hero" && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">Homepage Hero Slider</h1>
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-2xl">
              <div className="flex gap-3 mb-4">
                <select className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500" onChange={(e) => e.target.value && handleAddToHeroSlider(e.target.value)}>
                  <option value="">Select a game to add</option>
                  {games.filter((g) => !heroSliderIds.includes(g.id)).map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
                <button className="px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-medium transition-colors">+ Add to Slider</button>
              </div>
              <p className="text-gray-500 text-sm mb-4">Select up to 6 games that should appear in the homepage hero animation.</p>
              {heroSliderIds.length === 0 ? (
                <p className="text-gray-500 text-sm">No hero games selected yet.</p>
              ) : (
                <div className="space-y-2">
                  {heroSliderIds.map((id) => {
                    const game = games.find((g) => g.id === id);
                    return game ? (
                      <div key={id} className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
                        <span className="text-white">{game.title}</span>
                        <button onClick={() => handleRemoveFromHeroSlider(id)} className="text-gray-400 hover:text-red-400">✕</button>
                      </div>
                    ) : null;
                  })}
                </div>
              )}
              <button onClick={handleSaveHeroSlider} className="mt-4 flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-medium transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Save Hero Slider
              </button>
            </div>
          </div>
        )}

        {/* GAME OF THE DAY */}
        {section === "gameofday" && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">Manage Game of the Day</h1>
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-2xl">
              <label className="block text-sm text-gray-400 mb-2">Select Game of the Day</label>
              <select value={gameOfDayId} onChange={(e) => setGameOfDayId(e.target.value)} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500 mb-4">
                <option value="">-- Select a Game --</option>
                {games.map((g) => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
              <div className="flex gap-3">
                <button onClick={handleClearGameOfDay} className="px-4 py-2 border border-gray-700 text-gray-300 hover:text-white rounded-xl text-sm transition-colors">Clear</button>
                <button onClick={handleSetGameOfDay} className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-medium transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Set as Game of the Day
                </button>
              </div>
              {gameOfDayId && (() => { const game = games.find((g) => g.id === gameOfDayId); return game ? (
                <div className="mt-6">
                  <h3 className="text-white font-bold mb-3">Current Game of the Day</h3>
                  <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl">
                    <img src={game.coverImage} alt={game.title} className="w-16 h-16 rounded-xl object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <div className="flex-1">
                      <p className="text-white font-bold">{game.title}</p>
                      <p className="text-gray-400 text-sm">{game.category}</p>
                    </div>
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                </div>
              ) : null; })()}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {section === "settings" && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-8">Global Settings</h1>
            <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 max-w-2xl">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Site Name</label>
                  <input value={settings.siteName} onChange={(e) => setSettings({...settings, siteName: e.target.value})} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-cyan-500" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Site Logo URL</label>
                  <input value={settings.logoUrl} onChange={(e) => setSettings({...settings, logoUrl: e.target.value})} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { key: "showTrendingGames", label: "Show Trending Section" },
                    { key: "showLatestGames", label: "Show Latest Games" },
                    { key: "showGameOfTheDay", label: "Show Game of the Day" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center justify-between p-4 bg-gray-800 rounded-xl cursor-pointer">
                      <span className="text-white text-sm">{label}</span>
                      <input type="checkbox" checked={!!(settings as any)[key]} onChange={(e) => setSettings({...settings, [key]: e.target.checked})} className="w-5 h-5 accent-cyan-500" />
                    </label>
                  ))}
                </div>
                <button onClick={handleSaveSettings} className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl font-medium transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Save Global Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}