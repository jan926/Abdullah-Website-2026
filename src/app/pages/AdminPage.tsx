import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { Game, categories as initialCategories, DownloadPart } from "../data/games";
import { loadGames, saveGames, loadSiteSettings, saveSiteSettings, SiteSettings, loadCategories, saveCategories, loadSiteAnalytics, SiteAnalytics } from "../../lib/gameStore";
import { generateGameDescription, generateDeveloperName, generateSystemRequirements, isOllamaRunning } from "../../lib/ollamaHelper";
import { 
  Upload, Trash2, Edit, Plus, LogOut, LayoutDashboard, Gamepad2, 
  Tags, Settings, Search, Save, CheckCircle2, XCircle, Home, BarChart3, Zap, Loader
} from "lucide-react";
import { toast } from "sonner";

export default function AdminPage() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUsername, setAdminUsername] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Data State
  const [games, setGames] = useState<Game[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [dailyGameId, setDailyGameId] = useState<string>("");
  const [analytics, setAnalytics] = useState<SiteAnalytics>(loadSiteAnalytics());
  
  // New Game Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditId, setCurrentEditId] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    cover: "",
    heroMedia: "",
    backgroundImage: "",
    size: "",
    developer: "",
    downloadLink: "",
    filePassword: "",
    downloadParts: [{id: "1", name: "", link: "", size: ""}],
    trailer: "",
    screenshots: [""],
    systemRequirements: {
      minimum: { os: "", processor: "", memory: "", graphics: "", storage: "" },
      recommended: { os: "", processor: "", memory: "", graphics: "", storage: "" },
    },
    featured: false,
    trending: false,
    gameOfTheDay: false,
  });

  // Settings State
  const [settings, setSettings] = useState<SiteSettings>(loadSiteSettings());
  const [heroSelectId, setHeroSelectId] = useState<string>("");

  // AI Generation State
  const [aiLoading, setAiLoading] = useState(false);
  const [ollamaAvailable, setOllamaAvailable] = useState(false);

  const handleGenerateDescription = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a game title first");
      return;
    }

    setAiLoading(true);
    try {
      const description = await generateGameDescription(formData.title);
      setFormData({ ...formData, description });
      toast.success("Description generated!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate description");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateDeveloper = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a game title first");
      return;
    }

    setAiLoading(true);
    try {
      const developer = await generateDeveloperName(formData.title);
      setFormData({ ...formData, developer });
      toast.success("Developer name generated!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate developer name");
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateSystemRequirements = async () => {
    if (!formData.title.trim()) {
      toast.error("Please enter a game title first");
      return;
    }

    setAiLoading(true);
    try {
      const requirements = await generateSystemRequirements(formData.title);
      setFormData({
        ...formData,
        systemRequirements: requirements,
      });
      toast.success("System requirements generated!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate system requirements");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    // Check if Ollama is available
    isOllamaRunning().then(setOllamaAvailable);
    
    const authenticated = localStorage.getItem("adminAuthenticated");
    const username = localStorage.getItem("adminUsername");
    
    if (authenticated === "true" && username) {
      setIsAuthenticated(true);
      setAdminUsername(username);
    } else {
      navigate("/admin/login");
      return;
    }

    const storedGames = loadGames();
    setGames(storedGames);
    setDailyGameId(storedGames.find((game) => game.gameOfTheDay)?.id ?? "");
    setSettings(loadSiteSettings());
    setCategories(loadCategories());
    setAnalytics(loadSiteAnalytics());
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("adminUsername");
    toast.success("Logged out successfully");
    navigate("/admin/login");
  };

  const handleGameSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditing) {
      const updatedGames = games.map((g) => {
        if (g.id !== currentEditId) {
          return formData.gameOfTheDay ? { ...g, gameOfTheDay: false } : g;
        }
        return { ...g, ...formData } as Game;
      });
      setGames(updatedGames);
      saveGames(updatedGames);
      toast.success("Game updated successfully!");
    } else {
      const newGame: Game = {
        id: Math.random().toString(36).substr(2, 9),
        title: formData.title,
        category: formData.category,
        description: formData.description,
        cover: formData.cover,
        heroMedia: formData.heroMedia,
        size: formData.size,
        developer: formData.developer,
        downloadLink: formData.downloadLink,
        filePassword: formData.filePassword,
        downloadParts: formData.downloadParts?.filter(p => p.link),
        trailer: formData.trailer,
        backgroundImage: formData.backgroundImage,
        screenshots: formData.screenshots.filter(Boolean),
        featured: formData.featured,
        trending: formData.trending,
        gameOfTheDay: formData.gameOfTheDay,
        rating: 0,
        downloads: 0,
        releaseDate: new Date().toISOString().split("T")[0],
        systemRequirements: formData.systemRequirements,
        comments: []
      };

      const updatedGames = formData.gameOfTheDay
        ? [newGame, ...games.map((g) => ({ ...g, gameOfTheDay: false }))]
        : [newGame, ...games];

      setGames(updatedGames);
      saveGames(updatedGames);
      toast.success("Game uploaded successfully!");
    }

    resetForm();
    setActiveTab("games");
  };

  const editGame = (game: Game) => {
    setFormData({
      title: game.title,
      category: game.category,
      description: game.description,
      cover: game.cover,
      heroMedia: game.heroMedia || "",
      backgroundImage: game.backgroundImage || "",
      size: game.size,
      developer: game.developer,
      downloadLink: game.downloadLink,
      filePassword: game.filePassword || "",
      downloadParts: game.downloadParts || [{id: "1", name: "", link: "", size: ""}],
      trailer: game.trailer || "",
      screenshots: [...game.screenshots],
      systemRequirements: game.systemRequirements || {
        minimum: { os: "", processor: "", memory: "", graphics: "", storage: "" },
        recommended: { os: "", processor: "", memory: "", graphics: "", storage: "" }
      },
      featured: game.featured || false,
      trending: game.trending || false,
      gameOfTheDay: game.gameOfTheDay || false,
    });
    setIsEditing(true);
    setCurrentEditId(game.id);
    setActiveTab("upload");
  };

  const deleteGame = (id: string) => {
    if (confirm("Are you sure you want to delete this game?")) {
      const updatedGames = games.filter(g => g.id !== id);
      setGames(updatedGames);
      saveGames(updatedGames);
      toast.success("Game deleted");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      description: "",
      cover: "",
      heroMedia: "",
      backgroundImage: "",
      size: "",
      developer: "",
      downloadLink: "",
      filePassword: "",
      downloadParts: [{id: "1", name: "", link: "", size: ""}],
      trailer: "",
      screenshots: [""],
      systemRequirements: {
        minimum: { os: "", processor: "", memory: "", graphics: "", storage: "" },
        recommended: { os: "", processor: "", memory: "", graphics: "", storage: "" },
      },
      featured: false,
      trending: false,
      gameOfTheDay: false,
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
    <div className="flex h-screen bg-[var(--background)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-[var(--card)] border-r border-[var(--border)] flex flex-col">
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
        
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" value="dashboard" />
          <SidebarItem icon={BarChart3} label="Analytics" value="analytics" />
          <SidebarItem icon={Gamepad2} label="Manage Games" value="games" />
          <SidebarItem icon={Upload} label={isEditing ? "Edit Game" : "Upload Game"} value="upload" />
          <SidebarItem icon={Tags} label="Categories" value="categories" />
          <SidebarItem icon={Home} label="Homepage Hero" value="homepagehero" />
          <SidebarItem icon={Save} label="Game of the Day" value="gameofday" />
          <SidebarItem icon={Settings} label="Site Settings" value="settings" />
        </div>
        
        <div className="p-4 border-t border-slate-200">
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
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto bg-[var(--background)] p-8">
        
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
          <div className="max-w-4xl mx-auto space-y-6 pb-20">
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
                  {ollamaAvailable && (
                    <span className="ml-auto text-xs px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded-full flex items-center gap-1">
                      <Zap className="h-3 w-3" /> AI Ready
                    </span>
                  )}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Game Title</Label>
                    <Input value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required className="border-[var(--border)]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Category</Label>
                    <Select value={formData.category} onValueChange={v => setFormData({...formData, category: v})}>
                      <SelectTrigger className="border-[var(--border)]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.filter(c => c !== "All").map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[var(--foreground)]">Developer / Publisher</Label>
                      {ollamaAvailable && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleGenerateDeveloper}
                          disabled={aiLoading || !formData.title.trim()}
                          className="text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10"
                        >
                          {aiLoading ? (
                            <>
                              <Loader className="h-3 w-3 mr-1 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Zap className="h-3 w-3 mr-1" />
                              Generate
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <Input value={formData.developer} onChange={e => setFormData({...formData, developer: e.target.value})} className="border-[var(--border)]" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">File Size</Label>
                    <Input value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} placeholder="e.g. 45 GB" className="border-[var(--border)]" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-[var(--foreground)]">Description</Label>
                      {ollamaAvailable && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleGenerateDescription}
                          disabled={aiLoading || !formData.title.trim()}
                          className="text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10"
                        >
                          {aiLoading ? (
                            <>
                              <Loader className="h-3 w-3 mr-1 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Zap className="h-3 w-3 mr-1" />
                              Generate
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                    <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="h-32 border-[var(--border)]" required />
                  </div>
                </div>
              </Card>

              <Card className="p-6 border-[var(--border)] shadow-sm">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm">2</span>
                  Media & Links
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Cover Image URL</Label>
                    <Input type="url" value={formData.cover} onChange={e => setFormData({...formData, cover: e.target.value})} required className="border-[var(--border)]" placeholder="https://..." />
                    <p className="text-xs text-slate-500">Use a direct image URL that ends with .jpg, .png, or .webp. Google Drive share links usually do not work.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Homepage Hero Image URL</Label>
                    <Input type="url" value={formData.heroMedia} onChange={e => setFormData({...formData, heroMedia: e.target.value})} className="border-[var(--border)]" placeholder="https://..." />
                    <p className="text-xs text-slate-500">Optional hero image used on the homepage animation slider. If set, it overrides the first screenshot or background media.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Background Media URL</Label>
                    <Input type="url" value={formData.backgroundImage} onChange={e => setFormData({...formData, backgroundImage: e.target.value})} className="border-[var(--border)]" placeholder="YouTube / video / image URL" />
                    <p className="text-xs text-slate-500">Optional background media for the game hero/banner. Supports YouTube, MP4/WebM, direct image URLs, Google Drive, and Dropbox links.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">Main Download Link</Label>
                    <Input type="url" value={formData.downloadLink} onChange={e => setFormData({...formData, downloadLink: e.target.value})} required className="border-[var(--border)]" placeholder="magnet:?xt=... or https://..." />
                    <p className="text-xs text-slate-500">Primary download link. Optional if using download parts.</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[var(--foreground)]">File Password</Label>
                    <Input value={formData.filePassword} onChange={e => setFormData({...formData, filePassword: e.target.value})} className="border-[var(--border)]" placeholder="Password for the download file" />
                    <p className="text-xs text-slate-500">Optional password that will be displayed beneath the download button on the game page.</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-[var(--foreground)]">Download Parts (Multi-Part)</Label>
                      <Button type="button" size="sm" variant="outline" onClick={() => {
                        const newId = Math.random().toString(36).substr(2, 9);
                        setFormData({...formData, downloadParts: [...(formData.downloadParts || []), {id: newId, name: "", link: "", size: ""}]});
                      }}>
                        <Plus className="h-3 w-3 mr-1" /> Add Part
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500">For multi-part games (e.g., Part 1, Part 2). Leave empty if using a single main download link.</p>
                    {formData.downloadParts?.map((part, i) => (
                      <div key={part.id} className="space-y-2 p-3 border border-[var(--border)] rounded-lg bg-[rgba(255,255,255,0.02)]">
                        <div className="flex gap-2">
                          <Input value={part.name} onChange={e => {
                            const newParts = [...(formData.downloadParts || [])];
                            newParts[i].name = e.target.value;
                            setFormData({...formData, downloadParts: newParts});
                          }} className="border-[var(--border)] flex-1" placeholder="e.g. Part 1, Part 2" />
                          {(formData.downloadParts?.length || 0) > 1 && (
                            <Button type="button" variant="outline" onClick={() => setFormData({...formData, downloadParts: formData.downloadParts?.filter((_, idx) => idx !== i)})} className="text-red-500 px-3">
                              <XCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <Input type="url" value={part.link} onChange={e => {
                          const newParts = [...(formData.downloadParts || [])];
                          newParts[i].link = e.target.value;
                          setFormData({...formData, downloadParts: newParts});
                        }} className="border-[var(--border)]" placeholder="Download link for this part" />
                        <Input value={part.size || ""} onChange={e => {
                          const newParts = [...(formData.downloadParts || [])];
                          newParts[i].size = e.target.value;
                          setFormData({...formData, downloadParts: newParts});
                        }} className="border-[var(--border)]" placeholder="Size (optional, e.g. 5 GB)" />
                      </div>
                    ))}
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
                    <p className="text-xs text-slate-500">Use a direct image URL (.jpg/.png/.webp) or short video URL (.mp4/.webm/.ogg). The first screenshot is also used as the homepage hero fallback when no background media is set.</p>
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
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm">3</span> 
                  Visibility Settings
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                    <div>
                      <Label className="text-base text-[var(--foreground)] font-semibold">Featured Game</Label>
                      <p className="text-sm text-[var(--muted-foreground)]">Show this game in the large featured hero banner on the homepage.</p>
                    </div>
                    <Switch checked={formData.featured} onCheckedChange={c => setFormData({...formData, featured: c})} />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                    <div>
                      <Label className="text-base text-[var(--foreground)] font-semibold">Trending / Popular</Label>
                      <p className="text-sm text-[var(--muted-foreground)]">Add a 'Trending' badge and show in Most Viewed sections.</p>
                    </div>
                    <Switch checked={formData.trending} onCheckedChange={c => setFormData({...formData, trending: c})} />
                  </div>
                  <div className="flex items-center justify-between p-4 border border-[var(--border)] rounded-lg">
                    <div>
                      <Label className="text-base text-[var(--foreground)] font-semibold">Game of the Day</Label>
                      <p className="text-sm text-[var(--muted-foreground)]">Promote this game as the daily highlighted release.</p>
                    </div>
                    <Switch checked={formData.gameOfTheDay} onCheckedChange={c => setFormData({...formData, gameOfTheDay: c})} />
                  </div>
                </div>
              </Card>
              <Card className="p-6 border-[var(--border)] shadow-sm">
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-6 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-sm">4</span>
                  System Requirements
                  {ollamaAvailable && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleGenerateSystemRequirements}
                      disabled={aiLoading || !formData.title.trim()}
                      className="ml-auto text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/10"
                    >
                      {aiLoading ? (
                        <>
                          <Loader className="h-3 w-3 mr-1 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-3 w-3 mr-1" />
                          Generate All
                        </>
                      )}
                    </Button>
                  )}
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
                <Button onClick={() => {
                  const val = (document.getElementById('new-category') as HTMLInputElement).value;
                  if (val && !categories.includes(val)) {
                    const newCategories = [...categories, val];
                    setCategories(newCategories);
                    saveCategories(newCategories);
                    toast.success("Category added");
                    (document.getElementById('new-category') as HTMLInputElement).value = '';
                  }
                }} className="bg-sky-500 text-white hover:bg-sky-600"><Plus className="h-4 w-4 mr-2"/> Add</Button>
              </div>
              
              <div className="space-y-2">
                {categories.map(cat => (
                  <div key={cat} className="flex items-center justify-between p-3 border border-[var(--border)] rounded-lg bg-[var(--card)] hover:bg-[var(--muted)]">
                    <span className="font-medium text-[var(--foreground)]">{cat}</span>
                    {cat !== "All" && (
                      <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => {
                        const newCategories = categories.filter(c => c !== cat);
                        setCategories(newCategories);
                        saveCategories(newCategories);
                        toast.success("Category removed");
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

        {/* Homepage Hero Tab */}
        {activeTab === "homepagehero" && (
          <div className="max-w-4xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-[var(--foreground)]">Homepage Hero Slider</h1>
            <Card className="p-6 border-[var(--border)] shadow-sm space-y-6">
              <div className="space-y-2">
                <Label className="text-[var(--foreground)]">Choose Hero Slider Games</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Select value={heroSelectId} onValueChange={setHeroSelectId}>
                    <SelectTrigger className="border-[var(--border)]">
                      <SelectValue placeholder="Select a game to add" />
                    </SelectTrigger>
                    <SelectContent>
                      {games.map(game => (
                        <SelectItem key={game.id} value={game.id}>{game.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => {
                      if (!heroSelectId) return;
                      if (settings.heroSliderGameIds.includes(heroSelectId)) {
                        toast.error("Game is already in the hero slider");
                        return;
                      }
                      if (settings.heroSliderGameIds.length >= 6) {
                        toast.error("Hero slider can contain up to 6 games");
                        return;
                      }
                      setSettings({
                        ...settings,
                        heroSliderGameIds: [...settings.heroSliderGameIds, heroSelectId],
                      });
                      setHeroSelectId("");
                    }}
                    className="bg-sky-500 hover:bg-sky-600 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add to Slider
                  </Button>
                </div>
                <p className="text-xs text-slate-500">Select up to 6 games that should appear in the homepage hero animation.</p>
              </div>

              <div className="space-y-4">
                {settings.heroSliderGameIds.length === 0 ? (
                  <p className="text-sm text-[var(--muted-foreground)]">No hero games selected yet.</p>
                ) : (
                  settings.heroSliderGameIds.map((id, index) => {
                    const game = games.find((g) => g.id === id);
                    if (!game) return null;

                    return (
                      <div key={id} className="flex flex-col md:flex-row items-start md:items-center gap-3 p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
                        <div className="flex items-center gap-3 flex-1">
                          <img src={game.cover} alt={game.title} className="w-20 h-20 rounded-lg object-cover" />
                          <div>
                            <p className="font-semibold text-[var(--foreground)]">{game.title}</p>
                            <p className="text-sm text-[var(--muted-foreground)]">{game.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={index === 0}
                            onClick={() => {
                              const newOrder = [...settings.heroSliderGameIds];
                              [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
                              setSettings({ ...settings, heroSliderGameIds: newOrder });
                            }}
                          >
                            Up
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={index === settings.heroSliderGameIds.length - 1}
                            onClick={() => {
                              const newOrder = [...settings.heroSliderGameIds];
                              [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                              setSettings({ ...settings, heroSliderGameIds: newOrder });
                            }}
                          >
                            Down
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => setSettings({
                              ...settings,
                              heroSliderGameIds: settings.heroSliderGameIds.filter((gameId) => gameId !== id),
                            })}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => {
                    saveSiteSettings(settings);
                    toast.success("Homepage hero games saved successfully!");
                  }}
                  className="bg-sky-500 hover:bg-sky-600 text-white"
                >
                  <Save className="h-4 w-4 mr-2" /> Save Hero Slider
                </Button>
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
                <p className="text-xs text-slate-500 mt-1">Accepts standard image URLs or figma:asset paths.</p>
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
                <Button onClick={() => {
                  saveSiteSettings(settings);
                  document.documentElement.classList.toggle("dark", settings.theme === "dark");
                  toast.success("Settings saved successfully!");
                }} className="bg-sky-500 hover:bg-sky-600 text-white">
                  <Save className="h-4 w-4 mr-2" /> Save Global Settings
                </Button>
              </div>
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
                <Button onClick={() => {
                  const updatedGames = games.map(g => ({
                    ...g,
                    gameOfTheDay: g.id === dailyGameId
                  }));
                  setGames(updatedGames);
                  saveGames(updatedGames);
                  toast.success("Game of the Day updated!");
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

      </div>
    </div>
  );
}
