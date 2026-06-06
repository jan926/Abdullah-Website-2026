import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/app/components/ui/utils";
import { useIsAdmin } from "@/hooks/useAuth";
import {
  gameService,
  type CreateGameInput,
  type Game,
  type GameFilters,
} from "@/services/gameService";

type ToastType = "success" | "error" | "info";

type AdminGameService = {
  getGames: (filters?: GameFilters) => Promise<Game[]>;
  createGame: (input: CreateGameInput) => Promise<Game | null>;
  updateGame: (id: string, updates: Partial<Game>) => Promise<Game | null>;
  deleteGame: (id: string) => Promise<boolean>;
};

type FormState = {
  title: string;
  description: string;
  long_description: string;
  category_id: string;
  cover_image_url: string;
  developer: string;
  publisher: string;
  release_date: string;
  file_size_mb: string;
  is_featured: boolean;
  is_visible: boolean;
};

const EMPTY_FORM: FormState = {
  title: "",
  description: "",
  long_description: "",
  category_id: "",
  cover_image_url: "",
  developer: "",
  publisher: "",
  release_date: "",
  file_size_mb: "",
  is_featured: false,
  is_visible: true,
};

export function AdminDashboard({
  service = gameService,
  className,
}: {
  service?: AdminGameService;
  className?: string;
}) {
  const isAdmin = useIsAdmin();
  const [activeTab, setActiveTab] = useState<"games" | "editor">("games");
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Game | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [toast, setToast] = useState<{ type: ToastType; message: string } | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((type: ToastType, message: string) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 3200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await service.getGames({ limit: 1000 });
      setGames(data);
    } catch {
      showToast("error", "Failed to load games.");
    } finally {
      setLoading(false);
    }
  }, [service, showToast]);

  useEffect(() => {
    if (!isAdmin) return;
    load();
  }, [isAdmin, load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return games;
    return games.filter((g) => {
      const parts = [
        g.title,
        g.developer ?? "",
        g.publisher ?? "",
        g.category_id ?? "",
        g.slug ?? "",
      ];
      return parts.some((p) => p.toLowerCase().includes(q));
    });
  }, [games, query]);

  const totalDownloads = useMemo(
    () => games.reduce((sum, g) => sum + (g.total_downloads ?? 0), 0),
    [games],
  );

  const featuredCount = useMemo(
    () => games.filter((g) => g.is_featured).length,
    [games],
  );

  const deleteTarget = useMemo(
    () => (confirmDeleteId ? games.find((g) => g.id === confirmDeleteId) : null),
    [confirmDeleteId, games],
  );

  const startCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setActiveTab("editor");
  };

  const startEdit = (g: Game) => {
    setEditing(g);
    setForm({
      title: g.title ?? "",
      description: g.description ?? "",
      long_description: g.long_description ?? "",
      category_id: g.category_id ?? "",
      cover_image_url: g.cover_image_url ?? "",
      developer: g.developer ?? "",
      publisher: g.publisher ?? "",
      release_date: g.release_date ?? "",
      file_size_mb: g.file_size_mb != null ? String(g.file_size_mb) : "",
      is_featured: Boolean(g.is_featured),
      is_visible: g.is_visible ?? true,
    });
    setActiveTab("editor");
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setActiveTab("games");
  };

  const onFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((p) => ({ ...p, [name]: checked }));
      return;
    }
    setForm((p) => ({ ...p, [name]: value }));
  };

  const validate = (): string | null => {
    if (!form.title.trim()) return "Title is required.";
    if (!form.description.trim()) return "Description is required.";
    if (!form.category_id.trim()) return "Category is required.";
    if (!form.cover_image_url.trim()) return "Cover image URL is required.";
    if (!form.developer.trim()) return "Developer is required.";
    if (!form.publisher.trim()) return "Publisher is required.";
    if (!form.release_date.trim()) return "Release date is required.";
    const size = Number(form.file_size_mb);
    if (!Number.isFinite(size) || size < 0) return "File size must be a valid number.";
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    const err = validate();
    if (err) {
      showToast("error", err);
      return;
    }

    setSaving(true);
    try {
      const size = Number(form.file_size_mb);

      if (editing) {
        const updated = await service.updateGame(editing.id, {
          title: form.title,
          description: form.description,
          long_description: form.long_description.trim() ? form.long_description : undefined,
          category_id: form.category_id,
          cover_image_url: form.cover_image_url,
          developer: form.developer,
          publisher: form.publisher,
          release_date: form.release_date,
          file_size_mb: size,
          is_featured: form.is_featured,
          is_visible: form.is_visible,
        });

        if (!updated) {
          showToast("error", "Update failed.");
          return;
        }

        setGames((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
        showToast("success", `Saved “${updated.title}”.`);
        cancelEdit();
        return;
      }

      const created = await service.createGame({
        title: form.title,
        description: form.description,
        long_description: form.long_description.trim() ? form.long_description : undefined,
        category_id: form.category_id,
        cover_image_url: form.cover_image_url,
        developer: form.developer,
        publisher: form.publisher,
        release_date: form.release_date,
        file_size_mb: size,
      });

      if (!created) {
        showToast("error", "Create failed.");
        return;
      }

      let final = created;
      if (form.is_featured || !form.is_visible) {
        const patched = await service.updateGame(created.id, {
          is_featured: form.is_featured,
          is_visible: form.is_visible,
        });
        if (patched) final = patched;
      }

      setGames((prev) => [final, ...prev]);
      showToast("success", `Added “${final.title}”.`);
      cancelEdit();
    } catch {
      showToast("error", "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  };

  const doDelete = async () => {
    if (!confirmDeleteId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    try {
      const ok = await service.deleteGame(id);
      if (!ok) {
        showToast("error", "Delete failed.");
        return;
      }
      setGames((prev) => prev.filter((g) => g.id !== id));
      showToast("success", "Game deleted.");
    } catch {
      showToast("error", "Delete failed.");
    }
  };

  if (!isAdmin) {
    return (
      <div className={cn("min-h-screen p-6 md:p-10", className)}>
        <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-[rgba(26,26,26,0.65)] p-8 backdrop-blur-xl">
          <div className="flex items-start gap-4">
            <div className="grid size-11 place-items-center rounded-xl border border-[#a855f7]/25 bg-[rgba(168,85,247,0.12)] text-[#a855f7]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-black text-white">Admin access required</h1>
              <p className="text-sm text-white/65">
                This portal is restricted to administrators.
              </p>
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#00ffcc] hover:underline"
              >
                Go to admin login <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen p-6 md:p-10", className)}>
      {toast ? (
        <div
          className={cn(
            "fixed right-4 top-4 z-50 max-w-sm rounded-xl border px-4 py-3 backdrop-blur-xl",
            toast.type === "success" &&
              "border-[#00ffcc]/25 bg-[rgba(0,255,204,0.10)] text-white shadow-[0_0_40px_rgba(0,255,204,0.14)]",
            toast.type === "error" &&
              "border-red-400/25 bg-[rgba(239,68,68,0.10)] text-white shadow-[0_0_40px_rgba(239,68,68,0.14)]",
            toast.type === "info" &&
              "border-[#a855f7]/25 bg-[rgba(168,85,247,0.10)] text-white shadow-[0_0_40px_rgba(168,85,247,0.14)]",
          )}
          role="status"
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              {toast.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-[#00ffcc]" />
              ) : toast.type === "error" ? (
                <AlertTriangle className="h-4 w-4 text-red-400" />
              ) : (
                <CheckCircle2 className="h-4 w-4 text-[#a855f7]" />
              )}
            </div>
            <p className="text-sm font-semibold leading-relaxed">{toast.message}</p>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-auto text-white/60 hover:text-white"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl space-y-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-white">
              <span className="bg-[linear-gradient(135deg,#ffffff,rgba(0,255,204,0.95),rgba(168,85,247,0.95))] bg-clip-text text-transparent">
                Admin Dashboard
              </span>
            </h1>
            <p className="text-sm text-white/65">
              Add, edit, and remove games with a secure cyberpunk portal.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/"
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/80 hover:bg-white/10"
            >
              Back to Store
            </Link>
            <button
              type="button"
              onClick={startCreate}
              className="inline-flex items-center gap-2 rounded-xl bg-[#00ffcc] px-4 py-2 text-sm font-black text-black shadow-[0_0_32px_rgba(0,255,204,0.20)] hover:shadow-[0_0_50px_rgba(0,255,204,0.30)] transition"
            >
              <Plus className="h-4 w-4" />
              Add Game
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,26,26,0.62)] p-5 backdrop-blur-xl">
            <p className="text-xs font-extrabold tracking-[0.2em] text-white/55">GAMES</p>
            <p className="mt-2 text-3xl font-black text-[#a855f7]">
              {games.length.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,26,26,0.62)] p-5 backdrop-blur-xl">
            <p className="text-xs font-extrabold tracking-[0.2em] text-white/55">FEATURED</p>
            <p className="mt-2 text-3xl font-black text-[#00ffcc]">
              {featuredCount.toLocaleString()}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[rgba(26,26,26,0.62)] p-5 backdrop-blur-xl">
            <p className="text-xs font-extrabold tracking-[0.2em] text-white/55">DOWNLOADS</p>
            <p className="mt-2 text-3xl font-black text-[#ec4899]">
              {totalDownloads.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 border-b border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("games")}
            className={cn(
              "pb-3 text-sm font-extrabold tracking-wide transition",
              activeTab === "games"
                ? "border-b-2 border-[#00ffcc] text-[#00ffcc] drop-shadow-[0_0_14px_rgba(0,255,204,0.35)]"
                : "text-white/55 hover:text-white",
            )}
          >
            Games
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("editor")}
            className={cn(
              "pb-3 text-sm font-extrabold tracking-wide transition",
              activeTab === "editor"
                ? "border-b-2 border-[#00ffcc] text-[#00ffcc] drop-shadow-[0_0_14px_rgba(0,255,204,0.35)]"
                : "text-white/55 hover:text-white",
            )}
          >
            {editing ? "Edit Game" : "Add Game"}
          </button>
        </div>

        {activeTab === "games" ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="relative w-full max-w-lg">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by title, category, developer…"
                  className={cn(
                    "glass-input w-full",
                    "pl-9",
                    "border-[#a855f7]/25 focus:border-[#00ffcc]/35",
                  )}
                />
              </div>

              <button
                type="button"
                onClick={load}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-bold text-white/80 hover:bg-white/10"
              >
                Refresh
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[rgba(26,26,26,0.62)] backdrop-blur-xl">
              <div className="grid grid-cols-12 gap-3 border-b border-white/10 bg-white/5 px-5 py-3 text-xs font-extrabold tracking-[0.18em] text-white/55">
                <div className="col-span-6">GAME</div>
                <div className="col-span-3 hidden md:block">CATEGORY</div>
                <div className="col-span-3 text-right">ACTIONS</div>
              </div>

              {loading ? (
                <div className="p-10 text-center text-sm text-white/60">Loading…</div>
              ) : filtered.length === 0 ? (
                <div className="p-10 text-center text-sm text-white/60">
                  No games found.
                </div>
              ) : (
                <div className="divide-y divide-white/10">
                  {filtered.map((g) => (
                    <div key={g.id} className="grid grid-cols-12 gap-3 px-5 py-4">
                      <div className="col-span-9 md:col-span-6 min-w-0">
                        <p className="truncate text-sm font-extrabold text-white">{g.title}</p>
                        <p className="mt-1 truncate text-xs text-white/55">
                          {(g.developer ?? "Unknown")} • {(g.publisher ?? "Unknown")}
                        </p>
                      </div>

                      <div className="col-span-3 hidden md:block">
                        <span className="inline-flex rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs font-semibold text-white/70">
                          {g.category_id ?? "—"}
                        </span>
                      </div>

                      <div className="col-span-3 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(g)}
                          className="inline-flex items-center gap-2 rounded-lg border border-[#00ffcc]/25 bg-[rgba(0,255,204,0.08)] px-3 py-2 text-xs font-extrabold text-[#00ffcc] hover:bg-[rgba(0,255,204,0.14)]"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(g.id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-400/25 bg-[rgba(239,68,68,0.08)] px-3 py-2 text-xs font-extrabold text-red-300 hover:bg-[rgba(239,68,68,0.14)]"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <div className="rounded-2xl border border-white/10 bg-[rgba(26,26,26,0.62)] p-5 backdrop-blur-xl md:p-7">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-extrabold tracking-wide text-white/70">
                    Title
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={onFormChange}
                    className="glass-input w-full"
                    placeholder="e.g. Neon Drift"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold tracking-wide text-white/70">
                    Category
                  </label>
                  <input
                    name="category_id"
                    value={form.category_id}
                    onChange={onFormChange}
                    className="glass-input w-full"
                    placeholder="e.g. action"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-extrabold tracking-wide text-white/70">
                    Cover Image URL
                  </label>
                  <input
                    name="cover_image_url"
                    value={form.cover_image_url}
                    onChange={onFormChange}
                    className="glass-input w-full"
                    placeholder="https://…"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold tracking-wide text-white/70">
                    Developer
                  </label>
                  <input
                    name="developer"
                    value={form.developer}
                    onChange={onFormChange}
                    className="glass-input w-full"
                    placeholder="Studio name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold tracking-wide text-white/70">
                    Publisher
                  </label>
                  <input
                    name="publisher"
                    value={form.publisher}
                    onChange={onFormChange}
                    className="glass-input w-full"
                    placeholder="Publisher"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold tracking-wide text-white/70">
                    Release Date
                  </label>
                  <input
                    type="date"
                    name="release_date"
                    value={form.release_date}
                    onChange={onFormChange}
                    className="glass-input w-full"
                    required
                    style={{ colorScheme: "dark" }}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-extrabold tracking-wide text-white/70">
                    File Size (MB)
                  </label>
                  <input
                    type="number"
                    name="file_size_mb"
                    value={form.file_size_mb}
                    onChange={onFormChange}
                    className="glass-input w-full"
                    min={0}
                    step="any"
                    placeholder="e.g. 45000"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-extrabold tracking-wide text-white/70">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={onFormChange}
                    className="glass-input w-full"
                    rows={4}
                    placeholder="Shown on cards…"
                    required
                    style={{ resize: "vertical" }}
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-extrabold tracking-wide text-white/70">
                    Long Description
                  </label>
                  <textarea
                    name="long_description"
                    value={form.long_description}
                    onChange={onFormChange}
                    className="glass-input w-full"
                    rows={6}
                    placeholder="Shown on the game detail page…"
                    style={{ resize: "vertical" }}
                  />
                </div>

                <div className="md:col-span-2 flex flex-wrap gap-6 pt-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/70">
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={form.is_featured}
                      onChange={onFormChange}
                      className="h-4 w-4"
                      style={{ accentColor: "#a855f7" }}
                    />
                    Featured
                  </label>
                  <label className="flex items-center gap-2 text-sm font-semibold text-white/70">
                    <input
                      type="checkbox"
                      name="is_visible"
                      checked={form.is_visible}
                      onChange={onFormChange}
                      className="h-4 w-4"
                      style={{ accentColor: "#00ffcc" }}
                    />
                    Visible
                  </label>
                </div>
              </div>

              <div className="mt-6 h-px w-full bg-[linear-gradient(90deg,transparent,rgba(0,255,204,0.28),rgba(168,85,247,0.28),transparent)]" />

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className={cn(
                    "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-black transition",
                    saving
                      ? "cursor-not-allowed bg-white/10 text-white/60"
                      : "bg-[#00ffcc] text-black shadow-[0_0_34px_rgba(0,255,204,0.22)] hover:shadow-[0_0_52px_rgba(0,255,204,0.32)]",
                  )}
                >
                  {saving ? "Saving…" : editing ? "Save Changes" : "Add Game"}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={saving}
                  className="rounded-xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-bold text-white/80 hover:bg-white/10 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {confirmDeleteId ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-[rgba(10,10,10,0.80)] p-5 backdrop-blur"
          onClick={(e) => {
            if (e.currentTarget === e.target) setConfirmDeleteId(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-red-400/25 bg-[rgba(26,26,26,0.70)] p-6 shadow-[0_0_70px_rgba(239,68,68,0.14)] backdrop-blur-xl">
            <div className="flex items-start gap-4">
              <div className="grid size-11 place-items-center rounded-xl border border-red-400/25 bg-[rgba(239,68,68,0.10)] text-red-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-black text-white">Delete game</h3>
                <p className="mt-1 text-sm text-white/65">
                  Permanently remove{" "}
                  <span className="font-bold text-red-300">
                    {deleteTarget?.title ?? "this game"}
                  </span>
                  ?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="ml-auto text-white/60 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 h-px w-full bg-white/10" />

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/80 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={doDelete}
                className="flex-1 rounded-xl border border-red-400/25 bg-[rgba(239,68,68,0.12)] px-4 py-2.5 text-sm font-black text-red-200 hover:bg-[rgba(239,68,68,0.18)]"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

