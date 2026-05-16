import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import { Game } from "../data/games";
import { loadGames } from "../../lib/gameStore";
import { GameCard } from "../components/GameCard";
import { Input } from "../components/ui/input";
import { Search } from "lucide-react";
import { getSearchSuggestions, fuzzySearch } from "../../lib/aiHelpers";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<Game[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const loadedGames = await loadGames();
      if (!mounted) return;

      setGames(loadedGames);

      const query = searchParams.get("q") || "";
      setSearchQuery(query);

      if (query.trim()) {
        const filtered = fuzzySearch(query, loadedGames);
        setResults(filtered);
      } else {
        setResults(loadedGames);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [searchParams]);


  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(value.length > 0);

    if (value.trim()) {
      // Generate suggestions
      const sug = getSearchSuggestions(value, games);
      setSuggestions(sug);

      // Search with fuzzy matching
      setSearchParams({ q: value });
    } else {
      setSearchParams({});
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="container mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="mb-4 bg-gradient-to-r from-white to-cyan-400 bg-clip-text text-4xl font-bold text-transparent">
            Search Games
          </h1>

          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="Search by title, category, or developer..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setShowSuggestions(searchQuery.length > 0)}
              className="w-full pl-12 bg-[#151b38] border-[#1e2952] text-white placeholder:text-gray-500 focus-visible:ring-cyan-500 text-lg py-6 rounded-lg"
            />

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0f1724] border border-[#1e2952] rounded-lg overflow-hidden shadow-xl">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-4 py-3 hover:bg-[#1e2952] transition flex items-center gap-2"
                  >
                    <Search className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-200">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
