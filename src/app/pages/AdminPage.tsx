import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Card } from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Game, DownloadPart, categories as initialCategories } from "../data/games";
import {
  loadGames,
  saveGames,
  loadSiteSettings,
  saveSiteSettings,
  SiteSettings,
  loadCategories,
  saveCategories,
  loadSiteAnalytics,
  SiteAnalytics,
  subscribeToDataChanges,
  getDatabaseStatus,
} from "../../lib/gameStore";
import { 
  Upload, Trash2, Edit, Plus, LogOut, LayoutDashboard, Gamepad2, 
  Tags, Settings, Search, Save, CheckCircle2, XCircle, Home, BarChart3, AlertTriangle, Sparkles, Wand2
} from "lucide-react";
import { autoFillGameDetails } from "../../lib/gameAutoFill";
import { DownloadPartsEditor } from "../components/admin/DownloadPartsEditor";
import { toast } from "sonner";

const defaultAdminSettings: SiteSettings = {
  siteName: "Download Your Games",
  logoUrl: "",
  showLatestGames: true,
  showMostViewed: true,
  showGameOfTheDay: true,
  showTrendingGames: true,
  theme: "dark",
};

export default function AdminPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Data State
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [dailyGameId, setDailyGameId] = useState<string>("");
  const [analytics, setAnalytics] = useState<SiteAnalytics>({
    totalPageViews: 0,
    lastUpdated: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dbNeedsSetup, setDbNeedsSetup] = useState(false);
  
  // New Game Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState("");
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    selectedCategories: [] as string[],
    description: "",
    cover: "",
    backgroundImage: "",
    size: "",
    developer: "",
    downloadLink: "",
    trailer: "",
    screenshots: [""],
    systemRequirements: {
      minimum: { os: "", processor: "", memory: "", graphics: "", storage: "" },
      recommended: { os: "", processor: "", memory: "", graphics: "", storage: "" },
    },
    heroMedia: "",
    featured: false,
    trending: false,
    gameOfTheDay: false,
    heroFeatured: false,
    filePassword: "",
    tags: "",
    useMultiPart: false,
    downloadParts: [{ id: "part-1", name: "Part 1", link: "", size: "" }] as DownloadPart[],
  });
  const [heroSelection, setHeroSelection] = useState<string[]>([]);

  // Settings State
  const [settings, setSettings] = useState<SiteSettings>(defaultAdminSettings);

  const refreshData = async () => {
    const [storedGames, loadedSettings, loadedCategories, loadedAnalytics] = await Promise.all([
      loadGames(),
      loadSiteSettings(),
      loadCategories(),
      loadSiteAnalytics(),
    ]);
    setGames(storedGames);
    setDailyGameId(storedGames.find((game) => game.gameOfTheDay)?.id ?? "");
    setSettings(loadedSettings);
    setCategories(loadedCategories);
    setAnalytics(loadedAnalytics);
    setHeroSelection(storedGames.filter((g) => g.heroFeatured).map((g) => g.id));
    setDbNeedsSetup(getDatabaseStatus() === "missing_tables");
  };

  const buildGameFromForm = (id: string, existing?: Game): Game => {
    const cats = formData.selectedCategories.length
      ? formData.selectedCategories
      : formData.category
        ? [formData.category]
        : [];
    const primary = cats[0] || formData.category || "Action";
    return {
    id,
    title: formData.title,
    category: primary,
    categories: cats.length > 0 ? cats : undefined,
    description: formData.description,
    cover: formData.cover,
    backgroundImage: formData.backgroundImage,
    heroMedia: formData.heroMedia || undefined,
    size: formData.size,
    developer: formData.developer,
    downloadLink: formData.downloadLink,
    trailer: formData.trailer || undefined,
    screenshots: formData.screenshots.filter(Boolean),
    featured: formData.featured,
    trending: formData.trending,
    gameOfTheDay: formData.gameOfTheDay,
    heroFeatured: formData.heroFeatured,
    filePassword: formData.filePassword || undefined,
    tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
    downloadParts: formData.useMultiPart
      ? formData.downloadParts.filter((p) => p.link.trim())
      : undefined,
    rating: existing?.rating ?? 0,
    downloads: existing?.downloads ?? 0,
    releaseDate: existing?.releaseDate ?? new Date().toISOString().split("T")[0],
    systemRequirements: formData.systemRequirements,
    comments: existing?.comments ?? [],
    views: existing?.views,
  };
  };

  const handleAutoFill = async () => {
    if (!formData.title.trim()) {
      toast.error("Enter a game title first");
      return;
    }
    setIsAutoFilling(true);
    try {
      const cats = formData.selectedCategories.length
        ? formData.selectedCategories
        : formData.category
          ? [formData.category]
          : [];
      const result = await autoFillGameDetails(formData.title, cats);
      setFormData((prev) => ({
        ...prev,
        description: result.description,
        developer: result.developer,
        tags: result.tags,
        systemRequirements: result.systemRequirements,
        screenshots: result.screenshots,
        cover: prev.cover || result.screenshots[0] || prev.cover,
      }));
      const sourceMsg: Record<string, string> = {
        rawg: "RAWG (full specs + long description)",
        wikidata: "Wikidata + Wikipedia",
        wikipedia: "Wikipedia full article",
        catalog: "FreeToGame catalog (400+ games)",
        database: "built-in game database",
        openai: "OpenAI GPT model",
        template: "smart templates",
      };
      toast.success(`Auto-filled from ${sourceMsg[result.source] || "sources"} — please review before saving`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Auto-fill failed");
    } finally {
      setIsAutoFilling(false);
    }
  };

  const toggleFormCategory = (cat: string) => {
    setFormData((prev) => {
      const has = prev.selectedCategories.includes(cat);
      const selectedCategories = has
        ? prev.selectedCategories.filter((c) => c !== cat)
        : [...prev.selectedCategories, cat];
      return {
        ...prev,
        selectedCategories,
        category: selectedCategories[0] || "",
      };
    });
  };

  const enforceHeroLimit = (gamesList: Game[], selectedIds: string[]) => {
    const heroes = selectedIds.slice(0, 6);
    return gamesList.map((g) => ({ ...g, heroFeatured: heroes.includes(g.id) }));
  };

  const tablesMissingMessage =
    "Supabase tables are not created yet. Open Supabase → SQL Editor, paste supabase/schema.sql, and click Run. Then refresh this page.";

  const handleSaveError = (error: unknown) => {
    if (error instanceof Error && error.message === "TABLES_MISSING") {
      setDbNeedsSetup(true);
      toast.error(tablesMissingMessage);
      return;
    }
    toast.error("Failed to save to database");
  };

  useEffect(() => {
    const authenticated = localStorage.getItem("adminAuthenticated");
    const username = localStorage.getItem("adminUsername");

    if (authenticated !== "true" || !username) {
      navigate("/admin/login");
      return;
    }

    setIsAuthenticated(true);
    setAdminUsername(username);

    const load = async () => {
      try {
        await refreshData();
        if (getDatabaseStatus() === "missing_tables") {
          toast.warning(tablesMissingMessage, { duration: 12000 });
        }
      } catch {
        toast.error("Could not connect to Supabase. Check your .env file and internet connection.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
    return subscribeToDataChanges(() => {
      refreshData().catch(() => undefined);
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("adminUsername");
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const handleGameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.selectedCategories.length && !formData.category) {
      toast.error("Select at least one category");
      return;
    }

    try {
      if (isEditing) {
        const existing = games.find((g) => g.id === currentEditId);
        const updatedGame = buildGameFromForm(currentEditId, existing);
        let updatedGames = games.map((g) => {
          if (g.id === currentEditId) return updatedGame;
          if (formData.gameOfTheDay) return { ...g, gameOfTheDay: false };
          return g;
        });
        if (formData.heroFeatured) {
          const heroIds = [
            currentEditId,
            ...updatedGames.filter((g) => g.heroFeatured && g.id !== currentEditId).map((g) => g.id),
          ].slice(0, 6);
          updatedGames = enforceHeroLimit(updatedGames, heroIds);
          setHeroSelection(heroIds);
        }
        await saveGames(updatedGames);
        setGames(updatedGames);
        toast.success("Game updated successfully!");
      } else {
        const newId = Math.random().toString(36).substr(2, 9);
        const newGame = buildGameFromForm(newId);
        let updatedGames = formData.gameOfTheDay
          ? [newGame, ...games.map((g) => ({ ...g, gameOfTheDay: false }))]
          : [newGame, ...games];
        if (formData.heroFeatured) {
          const heroIds = [newId, ...updatedGames.filter((g) => g.heroFeatured).map((g) => g.id)].slice(0, 6);
          updatedGames = enforceHeroLimit(updatedGames, heroIds);
          setHeroSelection(heroIds);
        }
        await saveGames(updatedGames);
        setGames(updatedGames);
        toast.success("Game uploaded successfully!");
      }

      resetForm();
      setActiveTab("games");
    } catch (error) {
      handleSaveError(error);
    }
  };

  const editGame = (game: Game) => {
    const parts = game.downloadParts?.length
      ? game.downloadParts
      : [{ id: "part-1", name: "Part 1", link: "", size: "" }];
    const gameCats = game.categories?.length ? game.categories : game.category ? [game.category] : [];
    setFormData({
      title: game.title,
      category: gameCats[0] || game.category,
      selectedCategories: gameCats,
      description: game.description,
      cover: game.cover,
      backgroundImage: game.backgroundImage || "",
      heroMedia: game.heroMedia || "",
      size: game.size,
      developer: game.developer,
      downloadLink: game.downloadLink,
      trailer: game.trailer || "",
      screenshots: game.screenshots.length ? [...game.screenshots] : [""],
      systemRequirements: game.systemRequirements || {
        minimum: { os: "", processor: "", memory: "", graphics: "", storage: "" },
        recommended: { os: "", processor: "", memory: "", graphics: "", storage: "" },
      },
      featured: game.featured || false,
      trending: game.trending || false,
      gameOfTheDay: game.gameOfTheDay || false,
      heroFeatured: game.heroFeatured || false,
      filePassword: game.filePassword || "",
      tags: (game.tags || []).join(", "),
      useMultiPart: Boolean(game.downloadParts?.some((p) => p.link)),
      downloadParts: parts,
    });
    setIsEditing(true);
    setCurrentEditId(game.id);
    setActiveTab("upload");
  };

  const deleteGame = async (id: string) => {
    if (!confirm("Are you sure you want to delete this game?")) return;

    try {
      const updatedGames = games.filter((g) => g.id !== id);
      await saveGames(updatedGames);
      setGames(updatedGames);
      toast.success("Game deleted");
    } catch (error) {
      handleSaveError(error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      selectedCategories: [],
      description: "",
      cover: "",
      backgroundImage: "",
      size: "",
      developer: "",
      downloadLink: "",
      trailer: "",
      screenshots: [""],
      systemRequirements: {
        minimum: { os: "", processor: "", memory: "", graphics: "", storage: "" },
        recommended: { os: "", processor: "", memory: "", graphics: "", storage: "" },
      },
      heroMedia: "",
      featured: false,
      trending: false,
      gameOfTheDay: false,
      heroFeatured: false,
      filePassword: "",
      tags: "",
      useMultiPart: false,
      downloadParts: [{ id: "part-1", name: "Part 1", link: "", size: "" }],
    });
    setIsEditing(false);
    setCurrentEditId("");
  };

  // UI Components
  const SidebarItem = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
    <button
      onClick={() => setActiveTab(value)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        activeTab === value 
        ? "bg-sky-600 text-white font-medium" 
        : "text-[var(--muted-foreground)] hover:bg-[var(--card)] hover:text-[var(--foreground)]"
      }`}
    >
      <Icon className={`h-5 w-5 ${activeTab === value ? "text-sky-300" : "text-[var(--muted-foreground)]"}`} />
      {label}
    </button>
  );

  if (!isAuthenticated) return null;

  return (
    <div className="flex h-full min-h-0 overflow-hidden bg-[var(--background)]">
      {/* Sidebar — fixed height, menu scrolls only on small screens */}
      <aside className="flex h-full w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--card)]">
        {/* Back to Home Button */}
        <div className="p-4 border-b border-[var(--border)]">
          <Button 
            asChild 
            variant="outline" 
            className="w-full justify-start text-cyan-400 hover:text-cyan-300 hover:bg-[var(--background)] border-[var(--border)]"
          >
            <Link to="/">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
        </div>

        <div className="p-6 border-b border-[var(--border)] flex items-center gap-3">
          <div className="bg-sky-500 rounded-lg p-2">
            <Gamepad2 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-[var(--foreground)] tracking-tight">Admin Panel</h2>
            <p className="text-xs text-slate-500">Download Your Game</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2 p-4">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" value="dashboard" />
          <SidebarItem icon={BarChart3} label="Analytics" value="analytics" />
          <SidebarItem icon={Gamepad2} label="Manage Games" value="games" />
          <SidebarItem icon={Upload} label={isEditing ? "Edit Game" : "Upload Game"} value="upload" />
          <SidebarItem icon={Tags} label="Categories" value="categories" />
          <SidebarItem icon={Save} label="Game of the Day" value="gameofday" />
          <SidebarItem icon={Sparkles} label="Hero Banner" value="hero" />
          <SidebarItem icon={Settings} label="Site Settings" value="settings" />
        </nav>
        
        <div className="shrink-0 border-t border-slate-200 p-4">
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-[var(--card)]">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-indigo-100 font-bold">
              {adminUsername.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-[var(--foreground)] truncate">{adminUsername}</p>
              <p className="text-xs text-[var(--muted-foreground)]">Administrator</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-900/30 border-[var(--border)]"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Har section (Upload, Categories, Settings, …) — sirf yahan ek scroll */}
      <section
        className="admin-main-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-[var(--background)] p-6 md:p-8"
        aria-label="Admin content"
      >
        {dbNeedsSetup && (
          <div className="mb-6 flex gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-950 dark:text-amber-100">
            <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />
            <div className="space-y-2 text-sm">
              <p className="font-semibold">Database setup required (one time)</p>
              <p>{tablesMissingMessage}</p>
              <p>
                <a
                  href="https://supabase.com/dashboard/project/suyawzhvjfdlbukcyunj/sql/new"
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-sky-600 underline"
                >
                  Open Supabase SQL Editor
                </a>
                {" "}→ copy all code from <code className="rounded bg-black/10 px-1">supabase/schema.sql</code> → Run.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-600/50"
                onClick={() => refreshData().then(() => toast.success("Refreshed"))}
              >
                I ran the SQL — Refresh
              </Button>
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === "dashboard" && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border-[var(--border)] shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-sky-100 rounded-lg"><Gamepad2 className="h-6 w-6 text-sky-600" /></div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Total Games</p>
                    <p className="text-3xl font-bold text-[var(--foreground)]">{games.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 border-[var(--border)] shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-100 rounded-lg"><Tags className="h-6 w-6 text-emerald-600" /></div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Categories</p>
                    <p className="text-3xl font-bold text-[var(--foreground)]">{categories.length}</p>
                  </div>
                </div>
              </Card>
              <Card className="p-6 border-[var(--border)] shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 rounded-lg"><Save className="h-6 w-6 text-purple-600" /></div>
                  <div>
                    <p className="text-sm text-slate-500 font-medium">Total Downloads</p>
                    <p className="text-3xl font-bold text-[var(--foreground)]">
                      {(games.reduce((acc, g) => acc + (g.downloads || 0), 0) / 1000).toFixed(1)}k
                    </p>
                  </div>
                </div>
              </Card>
            </div>
            
            <h2 className="text-xl font-bold text-[var(--foreground)] mt-8 mb-4">Recent Uploads</h2>
            <div className="border border-[var(--border)] rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-[var(--muted)] border-b border-[var(--border)] text-[var(--muted-foreground)] font-medium uppercase">
                  <tr>
                    <th className="px-6 py-4">Game</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {games.slice(0, 5).map(game => (
                    <tr key={game.id} className="hover:bg-[var(--card)]">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img src={game.cover} alt="" className="w-10 h-10 rounded object-cover" />
                        <span className="font-medium text-[var(--foreground)]">{game.title}</span>
                      </td>
                      <td className="px-6 py-4 text-[var(--muted-foreground)]">{game.category}</td>
                      <td className="px-6 py-4 text-[var(--muted-foreground)]">{game.releaseDate || "Recently"}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="h-3 w-3" /> Published
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Manage Games Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Analytics</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 border-[var(--border)] shadow-sm">
                <p className="text-sm text-slate-500 font-medium">Total Site Views</p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{analytics.totalPageViews.toLocaleString()}</p>
                <p className="mt-2 text-xs text-[var(--muted-foreground)]">Last updated {new Date(analytics.lastUpdated).toLocaleDateString()}</p>
              </Card>
              <Card className="p-6 border-[var(--border)] shadow-sm">
                <p className="text-sm text-slate-500 font-medium">Total Game Views</p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{games.reduce((sum, g) => sum + (g.views || 0), 0).toLocaleString()}</p>
              </Card>
              <Card className="p-6 border-[var(--border)] shadow-sm">
                <p className="text-sm text-slate-500 font-medium">Total Downloads</p>
                <p className="text-3xl font-bold text-[var(--foreground)]">{games.reduce((sum, g) => sum + (g.downloads || 0), 0).toLocaleString()}</p>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6 border-[var(--border)] shadow-sm">
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Top Viewed Games</h2>
                <div className="space-y-3">
                  {[...games]
                    .sort((a, b) => (b.views || 0) - (a.views || 0))
                    .slice(0, 4)
                    .map((game) => (
                      <div key={game.id} className="flex items-center justify-between gap-3 rounded-3xl bg-[rgba(255,255,255,0.04)] p-4">
                        <div>
                          <p className="font-medium text-[var(--foreground)]">{game.title}</p>
                          <p className="text-sm text-[var(--muted-foreground)]">{game.category}</p>
                        </div>
                        <span className="text-sm text-slate-400">{(game.views || 0).toLocaleString()} views</span>
                      </div>
                    ))}
                </div>
              </Card>

              <Card className="p-6 border-[var(--border)] shadow-sm">
                <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Top Downloads</h2>
                <div className="space-y-3">
                  {[...games]
                    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
                    .slice(0, 4)
                    .map((game) => (
                      <div key={game.id} className="flex items-center justify-between gap-3 rounded-3xl bg-[rgba(255,255,255,0.04)] p-4">
                        <div>
                          <p className="font-medium text-[var(--foreground)]">{game.title}</p>
                          <p className="text-sm text-[var(--muted-foreground)]">{game.category}</p>
                        </div>
                        <span className="text-sm text-slate-400">{(game.downloads || 0).toLocaleString()} downloads</span>
                      </div>
                    ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "games" && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">Manage Games</h1>
              <Button onClick={() => { resetForm(); setActiveTab("upload"); }} className="bg-sky-500 hover:bg-sky-600 text-white">
                <Plus className="h-4 w-4 mr-2" /> Add New Game
              </Button>
            </div>
            
            <div className="border border-[var(--border)] rounded-xl p-4 flex items-center gap-4 shadow-sm">
              <Search className="h-5 w-5 text-slate-400" />
              <Input placeholder="Search games by title..." className="border-0 shadow-none focus-visible:ring-0 px-0" />
            </div>

            <div className="grid gap-4">
              {games.map(game => (
                <Card key={game.id} className="flex items-center gap-6 p-4 border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
                  <img src={game.cover} alt={game.title} className="w-24 h-16 rounded object-cover" />
                  <div className="flex-1">
                    <h3 className="font-bold text-[var(--foreground)]">{game.title}</h3>
                    <p className="text-sm text-slate-500">{game.category} • {game.developer} • {game.size}</p>
                    <div className="flex gap-2 mt-2">
                      {game.featured && <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-amber-100 text-amber-700 rounded-md">Featured</span>}
                      {game.trending && <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-red-100 text-red-700 rounded-md">Trending</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => editGame(game)} className="text-slate-600 hover:text-sky-600 hover:border-sky-200 hover:bg-sky-50">
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteGame(game.id)} className="text-red-600 hover:text-red-700 hover:border-red-200 hover:bg-red-50">
                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Upload/Edit Form Tab */}
        {activeTab === "upload" && (
          <div className="mx-auto max-w-4xl space-y-6 pb-12">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-[var(--foreground)]">{isEditing ? "Edit Game" : "Upload New Game"}</h1>
              {isEditing && (
                <Button variant="ghost" onClick={() => { resetForm(); setActiveTab("games"); }}>
                  Cancel Editing
                </Button>
              )}
            </div>
            
            <form onSubmit={handleGameSubmit} className="space-y-8">
              <Card className="p-6 border-[var(--border)] shadow-sm">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm">1</span> 
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Game Title</Label>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Input
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                        className="border-[var(--border)]"
                        placeholder="e.g. Need for Speed Heat"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleAutoFill}
                        disabled={isAutoFilling}
                        className="shrink-0 border-violet-300 text-violet-700 hover:bg-violet-50"
                      >
                        <Wand2 className="mr-2 h-4 w-4" />
                        {isAutoFilling ? "Generating…" : "AI Auto-fill"}
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">RAWG + Wikidata + Wikipedia + 400+ game catalog. If you set VITE_OPENAI_API_KEY, the auto-fill will use OpenAI GPT for richer metadata. Tags are SEO-only and screenshots are auto-generated from a free image source.</p>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[var(--foreground)]">Categories (select one or more)</Label>
                    <div className="flex flex-wrap gap-2">
                      {categories.filter((c) => c !== "All").map((c) => {
                        const selected = formData.selectedCategories.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => toggleFormCategory(c)}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                              selected
                                ? "border-sky-500 bg-sky-500 text-white"
                                : "border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-sky-300"
                            }`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Developer / Publisher</Label>
                    <Input value={formData.developer} onChange={e => setFormData({...formData, developer: e.target.value})} className="border-[var(--border)]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">File Size</Label>
                    <Input value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} placeholder="e.g. 45 GB" className="border-[var(--border)]" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[var(--foreground)]">Description</Label>
                    <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="min-h-[200px] border-[var(--border)]" required />
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-[var(--border)] shadow-sm">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm">2</span>
                  Download Details
                </h3>
                <DownloadPartsEditor
                  useMultiPart={formData.useMultiPart}
                  downloadLink={formData.downloadLink}
                  downloadParts={formData.downloadParts}
                  filePassword={formData.filePassword}
                  onChange={(patch) => setFormData({ ...formData, ...patch })}
                />
              </Card>

              <Card className="p-6 border-[var(--border)] shadow-sm">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm">3</span>
                  Media & Screenshots
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Cover Image URL</Label>
                    <Input type="url" value={formData.cover} onChange={e => setFormData({...formData, cover: e.target.value})} required className="border-[var(--border)]" placeholder="https://..." />
                    <p className="text-xs text-slate-500">Use a direct image URL that ends with .jpg, .png, or .webp. Google Drive share links usually do not work.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Homepage Hero Animation Image/Video URL</Label>
                    <Input type="url" value={formData.heroMedia} onChange={e => setFormData({...formData, heroMedia: e.target.value})} className="border-[var(--border)]" placeholder="Separate image/video for homepage carousel" />
                    <p className="text-xs text-slate-500">Used only on the homepage hero slider. Leave empty to use background image or cover.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Game Page Background Media URL</Label>
                    <Input type="url" value={formData.backgroundImage} onChange={e => setFormData({...formData, backgroundImage: e.target.value})} className="border-[var(--border)]" placeholder="YouTube / video / image URL" />
                    <p className="text-xs text-slate-500">Shown on the game detail page header (not the homepage carousel).</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">SEO Tags — hidden, Google only (comma separated)</Label>
                    <Input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="border-[var(--border)]" placeholder="game name download, free pc, repack, full version..." />
                    <p className="text-xs text-slate-500">Visitors will NOT see these. They go in page meta for search engines only.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Trailer Video URL</Label>
                    <Input type="url" value={formData.trailer} onChange={e => setFormData({...formData, trailer: e.target.value})} className="border-[var(--border)]" placeholder="https://... .mp4" />
                    <p className="text-xs text-slate-500">Use a direct MP4 URL. Google Drive share links usually do not work here.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-[var(--foreground)]">Screenshots</Label>
                      <Button type="button" size="sm" variant="outline" onClick={() => setFormData({...formData, screenshots: [...formData.screenshots, ""]})}>
                        <Plus className="h-3 w-3 mr-1" /> Add Image
                      </Button>
                    </div>
                    {formData.screenshots.map((s, i) => (
                      <div key={i} className="flex gap-2">
                        <Input value={s} onChange={e => {
                          const newS = [...formData.screenshots];
                          newS[i] = e.target.value;
                          setFormData({...formData, screenshots: newS});
                        }} className="border-[var(--border)]" placeholder="Screenshot URL..." />
                        {formData.screenshots.length > 1 && (
                          <Button type="button" variant="outline" onClick={() => setFormData({...formData, screenshots: formData.screenshots.filter((_, idx) => idx !== i)})} className="text-red-500 px-3">
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              
              <Card className="p-6 border-[var(--border)] shadow-sm">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm">4</span>
                  System Requirements
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Minimum OS</Label>
                    <Input value={formData.systemRequirements.minimum.os} onChange={e => setFormData({...formData, systemRequirements: {...formData.systemRequirements, minimum: {...formData.systemRequirements.minimum, os: e.target.value}}})} className="border-[var(--border)]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Recommended OS</Label>
                    <Input value={formData.systemRequirements.recommended.os} onChange={e => setFormData({...formData, systemRequirements: {...formData.systemRequirements, recommended: {...formData.systemRequirements.recommended, os: e.target.value}}})} className="border-[var(--border)]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Minimum Processor</Label>
                    <Input value={formData.systemRequirements.minimum.processor} onChange={e => setFormData({...formData, systemRequirements: {...formData.systemRequirements, minimum: {...formData.systemRequirements.minimum, processor: e.target.value}}})} className="border-[var(--border)]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Recommended Processor</Label>
                    <Input value={formData.systemRequirements.recommended.processor} onChange={e => setFormData({...formData, systemRequirements: {...formData.systemRequirements, recommended: {...formData.systemRequirements.recommended, processor: e.target.value}}})} className="border-[var(--border)]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Minimum Memory</Label>
                    <Input value={formData.systemRequirements.minimum.memory} onChange={e => setFormData({...formData, systemRequirements: {...formData.systemRequirements, minimum: {...formData.systemRequirements.minimum, memory: e.target.value}}})} className="border-[var(--border)]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Recommended Memory</Label>
                    <Input value={formData.systemRequirements.recommended.memory} onChange={e => setFormData({...formData, systemRequirements: {...formData.systemRequirements, recommended: {...formData.systemRequirements.recommended, memory: e.target.value}}})} className="border-[var(--border)]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Minimum Graphics</Label>
                    <Input value={formData.systemRequirements.minimum.graphics} onChange={e => setFormData({...formData, systemRequirements: {...formData.systemRequirements, minimum: {...formData.systemRequirements.minimum, graphics: e.target.value}}})} className="border-[var(--border)]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Recommended Graphics</Label>
                    <Input value={formData.systemRequirements.recommended.graphics} onChange={e => setFormData({...formData, systemRequirements: {...formData.systemRequirements, recommended: {...formData.systemRequirements.recommended, graphics: e.target.value}}})} className="border-[var(--border)]" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[var(--foreground)]">Minimum Storage</Label>
                    <Input value={formData.systemRequirements.minimum.storage} onChange={e => setFormData({...formData, systemRequirements: {...formData.systemRequirements, minimum: {...formData.systemRequirements.minimum, storage: e.target.value}}})} className="border-[var(--border)]" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[var(--foreground)]">Recommended Storage</Label>
                    <Input value={formData.systemRequirements.recommended.storage} onChange={e => setFormData({...formData, systemRequirements: {...formData.systemRequirements, recommended: {...formData.systemRequirements.recommended, storage: e.target.value}}})} className="border-[var(--border)]" />
                  </div>
                </div>
              </Card>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setActiveTab("games")}>Cancel</Button>
                <Button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white">
                  <Save className="h-4 w-4 mr-2" /> {isEditing ? "Save Changes" : "Publish Game"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Manage Categories</h1>
            <Card className="p-6 border-[var(--border)] shadow-sm">
              <div className="flex gap-2 mb-6">
                <Input placeholder="New Category Name..." className="border-[var(--border)]" id="new-category" />
                <Button onClick={async () => {
                  const val = (document.getElementById('new-category') as HTMLInputElement).value;
                  if (val && !categories.includes(val)) {
                    const newCategories = [...categories, val];
                    setCategories(newCategories);
                    try {
                      await saveCategories(newCategories);
                      toast.success("Category added");
                      (document.getElementById('new-category') as HTMLInputElement).value = '';
                    } catch (error) {
                      handleSaveError(error);
                    }
                  }
                }} className="bg-sky-500 text-white hover:bg-sky-600"><Plus className="h-4 w-4 mr-2"/> Add</Button>
              </div>
              
              <div className="space-y-2">
                {categories.map(cat => (
                  <div key={cat} className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg bg-[var(--card)] hover:bg-[var(--muted)]">
                    <span className="font-medium text-[var(--foreground)]">{cat}</span>
                    {cat !== "All" && (
                      <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={async () => {
                        const newCategories = categories.filter(c => c !== cat);
                        setCategories(newCategories);
                        try {
                          await saveCategories(newCategories);
                          toast.success("Category removed");
                        } catch (error) {
                          handleSaveError(error);
                        }
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Global Settings</h1>
            
            <Card className="p-6 border-[var(--border)] shadow-sm space-y-6">
              <div className="space-y-2">
                <Label className="text-[var(--foreground)]">Site Name</Label>
                <Input value={settings.siteName} onChange={e => setSettings({...settings, siteName: e.target.value})} className="border-[var(--border)]" />
              </div>
              
              <div className="space-y-2">
                <Label className="text-[var(--foreground)]">Site Logo URL</Label>
                <Input value={settings.logoUrl} onChange={e => setSettings({...settings, logoUrl: e.target.value})} className="border-[var(--border)]" />
                <p className="text-xs text-slate-500 mt-1">Paste a direct image URL. Shown in navbar and browser tab.</p>
                {settings.logoUrl ? (
                  <img src={settings.logoUrl} alt="Logo preview" className="mt-2 h-16 w-16 rounded-full object-cover border border-[var(--border)]" />
                ) : null}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[var(--foreground)]">Show Trending Section</Label>
                  <Switch checked={settings.showTrendingGames} onCheckedChange={value => setSettings({...settings, showTrendingGames: value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--foreground)]">Show Latest Games</Label>
                  <Switch checked={settings.showLatestGames} onCheckedChange={value => setSettings({...settings, showLatestGames: value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[var(--foreground)]">Show Game of the Day</Label>
                  <Switch checked={settings.showGameOfTheDay} onCheckedChange={value => setSettings({...settings, showGameOfTheDay: value})} />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={async () => {
                  try {
                    await saveSiteSettings(settings);
                    document.documentElement.classList.toggle("dark", settings.theme === "dark");
                    toast.success("Settings saved successfully!");
                  } catch (error) {
                    handleSaveError(error);
                  }
                }} className="bg-sky-500 hover:bg-sky-600 text-white">
                  <Save className="h-4 w-4 mr-2" /> Save Global Settings
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Hero Banner Tab */}
        {activeTab === "hero" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Homepage Hero Banner (max 6)</h1>
            <p className="text-sm text-slate-500">Select games for the top homepage carousel. Add a separate Hero Animation URL when uploading each game.</p>
            <Card className="p-6 border-[var(--border)] shadow-sm space-y-3">
              {games.map((game) => (
                <label key={game.id} className="flex cursor-pointer items-center gap-4 rounded-lg border border-[var(--border)] p-3 hover:bg-[var(--muted)]">
                  <input
                    type="checkbox"
                    checked={heroSelection.includes(game.id)}
                    onChange={() => {
                      setHeroSelection((prev) => {
                        if (prev.includes(game.id)) return prev.filter((id) => id !== game.id);
                        if (prev.length >= 6) {
                          toast.error("Maximum 6 hero games allowed");
                          return prev;
                        }
                        return [...prev, game.id];
                      });
                    }}
                    className="h-4 w-4"
                  />
                  <img src={game.cover} alt="" className="h-14 w-20 rounded object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold text-[var(--foreground)]">{game.title}</p>
                    <p className="text-xs text-slate-500">{game.category}</p>
                  </div>
                </label>
              ))}
              <Button
                className="bg-sky-500 hover:bg-sky-600 text-white"
                onClick={async () => {
                  const updated = enforceHeroLimit(games, heroSelection);
                  setGames(updated);
                  try {
                    await saveGames(updated);
                    toast.success("Hero banner updated!");
                  } catch (error) {
                    handleSaveError(error);
                  }
                }}
              >
                <Save className="h-4 w-4 mr-2" /> Save Hero Games ({heroSelection.length}/6)
              </Button>
            </Card>
          </div>
        )}

        {/* Game of the Day Tab */}
        {activeTab === "gameofday" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Manage Game of the Day</h1>
            
            <Card className="p-6 border-[var(--border)] shadow-sm space-y-6">
              <div className="space-y-2">
                <Label className="text-[var(--foreground)]">Select Game of the Day</Label>
                <Select value={dailyGameId} onValueChange={setDailyGameId}>
                  <SelectTrigger className="border-[var(--border)]">
                    <SelectValue placeholder="Choose a game..." />
                  </SelectTrigger>
                  <SelectContent>
                    {games.map(game => (
                      <SelectItem key={game.id} value={game.id}>
                        {game.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDailyGameId("")} className="border-[var(--border)]">
                  Clear
                </Button>
                <Button onClick={async () => {
                  const updatedGames = games.map(g => ({
                    ...g,
                    gameOfTheDay: g.id === dailyGameId
                  }));
                  setGames(updatedGames);
                  try {
                    await saveGames(updatedGames);
                    toast.success("Game of the Day updated!");
                  } catch (error) {
                    handleSaveError(error);
                  }
                }} className="bg-sky-500 hover:bg-sky-600 text-white">
                  <Save className="h-4 w-4 mr-2" /> Set as Game of the Day
                </Button>
              </div>
            </Card>

            <Card className="p-6 border-[var(--border)] shadow-sm">
              <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Current Game of the Day</h2>
              {games.find(g => g.gameOfTheDay) ? (
                <div className="flex items-center gap-4 p-4 border border-[var(--border)] rounded-lg">
                  <img src={games.find(g => g.gameOfTheDay)!.cover} alt="cover" className="w-20 h-20 rounded object-cover" />
                  <div className="flex-1">
                    <p className="font-semibold text-[var(--foreground)]">{games.find(g => g.gameOfTheDay)?.title}</p>
                    <p className="text-sm text-slate-500">{games.find(g => g.gameOfTheDay)?.category}</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
              ) : (
                <div className="flex items-center gap-2 p-4 border border-dashed border-[var(--border)] rounded-lg text-slate-500">
                  <XCircle className="h-5 w-5" />
                  No game selected
                </div>
              )}
            </Card>
          </div>
        )}

      </section>
    </div>
  );
}




