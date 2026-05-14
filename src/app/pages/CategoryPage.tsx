import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { Game } from "../data/games";
import { loadGames } from "../../lib/gameStore";
import { GameCard } from "../components/GameCard";
import { ChevronLeft } from "lucide-react";

export default function CategoryPage() {
  const { category } = useParams();
  const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : "";
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    setGames(loadGames());
  }, []);

  const categoryGames = games.filter(
    (game) => game.category.toLowerCase() === category?.toLowerCase()
  );

  const categoryColors: Record<string, string> = {
    action: "from-blue-500 to-blue-700",
    adventure: "from-orange-500 to-orange-700",
    rpg: "from-purple-500 to-purple-700",
    racing: "from-green-500 to-green-700",
    survival: "from-red-500 to-red-700",
    shooter: "from-cyan-500 to-cyan-700",
    sports: "from-yellow-500 to-yellow-700",
    strategy: "from-pink-500 to-pink-700",
  };

  const gradientClass = categoryColors[category?.toLowerCase() || ""] || "from-cyan-500 to-purple-500";

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      {/* Category Header */}
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
          <h1 className="text-5xl font-bold text-white mb-4">{categoryName} Games</h1>
          <p className="text-white/90 text-lg">
            Discover {categoryGames.length} amazing {categoryName.toLowerCase()} games
          </p>
        </div>
      </div>

      {/* Games Grid */}
      <div className="container mx-auto px-6 py-12">
        {categoryGames.length > 0 ? (
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
              We couldn't find any games in the {categoryName} category
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
