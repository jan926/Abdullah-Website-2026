// AdminDashboard – Cyberpunk Dark Gaming Platform Admin CRUD Portal
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  gameService,
  type Game,
  type CreateGameInput,
} from "@/services/gameService";
import { LoadingSpinner } from "@/app/components/common/LoadingSpinner";
import {
  Gamepad2,
  Download,
  Star,
  Search,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  X,
  LayoutDashboard,
  List,
  FilePlus2,
  CheckCircle2,
  AlertCircle,
  Info,
  Eye,
  EyeOff,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type ActiveTab = "overview" | "games" | "editor";

interface DashboardStats {
  totalGames: number;
  totalUsers: number;
  totalDownloads: number;
}

interface ToastState {
  message: string;
  type: "success" | "error" | "info";
}

interface FormData {
  title: string;
  developer: string;
  publisher: string;
  category_id: string;
  cover_image_url: string;
  release_date: string;
  file_size_mb: string;
  description: string;
  long_description: string;
  is_featured: boolean;
  is_visible: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_FORM: FormData = {
  title: "",
  developer: "",
  publisher: "",
  category_id: "",
  cover_image_url: "",
  release_date: "",
  file_size_mb: "",
  description: "",
  long_description: "",
  is_featured: false,
  is_visible: true,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidUrl(url: string): boolean {
  if (!url.trim()) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "—";
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

// ─── Toast style map ──────────────────────────────────────────────────────────

const TOAST_STYLES: Record<ToastState["type"], React.CSSProperties> = {
  success: {
    background: "rgba(22, 163, 74, 0.12)",
    borderColor: "rgba(34, 197, 94, 0.5)",
    boxShadow: "0 0 24px rgba(34, 197, 94, 0.15)",
  },
  error: {
    background: "rgba(220, 38, 38, 0.12)",
    borderColor: "rgba(239, 68, 68, 0.5)",
    boxShadow: "0 0 24px rgba(239, 68, 68, 0.15)",
  },
  info: {
    background: "rgba(37, 99, 235, 0.12)",
    borderColor: "rgba(59, 130, 246, 0.5)",
    boxShadow: "0 0 24px rgba(59, 130, 246, 0.15)",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Toast helpers ──────────────────────────────────────────────────────────

  const showToast = useCallback((message: string, type: ToastState["type"]) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ message, type });
    toastTimer.current = setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 3000);
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
    setToast(null);
  }, []);

  // ── Form helpers ───────────────────────────────────────────────────────────

  const resetForm = useCallback(() => {
    setFormData(EMPTY_FORM);
  }, []);

  const populateForm = useCallback((game: Game) => {
    setFormData({
      title: game.title ?? "",
      developer: game.developer ?? "",
      publisher: game.publisher ?? "",
      category_id: game.category_id ?? "",
      cover_image_url: game.cover_image_url ?? "",
      release_date: game.release_date ?? "",
      file_size_mb: game.file_size_mb != null ? String(game.file_size_mb) : "",
      description: game.description ?? "",
      long_description: game.long_description ?? "",
      is_featured: game.is_featured ?? false,
      is_visible: game.is_visible ?? true,
    });
  }, []);

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // ── Data loaders ───────────────────────────────────────────────────────────

  const loadGames = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await gameService.getGames({ limit: 1000 });
      setGames(data);
    } catch (err) {
      console.error("[AdminDashboard] loadGames:", err);
      showToast("Failed to load games.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const loadStats = useCallback(async (gameList: Game[]) => {
    const derived: DashboardStats = {
      totalGames: gameList.length,
      totalUsers: 0,
      totalDownloads: gameList.reduce(
        (s, g) => s + (g.total_downloads ?? 0),
        0,
      ),
    };

    if (supabase) {
      try {
        const { count } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .neq("banned", true);
        derived.totalUsers = count ?? 0;
      } catch {
        // Table may not exist — silently skip
      }
    }

    setStats(derived);
  }, []);

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadGames();
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [loadGames]);

  useEffect(() => {
    if (!isLoading) loadStats(games);
  }, [games, isLoading, loadStats]);

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      const fileSizeMb = parseFloat(formData.file_size_mb) || 0;

      if (editingGame) {
        // UPDATE
        const updates: Partial<Game> = {
          title: formData.title,
          developer: formData.developer,
          publisher: formData.publisher,
          category_id: formData.category_id,
          cover_image_url: formData.cover_image_url,
          release_date: formData.release_date,
          file_size_mb: fileSizeMb,
          description: formData.description,
          long_description: formData.long_description || undefined,
          is_featured: formData.is_featured,
          is_visible: formData.is_visible,
        };

        const updated = await gameService.updateGame(editingGame.id, updates);
        if (updated) {
          setGames((prev) =>
            prev.map((g) => (g.id === updated.id ? updated : g)),
          );
          showToast(`"${updated.title}" updated successfully.`, "success");
          setEditingGame(null);
          resetForm();
          setActiveTab("games");
        } else {
          showToast(
            "Failed to update game. Check the console for details.",
            "error",
          );
        }
      } else {
        // CREATE
        const input: CreateGameInput = {
          title: formData.title,
          description: formData.description,
          long_description: formData.long_description || undefined,
          category_id: formData.category_id,
          cover_image_url: formData.cover_image_url,
          developer: formData.developer,
          publisher: formData.publisher,
          release_date: formData.release_date,
          file_size_mb: fileSizeMb,
        };

        const created = await gameService.createGame(input);
        if (created) {
          let finalGame = created;
          // Patch non-default is_featured / is_visible immediately after creation
          if (formData.is_featured || !formData.is_visible) {
            const patched = await gameService.updateGame(created.id, {
              is_featured: formData.is_featured,
              is_visible: formData.is_visible,
            });
            if (patched) finalGame = patched;
          }
          setGames((prev) => [finalGame, ...prev]);
          showToast(`"${finalGame.title}" added successfully.`, "success");
          resetForm();
          setActiveTab("games");
        } else {
          showToast(
            "Failed to create game. Check the console for details.",
            "error",
          );
        }
      }
    } catch (err) {
      console.error("[AdminDashboard] handleSubmit:", err);
      showToast("An unexpected error occurred while saving.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    populateForm(game);
    setActiveTab("editor");
  };

  const handleAddNew = () => {
    setEditingGame(null);
    resetForm();
    setActiveTab("editor");
  };

  const handleCancelEdit = () => {
    setEditingGame(null);
    resetForm();
    setActiveTab("games");
  };

  const handleDelete = async (gameId: string) => {
    try {
      const success = await gameService.deleteGame(gameId);
      if (success) {
        setGames((prev) => prev.filter((g) => g.id !== gameId));
        setDeleteConfirm(null);
        showToast("Game deleted successfully.", "success");
      } else {
        showToast("Failed to delete game.", "error");
        setDeleteConfirm(null);
      }
    } catch (err) {
      console.error("[AdminDashboard] handleDelete:", err);
      showToast("An error occurred while deleting.", "error");
      setDeleteConfirm(null);
    }
  };

  const handleToggleFeatured = async (game: Game) => {
    const newFeatured = !game.is_featured;
    try {
      const updated = await gameService.toggleFeatured(game.id, newFeatured);
      if (updated) {
        setGames((prev) =>
          prev.map((g) => (g.id === updated.id ? updated : g)),
        );
        showToast(
          `"${updated.title}" ${newFeatured ? "marked as featured" : "removed from featured"}.`,
          "info",
        );
      } else {
        showToast("Failed to toggle featured status.", "error");
      }
    } catch (err) {
      console.error("[AdminDashboard] handleToggleFeatured:", err);
      showToast("An error occurred.", "error");
    }
  };

  // ── Derived state ──────────────────────────────────────────────────────────

  const filteredGames = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return games;
    return games.filter(
      (g) =>
        g.title.toLowerCase().includes(q) ||
        (g.developer ?? "").toLowerCase().includes(q) ||
        (g.category_id ?? "").toLowerCase().includes(q),
    );
  }, [games, searchQuery]);

  const recentGames = useMemo(
    () =>
      [...games]
        .sort((a, b) => {
          const da = a.created_at ? new Date(a.created_at).getTime() : 0;
          const db = b.created_at ? new Date(b.created_at).getTime() : 0;
          return db - da;
        })
        .slice(0, 5),
    [games],
  );

  const featuredCount = useMemo(
    () => games.filter((g) => g.is_featured).length,
    [games],
  );
  const totalDownloads = useMemo(
    () => games.reduce((s, g) => s + (g.total_downloads ?? 0), 0),
    [games],
  );
  const deleteTarget = useMemo(
    () => (deleteConfirm ? games.find((g) => g.id === deleteConfirm) : null),
    [deleteConfirm, games],
  );

  // ── Tab styling ────────────────────────────────────────────────────────────

  const getTabStyle = (tab: ActiveTab): React.CSSProperties => {
    const isActive = activeTab === tab;
    return {
      background: "transparent",
      border: "none",
      borderBottom: isActive ? "2px solid #00ffcc" : "2px solid transparent",
      outline: "none",
      color: isActive ? "#00ffcc" : "#808080",
      textShadow: isActive
        ? "0 0 10px #00ffcc, 0 0 22px rgba(0,255,204,0.4)"
        : "none",
      padding: "4px 4px 12px 4px",
      cursor: "pointer",
      fontWeight: isActive ? 700 : 500,
      fontSize: "14px",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      whiteSpace: "nowrap",
      transition:
        "color 200ms ease, border-color 200ms ease, text-shadow 200ms ease",
    };
  };

  // ── Shared icon box style ──────────────────────────────────────────────────

  const iconBox = (color: string, border: string): React.CSSProperties => ({
    width: 36,
    height: 36,
    borderRadius: 8,
    background: color,
    border: `1px solid ${border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="relative p-6 md:p-8 space-y-8 min-h-screen">
      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            zIndex: 100,
            borderRadius: 8,
            border: "1px solid",
            backdropFilter: "blur(14px)",
            padding: "12px 16px",
            maxWidth: 360,
            display: "flex",
            alignItems: "center",
            gap: 10,
            ...TOAST_STYLES[toast.type],
          }}
        >
          {toast.type === "success" && (
            <CheckCircle2
              size={15}
              style={{ color: "#22c55e", flexShrink: 0 }}
            />
          )}
          {toast.type === "error" && (
            <AlertCircle
              size={15}
              style={{ color: "#ef4444", flexShrink: 0 }}
            />
          )}
          {toast.type === "info" && (
            <Info size={15} style={{ color: "#60a5fa", flexShrink: 0 }} />
          )}
          <p
            style={{
              color: "#ffffff",
              fontSize: 13,
              flex: 1,
              lineHeight: 1.45,
            }}
          >
            {toast.message}
          </p>
          <button
            onClick={dismissToast}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#808080",
              flexShrink: 0,
              lineHeight: 0,
              padding: 0,
            }}
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── No-Supabase Warning ───────────────────────────────────────────── */}
      {!supabase && (
        <div
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1px solid rgba(245, 158, 11, 0.4)",
            borderRadius: 8,
            padding: "12px 18px",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            boxShadow: "0 0 16px rgba(245, 158, 11, 0.08)",
          }}
        >
          <AlertTriangle
            size={16}
            style={{ color: "#f59e0b", flexShrink: 0, marginTop: 1 }}
          />
          <p style={{ color: "#d97706", fontSize: 13, lineHeight: 1.6 }}>
            <strong style={{ color: "#f59e0b" }}>
              Database not configured.
            </strong>{" "}
            Stats unavailable. Add{" "}
            <code
              style={{
                background: "rgba(255,255,255,0.08)",
                padding: "1px 5px",
                borderRadius: 3,
                fontSize: 12,
              }}
            >
              VITE_SUPABASE_URL
            </code>{" "}
            and{" "}
            <code
              style={{
                background: "rgba(255,255,255,0.08)",
                padding: "1px 5px",
                borderRadius: 3,
                fontSize: 12,
              }}
            >
              VITE_SUPABASE_ANON_KEY
            </code>{" "}
            to your{" "}
            <code
              style={{
                background: "rgba(255,255,255,0.08)",
                padding: "1px 5px",
                borderRadius: 3,
                fontSize: 12,
              }}
            >
              .env
            </code>{" "}
            file.
          </p>
        </div>
      )}

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div>
        <h1
          className="text-4xl font-black text-white neon-glow"
          style={{ letterSpacing: "-0.5px" }}
        >
          Admin Portal
        </h1>
        <p style={{ color: "#808080", marginTop: 6, fontSize: 14 }}>
          Platform management &amp; CRUD operations
        </p>
      </div>

      {/* ── Tab Bar ───────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          gap: 24,
          borderBottom: "1px solid rgba(168,85,247,0.12)",
        }}
      >
        <button
          style={getTabStyle("overview")}
          onClick={() => setActiveTab("overview")}
        >
          <LayoutDashboard size={14} />
          Overview
        </button>

        <button
          style={getTabStyle("games")}
          onClick={() => setActiveTab("games")}
        >
          <List size={14} />
          Games
          {games.length > 0 && (
            <span
              style={{
                background: "rgba(168,85,247,0.2)",
                color: "#a855f7",
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                padding: "1px 7px",
                marginLeft: 2,
              }}
            >
              {games.length}
            </span>
          )}
        </button>

        <button
          style={getTabStyle("editor")}
          onClick={() => setActiveTab("editor")}
        >
          <FilePlus2 size={14} />
          {editingGame ? "Edit Game" : "Add Game"}
        </button>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────
       * TAB: OVERVIEW
       * ────────────────────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-fade-in">
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Total Games */}
            <div className="glassmorphic-card p-6 space-y-3 hover-lift">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    color: "#b0b0b0",
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Total Games
                </span>
                <div
                  style={iconBox(
                    "rgba(168,85,247,0.15)",
                    "rgba(168,85,247,0.3)",
                  )}
                >
                  <Gamepad2 size={17} style={{ color: "#a855f7" }} />
                </div>
              </div>
              {isLoading ? (
                <div className="h-10 animate-shimmer rounded" />
              ) : (
                <p
                  className="text-4xl font-black"
                  style={{
                    color: "#a855f7",
                    textShadow: "0 0 18px rgba(168,85,247,0.7)",
                  }}
                >
                  {(stats?.totalGames ?? games.length).toLocaleString()}
                </p>
              )}
              <p style={{ color: "#808080", fontSize: 12 }}>
                Available in the library
              </p>
            </div>

            {/* Total Downloads */}
            <div className="glassmorphic-card p-6 space-y-3 hover-lift">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    color: "#b0b0b0",
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Total Downloads
                </span>
                <div
                  style={iconBox("rgba(6,182,212,0.15)", "rgba(6,182,212,0.3)")}
                >
                  <Download size={17} style={{ color: "#06b6d4" }} />
                </div>
              </div>
              {isLoading ? (
                <div className="h-10 animate-shimmer rounded" />
              ) : (
                <p
                  className="text-4xl font-black"
                  style={{
                    color: "#06b6d4",
                    textShadow: "0 0 18px rgba(6,182,212,0.7)",
                  }}
                >
                  {totalDownloads.toLocaleString()}
                </p>
              )}
              <p style={{ color: "#808080", fontSize: 12 }}>
                All-time across all games
              </p>
            </div>

            {/* Featured Games */}
            <div className="glassmorphic-card p-6 space-y-3 hover-lift">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    color: "#b0b0b0",
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Featured Games
                </span>
                <div
                  style={iconBox(
                    "rgba(236,72,153,0.15)",
                    "rgba(236,72,153,0.3)",
                  )}
                >
                  <Star size={17} style={{ color: "#ec4899" }} />
                </div>
              </div>
              {isLoading ? (
                <div className="h-10 animate-shimmer rounded" />
              ) : (
                <p
                  className="text-4xl font-black"
                  style={{
                    color: "#ec4899",
                    textShadow: "0 0 18px rgba(236,72,153,0.7)",
                  }}
                >
                  {featuredCount.toLocaleString()}
                </p>
              )}
              <p style={{ color: "#808080", fontSize: 12 }}>
                Highlighted on the homepage
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white neon-glow-cyan">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={handleAddNew}
                className="glassmorphic-card p-5 text-left hover-lift"
                style={{ cursor: "pointer", width: "100%", display: "block" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 14 }}
                  >
                    <span style={{ fontSize: 28 }}>🎮</span>
                    <div>
                      <p
                        style={{
                          color: "#ffffff",
                          fontWeight: 700,
                          fontSize: 15,
                        }}
                      >
                        Add New Game
                      </p>
                      <p
                        style={{ color: "#808080", fontSize: 13, marginTop: 2 }}
                      >
                        Create a new game entry
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={17}
                    style={{ color: "#a855f7", flexShrink: 0 }}
                  />
                </div>
              </button>

              <button
                onClick={() => setActiveTab("games")}
                className="glassmorphic-card p-5 text-left hover-lift"
                style={{ cursor: "pointer", width: "100%", display: "block" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 14 }}
                  >
                    <span style={{ fontSize: 28 }}>📋</span>
                    <div>
                      <p
                        style={{
                          color: "#ffffff",
                          fontWeight: 700,
                          fontSize: 15,
                        }}
                      >
                        Manage Games
                      </p>
                      <p
                        style={{ color: "#808080", fontSize: 13, marginTop: 2 }}
                      >
                        Edit, delete, or feature games
                      </p>
                    </div>
                  </div>
                  <ChevronRight
                    size={17}
                    style={{ color: "#06b6d4", flexShrink: 0 }}
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Recently Added */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white neon-glow-cyan">
              Recently Added
            </h2>
            {isLoading ? (
              <div className="glassmorphic-card p-10 flex items-center justify-center">
                <LoadingSpinner size="md" text="Loading games…" />
              </div>
            ) : recentGames.length === 0 ? (
              <div className="glassmorphic-card p-10 text-center">
                <Gamepad2
                  size={36}
                  style={{ color: "#808080", margin: "0 auto 10px" }}
                />
                <p style={{ color: "#808080" }}>No games added yet.</p>
              </div>
            ) : (
              <div className="glassmorphic-card overflow-hidden">
                {recentGames.map((game, idx) => (
                  <div
                    key={game.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 20px",
                      borderBottom:
                        idx < recentGames.length - 1
                          ? "1px solid rgba(168,85,247,0.08)"
                          : "none",
                    }}
                  >
                    {game.cover_image_url ? (
                      <img
                        src={game.cover_image_url}
                        alt={game.title}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 6,
                          objectFit: "cover",
                          flexShrink: 0,
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          ...iconBox(
                            "rgba(168,85,247,0.1)",
                            "rgba(168,85,247,0.2)",
                          ),
                          width: 44,
                          height: 44,
                          borderRadius: 6,
                        }}
                      >
                        <Gamepad2 size={18} style={{ color: "#a855f7" }} />
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          color: "#ffffff",
                          fontWeight: 600,
                          fontSize: 14,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {game.title}
                      </p>
                      <p
                        style={{ color: "#808080", fontSize: 12, marginTop: 2 }}
                      >
                        {game.developer ?? "Unknown developer"} &middot;{" "}
                        {formatDate(game.created_at)}
                      </p>
                    </div>

                    {game.is_featured && (
                      <Star
                        size={14}
                        style={{ color: "#ec4899", flexShrink: 0 }}
                        fill="#ec4899"
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────
       * TAB: GAMES (Management Table)
       * ────────────────────────────────────────────────────────────────────── */}
      {activeTab === "games" && (
        <div className="space-y-6 animate-fade-in">
          {/* Controls row */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* Search */}
            <div
              style={{
                position: "relative",
                flex: 1,
                minWidth: 200,
                maxWidth: 420,
              }}
            >
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#808080",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                className="glass-input w-full"
                style={{ paddingLeft: 36 }}
                placeholder="Search by title, developer, category…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Add New Game */}
            <button
              onClick={handleAddNew}
              style={{
                background: "linear-gradient(135deg, #a855f7, #06b6d4)",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                padding: "10px 20px",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 7,
                boxShadow: "0 0 22px rgba(168,85,247,0.35)",
                flexShrink: 0,
              }}
            >
              <Plus size={15} />
              Add New Game
            </button>
          </div>

          {/* Table / Card list */}
          {isLoading ? (
            <div className="glassmorphic-card p-14 flex items-center justify-center">
              <LoadingSpinner size="lg" text="Loading games…" />
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="glassmorphic-card p-14 text-center space-y-4">
              <Gamepad2
                size={44}
                style={{ color: "#808080", margin: "0 auto" }}
              />
              <p style={{ color: "#808080", fontSize: 15 }}>
                {searchQuery
                  ? `No games matching "${searchQuery}"`
                  : "No games yet. Add your first game!"}
              </p>
              {!searchQuery && (
                <button
                  onClick={handleAddNew}
                  style={{
                    background: "linear-gradient(135deg, #a855f7, #06b6d4)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 8,
                    padding: "10px 22px",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 14,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 7,
                    margin: "0 auto",
                  }}
                >
                  <Plus size={15} />
                  Add Your First Game
                </button>
              )}
            </div>
          ) : (
            <div className="glassmorphic-card overflow-hidden">
              {/* Desktop table header */}
              <div
                className="hidden md:grid"
                style={{
                  gridTemplateColumns: "3fr 1fr 90px 90px 100px",
                  padding: "11px 20px",
                  borderBottom: "1px solid rgba(168,85,247,0.12)",
                  background: "rgba(168,85,247,0.05)",
                }}
              >
                {["Game", "Category", "Featured", "Status", "Actions"].map(
                  (h) => (
                    <span
                      key={h}
                      style={{
                        color: "#808080",
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                      }}
                    >
                      {h}
                    </span>
                  ),
                )}
              </div>

              {/* Rows */}
              {filteredGames.map((game, idx) => (
                <div
                  key={game.id}
                  style={{
                    borderBottom:
                      idx < filteredGames.length - 1
                        ? "1px solid rgba(168,85,247,0.07)"
                        : "none",
                  }}
                >
                  {/* ── Desktop row ── */}
                  <div
                    className="hidden md:grid"
                    style={{
                      gridTemplateColumns: "3fr 1fr 90px 90px 100px",
                      padding: "13px 20px",
                      alignItems: "center",
                      transition: "background 200ms ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(168,85,247,0.04)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* Game info */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        minWidth: 0,
                      }}
                    >
                      {game.cover_image_url ? (
                        <img
                          src={game.cover_image_url}
                          alt={game.title}
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 6,
                            objectFit: "cover",
                            flexShrink: 0,
                            border: "1px solid rgba(255,255,255,0.07)",
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            ...iconBox(
                              "rgba(168,85,247,0.1)",
                              "rgba(168,85,247,0.2)",
                            ),
                            width: 40,
                            height: 40,
                            borderRadius: 6,
                          }}
                        >
                          <Gamepad2 size={15} style={{ color: "#a855f7" }} />
                        </div>
                      )}
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            color: "#ffffff",
                            fontWeight: 600,
                            fontSize: 14,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {game.title}
                        </p>
                        <p style={{ color: "#808080", fontSize: 12 }}>
                          {game.developer ?? "—"}
                        </p>
                      </div>
                    </div>

                    {/* Category */}
                    <span style={{ color: "#b0b0b0", fontSize: 13 }}>
                      {game.category_id ?? "—"}
                    </span>

                    {/* Featured toggle */}
                    <div>
                      <button
                        onClick={() => handleToggleFeatured(game)}
                        title={
                          game.is_featured
                            ? "Remove from featured"
                            : "Mark as featured"
                        }
                        style={{
                          background: game.is_featured
                            ? "rgba(236,72,153,0.15)"
                            : "rgba(128,128,128,0.1)",
                          border: `1px solid ${
                            game.is_featured
                              ? "rgba(236,72,153,0.4)"
                              : "rgba(128,128,128,0.2)"
                          }`,
                          borderRadius: 6,
                          padding: "5px 9px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Star
                          size={13}
                          style={{
                            color: game.is_featured ? "#ec4899" : "#808080",
                          }}
                          fill={game.is_featured ? "#ec4899" : "none"}
                        />
                      </button>
                    </div>

                    {/* Visibility badge */}
                    <div>
                      {game.is_visible ? (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            background: "rgba(34,197,94,0.1)",
                            border: "1px solid rgba(34,197,94,0.3)",
                            color: "#22c55e",
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "3px 9px",
                            borderRadius: 999,
                          }}
                        >
                          <Eye size={10} />
                          Visible
                        </span>
                      ) : (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            background: "rgba(128,128,128,0.1)",
                            border: "1px solid rgba(128,128,128,0.25)",
                            color: "#808080",
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "3px 9px",
                            borderRadius: 999,
                          }}
                        >
                          <EyeOff size={10} />
                          Hidden
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => handleEdit(game)}
                        title="Edit game"
                        style={{
                          background: "rgba(6,182,212,0.12)",
                          border: "1px solid rgba(6,182,212,0.3)",
                          color: "#06b6d4",
                          borderRadius: 6,
                          padding: "5px 9px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(game.id)}
                        title="Delete game"
                        style={{
                          background: "rgba(239,68,68,0.1)",
                          border: "1px solid rgba(239,68,68,0.3)",
                          color: "#ef4444",
                          borderRadius: 6,
                          padding: "5px 9px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* ── Mobile card ── */}
                  <div className="md:hidden p-4 space-y-3">
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        alignItems: "flex-start",
                      }}
                    >
                      {game.cover_image_url ? (
                        <img
                          src={game.cover_image_url}
                          alt={game.title}
                          style={{
                            width: 50,
                            height: 50,
                            borderRadius: 6,
                            objectFit: "cover",
                            flexShrink: 0,
                            border: "1px solid rgba(255,255,255,0.08)",
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            ...iconBox(
                              "rgba(168,85,247,0.1)",
                              "rgba(168,85,247,0.2)",
                            ),
                            width: 50,
                            height: 50,
                            borderRadius: 6,
                          }}
                        >
                          <Gamepad2 size={20} style={{ color: "#a855f7" }} />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            color: "#ffffff",
                            fontWeight: 700,
                            fontSize: 15,
                          }}
                        >
                          {game.title}
                        </p>
                        <p
                          style={{
                            color: "#808080",
                            fontSize: 12,
                            marginTop: 2,
                          }}
                        >
                          {game.developer ?? "—"} &middot;{" "}
                          {game.category_id ?? "Uncategorized"}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        flexWrap: "wrap",
                        alignItems: "center",
                      }}
                    >
                      {/* Badges */}
                      {game.is_visible ? (
                        <span
                          style={{
                            background: "rgba(34,197,94,0.1)",
                            border: "1px solid rgba(34,197,94,0.3)",
                            color: "#22c55e",
                            fontSize: 11,
                            padding: "2px 9px",
                            borderRadius: 999,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <Eye size={9} /> Visible
                        </span>
                      ) : (
                        <span
                          style={{
                            background: "rgba(128,128,128,0.1)",
                            border: "1px solid rgba(128,128,128,0.25)",
                            color: "#808080",
                            fontSize: 11,
                            padding: "2px 9px",
                            borderRadius: 999,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <EyeOff size={9} /> Hidden
                        </span>
                      )}
                      {game.is_featured && (
                        <span
                          style={{
                            background: "rgba(236,72,153,0.1)",
                            border: "1px solid rgba(236,72,153,0.3)",
                            color: "#ec4899",
                            fontSize: 11,
                            padding: "2px 9px",
                            borderRadius: 999,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <Star size={9} fill="#ec4899" /> Featured
                        </span>
                      )}

                      {/* Action buttons */}
                      <div
                        style={{ marginLeft: "auto", display: "flex", gap: 6 }}
                      >
                        <button
                          onClick={() => handleToggleFeatured(game)}
                          title="Toggle featured"
                          style={{
                            background: game.is_featured
                              ? "rgba(236,72,153,0.15)"
                              : "rgba(128,128,128,0.1)",
                            border: `1px solid ${
                              game.is_featured
                                ? "rgba(236,72,153,0.4)"
                                : "rgba(128,128,128,0.2)"
                            }`,
                            borderRadius: 6,
                            padding: "6px 10px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Star
                            size={13}
                            style={{
                              color: game.is_featured ? "#ec4899" : "#808080",
                            }}
                            fill={game.is_featured ? "#ec4899" : "none"}
                          />
                        </button>
                        <button
                          onClick={() => handleEdit(game)}
                          style={{
                            background: "rgba(6,182,212,0.12)",
                            border: "1px solid rgba(6,182,212,0.3)",
                            color: "#06b6d4",
                            borderRadius: 6,
                            padding: "6px 10px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(game.id)}
                          style={{
                            background: "rgba(239,68,68,0.1)",
                            border: "1px solid rgba(239,68,68,0.3)",
                            color: "#ef4444",
                            borderRadius: 6,
                            padding: "6px 10px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────
       * TAB: EDITOR (Add / Edit Form)
       * ────────────────────────────────────────────────────────────────────── */}
      {activeTab === "editor" && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h2 className="text-2xl font-bold text-white neon-glow-cyan">
              {editingGame ? `Editing: ${editingGame.title}` : "Add New Game"}
            </h2>
            <p style={{ color: "#808080", fontSize: 14, marginTop: 4 }}>
              {editingGame
                ? "Modify the game details below and save your changes."
                : "Fill in the details to add a new game to the library."}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="glassmorphic-card p-6 md:p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Title */}
                <div className="space-y-2">
                  <label
                    style={{
                      display: "block",
                      color: "#b0b0b0",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Title <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="glass-input w-full"
                    placeholder="e.g. Cyberpunk 2077"
                    value={formData.title}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                {/* Developer */}
                <div className="space-y-2">
                  <label
                    style={{
                      display: "block",
                      color: "#b0b0b0",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Developer
                  </label>
                  <input
                    type="text"
                    name="developer"
                    className="glass-input w-full"
                    placeholder="e.g. CD Projekt Red"
                    value={formData.developer}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Publisher */}
                <div className="space-y-2">
                  <label
                    style={{
                      display: "block",
                      color: "#b0b0b0",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Publisher
                  </label>
                  <input
                    type="text"
                    name="publisher"
                    className="glass-input w-full"
                    placeholder="e.g. CD Projekt"
                    value={formData.publisher}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label
                    style={{
                      display: "block",
                      color: "#b0b0b0",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Category
                  </label>
                  <input
                    type="text"
                    name="category_id"
                    className="glass-input w-full"
                    placeholder="action"
                    value={formData.category_id}
                    onChange={handleFormChange}
                  />
                  <p style={{ color: "#808080", fontSize: 11 }}>
                    e.g. action, rpg, strategy
                  </p>
                </div>

                {/* Cover Image URL (full width) */}
                <div className="space-y-2 md:col-span-2">
                  <label
                    style={{
                      display: "block",
                      color: "#b0b0b0",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    name="cover_image_url"
                    className="glass-input w-full"
                    placeholder="https://example.com/cover.jpg"
                    value={formData.cover_image_url}
                    onChange={handleFormChange}
                  />
                  {isValidUrl(formData.cover_image_url) && (
                    <img
                      src={formData.cover_image_url}
                      alt="Cover preview"
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        borderRadius: 8,
                        border: "1px solid rgba(168,85,247,0.35)",
                        marginTop: 8,
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  )}
                </div>

                {/* Release Date */}
                <div className="space-y-2">
                  <label
                    style={{
                      display: "block",
                      color: "#b0b0b0",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Release Date
                  </label>
                  <input
                    type="date"
                    name="release_date"
                    className="glass-input w-full"
                    value={formData.release_date}
                    onChange={handleFormChange}
                    style={{ colorScheme: "dark" }}
                  />
                </div>

                {/* File Size */}
                <div className="space-y-2">
                  <label
                    style={{
                      display: "block",
                      color: "#b0b0b0",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    File Size (MB)
                  </label>
                  <input
                    type="number"
                    name="file_size_mb"
                    className="glass-input w-full"
                    placeholder="e.g. 45000"
                    min="0"
                    step="any"
                    value={formData.file_size_mb}
                    onChange={handleFormChange}
                  />
                </div>

                {/* Description (full width) */}
                <div className="space-y-2 md:col-span-2">
                  <label
                    style={{
                      display: "block",
                      color: "#b0b0b0",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Description <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <textarea
                    name="description"
                    className="glass-input w-full"
                    placeholder="A short description shown in game cards…"
                    rows={4}
                    value={formData.description}
                    onChange={handleFormChange}
                    required
                    style={{ resize: "vertical" }}
                  />
                </div>

                {/* Long Description (full width) */}
                <div className="space-y-2 md:col-span-2">
                  <label
                    style={{
                      display: "block",
                      color: "#b0b0b0",
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    Long Description{" "}
                    <span style={{ color: "#808080", fontSize: 11 }}>
                      (optional)
                    </span>
                  </label>
                  <textarea
                    name="long_description"
                    className="glass-input w-full"
                    placeholder="A detailed description shown on the game detail page…"
                    rows={6}
                    value={formData.long_description}
                    onChange={handleFormChange}
                    style={{ resize: "vertical" }}
                  />
                </div>

                {/* Checkboxes (full width) */}
                <div
                  className="md:col-span-2"
                  style={{ display: "flex", gap: 28, flexWrap: "wrap" }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={formData.is_featured}
                      onChange={handleFormChange}
                      style={{
                        width: 16,
                        height: 16,
                        accentColor: "#ec4899",
                        cursor: "pointer",
                      }}
                    />
                    <span
                      style={{
                        color: "#b0b0b0",
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Star size={13} style={{ color: "#ec4899" }} />
                      Is Featured
                    </span>
                  </label>

                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="is_visible"
                      checked={formData.is_visible}
                      onChange={handleFormChange}
                      style={{
                        width: 16,
                        height: 16,
                        accentColor: "#06b6d4",
                        cursor: "pointer",
                      }}
                    />
                    <span
                      style={{
                        color: "#b0b0b0",
                        fontSize: 14,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Eye size={13} style={{ color: "#06b6d4" }} />
                      Is Visible
                    </span>
                  </label>
                </div>
              </div>

              <div className="glass-divider" />

              {/* Form actions */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  alignItems: "center",
                }}
              >
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    background: isSaving
                      ? "rgba(168,85,247,0.25)"
                      : "linear-gradient(135deg, #a855f7, #06b6d4)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: 8,
                    padding: "11px 28px",
                    cursor: isSaving ? "not-allowed" : "pointer",
                    fontWeight: 700,
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    boxShadow: isSaving
                      ? "none"
                      : "0 0 22px rgba(168,85,247,0.35)",
                    minWidth: 130,
                    opacity: isSaving ? 0.75 : 1,
                    transition: "opacity 200ms ease",
                  }}
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner size="sm" text="" />
                      Saving…
                    </>
                  ) : editingGame ? (
                    "Save Game"
                  ) : (
                    "Add Game"
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="glass-button"
                  disabled={isSaving}
                  style={{
                    opacity: isSaving ? 0.5 : 1,
                    cursor: isSaving ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────
       * DELETE CONFIRMATION MODAL
       * ────────────────────────────────────────────────────────────────────── */}
      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            background: "rgba(10,10,10,0.82)",
            backdropFilter: "blur(10px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteConfirm(null);
          }}
        >
          <div
            className="glassmorphic-card-elevated animate-scale-in"
            style={{
              maxWidth: 440,
              width: "100%",
              padding: 28,
              border: "1px solid rgba(239,68,68,0.3)",
              boxShadow:
                "0 0 48px rgba(239,68,68,0.12), 0 20px 40px rgba(0,0,0,0.6)",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  ...iconBox("rgba(239,68,68,0.15)", "rgba(239,68,68,0.35)"),
                  width: 42,
                  height: 42,
                  borderRadius: 9,
                  flexShrink: 0,
                }}
              >
                <AlertTriangle size={20} style={{ color: "#ef4444" }} />
              </div>
              <div>
                <h3
                  style={{
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: 18,
                    lineHeight: 1.3,
                  }}
                >
                  Delete Game
                </h3>
                <p
                  style={{
                    color: "#b0b0b0",
                    fontSize: 14,
                    marginTop: 6,
                    lineHeight: 1.55,
                  }}
                >
                  Are you sure you want to delete{" "}
                  <strong style={{ color: "#ef4444" }}>
                    &ldquo;{deleteTarget?.title ?? "this game"}&rdquo;
                  </strong>
                  ? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="glass-divider" style={{ marginBottom: 20 }} />

            {/* Modal actions */}
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="glass-button"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{
                  flex: 1,
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.5)",
                  color: "#ef4444",
                  borderRadius: 8,
                  padding: "10px 20px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 14,
                  boxShadow: "0 0 16px rgba(239,68,68,0.18)",
                  transition: "background 200ms ease, box-shadow 200ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.28)";
                  e.currentTarget.style.boxShadow =
                    "0 0 28px rgba(239,68,68,0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.15)";
                  e.currentTarget.style.boxShadow =
                    "0 0 16px rgba(239,68,68,0.18)";
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
