import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { Game } from "../data/games";
import { loadGames } from "../../lib/gameStore";
import { getCategoryStyle } from "../../lib/categoryStyles";
import { GameCard } from "../components/GameCard";
import { ChevronLeft } from "lucide-react";
import { Skeleton } from "../components/ui/skeleton";

export default function CategoryPage() {
  const { category } = useParams();
  const raw = category?.toLowerCase() || "";
  const isAll = raw === "all";
  const categoryName = isAll
    ? "All"
    : category
      ? decodeURIComponent(category).charAt(0).toUpperCase() + decodeURIComponent(category).slice(1)
      : "";
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    loadGames()
      .then(setGames)
      .catch((error) => console.error("Failed to load games:", error))
      .finally(() => setLoading(false));
  }, []);

  const categoryGames = isAll
    ? games
    : games.filter((game) => game.category.toLowerCase() === raw);

  const gradientClass = isAll ? "from-indigo-500 to-purple-700" : getCategoryStyle(categoryName).gradient;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className={`bg-gradient-to-r ${gradientClass} py-16 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-black/30" />
        <div className="container mx-auto px-6 relative z-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition"
          >
            <ChevronLeft className="h-5 w-5" />
            Back to Home
          </Link>
          <h1 className="text-5xl font-bold text-white mb-4">
            {isAll ? "All Games" : `${categoryName} Games`}
          </h1>
          <p className="text-white/90 text-lg">
            {loading
              ? "Loading games..."
              : `Discover ${categoryGames.length} amazing ${isAll ? "" : categoryName.toLowerCase() + " "}games`}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-[380px] w-full rounded-xl" />
            ))}
          </div>
        ) : categoryGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {categoryGames.map((game, index) => (
              <div key={game.id} className="stagger-item" style={{ animationDelay: `${index * 0.05}s` }}>
                <GameCard game={game} />
              </div>
            ))}
          </div>
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
