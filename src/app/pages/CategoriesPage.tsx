import { useState, useEffect } from "react";
import { categories } from "../data/games";
import { Game } from "../data/games";
import { loadGames } from "../../lib/gameStore";

import { GameCard } from "../components/GameCard";
import { Card } from "../components/ui/card";

export default function CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const loaded = await loadGames();
      if (mounted) setGames(loaded);
    })();
    return () => {
      mounted = false;
    };
  }, []);


  const categoryStats = categories.slice(1).map((category) => {
    const gamesInCategory = games.filter((game) => game.category === category);
    return {
      name: category,
      count: gamesInCategory.length,
      totalDownloads: gamesInCategory.reduce((sum, game) => sum + game.downloads, 0),
    };
  });

  const displayGames = selectedCategory
    ? games.filter((game) => game.category === selectedCategory)
    : [];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="mb-4 text-4xl font-bold text-white">
            Browse by Category
          </h1>
          <p className="text-gray-200">
            Explore our collection of games organized by genre
          </p>
        </div>

        {!selectedCategory ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categoryStats.map((category) => (
              <Card
                key={category.name}
                className="group cursor-pointer overflow-hidden border-[#1e2952] bg-[#151b38] backdrop-blur transition-all hover:border-cyan-500 hover:shadow-xl hover:shadow-cyan-500/20"
                onClick={() => setSelectedCategory(category.name)}
              >
                <div className="relative h-48 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <h2 className="mb-2 text-3xl font-bold text-white">
                        {category.name}
                      </h2>
                      <p className="text-lg text-gray-300">
                        {category.count} Games
                      </p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>{(category.totalDownloads / 1000).toFixed(1)}K Total Downloads</span>
                    <span className="text-cyan-400 font-semibold">View All →</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-3xl font-bold text-transparent">
                {selectedCategory} Games
              </h2>
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                ← Back to Categories
              </button>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {displayGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
