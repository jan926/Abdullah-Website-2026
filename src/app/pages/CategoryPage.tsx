import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router";
import { Game } from "../data/games";
import { loadGames, getGamesSync } from "../../lib/gameStore";
import { gameHasCategory } from "../../lib/gameCategories";
import { getCategoryStyle } from "../../lib/categoryStyles";
import { GameCard } from "../components/GameCard";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";

const GAMES_PER_PAGE = 24;

export default function CategoryPage() {
  const { category } = useParams();
  const raw = category?.toLowerCase() || "";
  const isAll = raw === "all";
  const categoryName = isAll
    ? "All"
    : category
      ? decodeURIComponent(category).charAt(0).toUpperCase() + decodeURIComponent(category).slice(1)
      : "";
  const [games, setGames] = useState<Game[]>(() => getGamesSync());
  const [loading, setLoading] = useState(() => getGamesSync().length === 0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (games.length === 0) setLoading(true);
    loadGames({ background: true })
      .then(setGames)
      .catch((error) => console.error("Failed to load games:", error))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setPage(1);
  }, [categoryName, isAll]);

  const categoryGames = useMemo(
    () => (isAll ? games : games.filter((game) => gameHasCategory(game, categoryName))),
    [games, isAll, categoryName]
  );

  const totalPages = Math.max(1, Math.ceil(categoryGames.length / GAMES_PER_PAGE));

  const visibleGames = useMemo(() => {
    const start = (page - 1) * GAMES_PER_PAGE;
    return categoryGames.slice(start, start + GAMES_PER_PAGE);
  }, [categoryGames, page]);

  const gradientClass = isAll ? "from-indigo-500 to-purple-700" : getCategoryStyle(categoryName).gradient;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className={`bg-gradient-to-r ${gradientClass} py-10 sm:py-16 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="container mx-auto px-3 sm:px-6 relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Home
          </Link>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4">
            {isAll ? "All PC Games Free Download" : `${categoryName} Games Free Download`}
          </h1>
          <p className="text-white/90 text-base sm:text-lg">
            {loading
              ? "Loading games..."
              : `Discover ${categoryGames.length} amazing ${isAll ? "" : categoryName.toLowerCase() + " "}games`}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-[320px] w-full rounded-xl" />
            ))}
          </div>
        ) : categoryGames.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {visibleGames.map((game) => (
                <GameCard key={game.id} game={game} compact />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Page {page} of {totalPages} · {categoryGames.length} games
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 rounded-lg bg-[var(--card)] text-sm disabled:opacity-40 hover:bg-[var(--muted)] transition"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-4 py-2 rounded-lg bg-[var(--card)] text-sm disabled:opacity-40 hover:bg-[var(--muted)] transition"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-bold text-white mb-2">No games found</h3>
            <p className="text-gray-400 mb-6">
              {isAll ? "No games in the catalog yet." : `We couldn't find any games in the ${categoryName} category`}
            </p>
            <Link
              to="/"
              className="inline-block px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg transition"
            >
              Browse All Games
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
