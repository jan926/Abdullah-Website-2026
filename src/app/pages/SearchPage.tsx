import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Game } from "../data/games";
import { getGamesSync, loadGames } from "../../lib/gameStore";
import { GameCard } from "../components/GameCard";
import { Input } from "../components/ui/input";
import { Search } from "lucide-react";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<Game[]>(() => getGamesSync());

  const filterGames = (games: Game[], query: string) => {
    if (!query.trim()) return games;
    const q = query.toLowerCase();
    return games.filter(
      (game) =>
        game.title.toLowerCase().includes(q) ||
        game.description.toLowerCase().includes(q) ||
        game.category.toLowerCase().includes(q) ||
        game.categories?.some((c) => c.toLowerCase().includes(q)) ||
        game.tags?.some((t) => t.toLowerCase().includes(q)) ||
        game.developer.toLowerCase().includes(q)
    );
  };

  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);

    setResults(filterGames(getGamesSync(), query));

    loadGames({ background: true })
      .then((games) => {
        setResults(filterGames(games, query));
      })
      .catch((error) => console.error("Failed to load games for search:", error));
  }, [searchParams]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="container mx-auto px-3 sm:px-6 py-12">
        <div className="mb-12">
          <h1 className="mb-4 bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-3xl sm:text-4xl font-bold text-transparent">
            Search Games
          </h1>

          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search by title, category, or developer..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 bg-[#151b38] border-[#1e2952] text-white placeholder:text-gray-500 focus-visible:ring-cyan-500 text-base sm:text-lg py-4 sm:py-6 rounded-lg"
            />
          </div>
        </div>

        <div className="mb-6">
          <p className="text-gray-400">
            {searchQuery.trim() ? (
              <>
                Found <span className="font-semibold text-white">{results.length}</span> game
                {results.length !== 1 ? "s" : ""} for "{searchQuery}"
              </>
            ) : (
              <>Showing all <span className="font-semibold text-white">{results.length}</span> games</>
            )}
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {results.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#151b38]">
              <Search className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-white">No games found</h3>
            <p className="text-gray-400">
              Try searching with different keywords
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
