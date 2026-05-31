import { useEffect, useRef, useState } from "react";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Cpu, HardDrive, Zap, Database, Search, CheckCircle2, Wand2 } from "lucide-react";
import { getGameRequirementsSuggestions, searchGameRequirements } from "../../lib/gameRequirementsDb";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

type SystemReq = {
  os: string;
  processor: string;
  memory: string;
  graphics: string;
  storage: string;
};

export type AutoFillResult = {
  minimum: SystemReq;
  recommended: SystemReq;
  developer: string;
  description: string;
  tags: string;
};

type Props = {
  minimum: SystemReq;
  recommended: SystemReq;
  gameTitle?: string;
  onChange: (patch: { minimum?: SystemReq; recommended?: SystemReq }) => void;
  onAutoFillComplete?: (result: AutoFillResult) => void;
  /** @deprecated Use onAutoFillComplete for a single atomic form update */
  onMetaFill?: (patch: { developer?: string; description?: string; tags?: string }) => void;
};

const FIELDS = [
  { key: "os", label: "Operating System", icon: null },
  { key: "processor", label: "Processor (CPU)", icon: Cpu },
  { key: "memory", label: "Memory (RAM)", icon: Zap },
  { key: "graphics", label: "Graphics (GPU)", icon: Database },
  { key: "storage", label: "Storage Space", icon: HardDrive },
];

const buildFallbackDescription = (gameName: string) =>
  `Download ${gameName} free for PC — full version with screenshots, system requirements, and installation guide on AQ Gaming Hub.`;

const buildFallbackTags = (gameName: string) =>
  [
    gameName,
    `${gameName} download`,
    `${gameName} free download pc`,
    `${gameName} free download for pc`,
    `${gameName} full version`,
    `${gameName} aq gaming hub`,
    "pc game download",
    "free pc games",
  ].join(", ");

const applyAutoFillResult = (
  result: AutoFillResult,
  onAutoFillComplete?: (result: AutoFillResult) => void,
  onChange?: Props["onChange"],
  onMetaFill?: Props["onMetaFill"]
) => {
  if (onAutoFillComplete) {
    onAutoFillComplete(result);
    return;
  }

  onChange?.({
    minimum: result.minimum,
    recommended: result.recommended,
  });
  onMetaFill?.({
    developer: result.developer,
    description: result.description,
    tags: result.tags,
  });
};

export function SystemRequirementsEditor({
  minimum,
  recommended,
  gameTitle = "",
  onChange,
  onAutoFillComplete,
  onMetaFill,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebouncedValue(searchQuery, 400);
  const [storeSource, setStoreSource] = useState<"all" | "steam" | "epic" | "ea" | "ubisoft" | "arealgamer">("all");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuccess, setSearchSuccess] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fillError, setFillError] = useState("");
  const suggestAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (gameTitle.trim() && !searchQuery.trim()) {
      setSearchQuery(gameTitle.trim());
    }
  }, [gameTitle]);

  useEffect(() => {
    const query = debouncedQuery.trim();

    if (query.length <= 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const localResults = getGameRequirementsSuggestions(query);
    setSuggestions(localResults);
    setShowSuggestions(true);

    if (query.length <= 2) return;

    suggestAbortRef.current?.abort();
    const controller = new AbortController();
    suggestAbortRef.current = controller;

    setIsFetchingSuggestions(true);
    fetch(
      `/api/steam-search?type=suggest&name=${encodeURIComponent(query)}&store=${encodeURIComponent(storeSource)}`,
      { signal: controller.signal }
    )
      .then((response) => (response.ok ? response.json() : { suggestions: [] }))
      .then((data) => {
        const remoteResults = Array.isArray(data?.suggestions) ? data.suggestions : [];
        const combined = Array.from(new Set([...localResults, ...remoteResults])).slice(0, 10);
        setSuggestions(combined);
      })
      .catch((error) => {
        if ((error as Error).name !== "AbortError") {
          console.error("Suggestion fetch error:", error);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsFetchingSuggestions(false);
      });

    return () => controller.abort();
  }, [debouncedQuery, storeSource]);

  const resolveSearchName = (gameName?: string) => {
    const candidate = (gameName || searchQuery || gameTitle || "").trim();
    return candidate;
  };

  const handleAutoFill = async (gameName?: string) => {
    const nameToSearch = resolveSearchName(gameName);
    if (!nameToSearch) {
      setFillError("Enter a game title above or type a name in the search box.");
      return;
    }

    setIsSearching(true);
    setSearchSuccess(false);
    setFillError("");

    try {
      const gameReqs = await searchGameRequirements(nameToSearch, storeSource);

      if (!gameReqs) {
        setFillError("Game not found. Try Steam store source or check the spelling.");
        return;
      }

      const displayName = gameReqs.title?.trim() || nameToSearch;
      const result: AutoFillResult = {
        minimum: gameReqs.minimum,
        recommended: gameReqs.recommended,
        developer: gameReqs.developer?.trim() || "Independent Studio",
        description:
          gameReqs.description?.trim() || buildFallbackDescription(displayName),
        tags:
          Array.isArray(gameReqs.tags) && gameReqs.tags.length
            ? gameReqs.tags.join(", ")
            : buildFallbackTags(displayName),
      };

      applyAutoFillResult(result, onAutoFillComplete, onChange, onMetaFill);

      setSearchSuccess(true);
      setShowSuggestions(false);
      setSuggestions([]);
      setTimeout(() => setSearchSuccess(false), 3000);
    } catch (error) {
      console.error("Search error:", error);
      setFillError("Search failed. Check your connection and try again.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 md:p-6 border-[var(--border)] shadow-sm bg-gradient-to-r from-cyan-500/5 to-blue-500/5">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400 shrink-0" />
            <Label className="text-[var(--foreground)] font-semibold">
              Auto-fill requirements, description, tags & developer
            </Label>
            {searchSuccess && (
              <div className="flex items-center gap-1 text-emerald-400 text-sm ml-auto">
                <CheckCircle2 className="w-4 h-4" />
                All fields filled
              </div>
            )}
          </div>

          {gameTitle.trim() && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
              onClick={() => handleAutoFill(gameTitle.trim())}
              disabled={isSearching}
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Auto-fill using game title: &quot;{gameTitle.trim()}&quot;
            </Button>
          )}

          <div className="grid gap-3 sm:grid-cols-[220px_1fr] items-end">
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">Store source</Label>
              <Select value={storeSource} onValueChange={(value) => setStoreSource(value as typeof storeSource)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stores (recommended)</SelectItem>
                  <SelectItem value="steam">Steam</SelectItem>
                  <SelectItem value="epic">Epic Games</SelectItem>
                  <SelectItem value="ea">EA / Origin</SelectItem>
                  <SelectItem value="ubisoft">Ubisoft</SelectItem>
                  <SelectItem value="arealgamer">ARealGamer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="relative">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setFillError("");
                    }}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Type game name (e.g., Tekken 6, Elden Ring)..."
                    className="border-[var(--border)]"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                      {isFetchingSuggestions && (
                        <div className="px-3 py-2 text-xs text-[var(--muted-foreground)]">
                          Loading suggestions...
                        </div>
                      )}
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            setSearchQuery(suggestion);
                            void handleAutoFill(suggestion);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-[var(--muted)] border-b border-[var(--border)] last:border-b-0 text-sm text-[var(--foreground)]"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={() => handleAutoFill()}
                  disabled={isSearching || !resolveSearchName()}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white shrink-0"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isSearching ? "Searching..." : "Auto-fill"}
                </Button>
              </div>
            </div>
          </div>

          {fillError && <p className="text-sm text-red-400">{fillError}</p>}
          <p className="text-xs text-[var(--muted-foreground)]">
            Fills system requirements, developer, description, and SEO tags from Steam / ARealGamer databases.
          </p>
        </div>
      </Card>

      <div className="space-y-4">
        <Label className="text-[var(--foreground)] font-semibold">
          Or enter system requirements manually
        </Label>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 border-[var(--border)] shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Minimum Requirements
            </h3>
            <div className="space-y-4">
              {FIELDS.map(({ key, label, icon: Icon }) => (
                <div key={`min-${key}`} className="space-y-2">
                  <Label className="text-[var(--foreground)] flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4" />}
                    {label}
                  </Label>
                  <Input
                    value={minimum[key as keyof SystemReq]}
                    onChange={(e) => onChange({ minimum: { ...minimum, [key]: e.target.value } })}
                    className="border-[var(--border)]"
                    placeholder={`e.g., ${getPlaceholder(key)}`}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 border-[var(--border)] shadow-sm">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">
              Recommended Requirements
            </h3>
            <div className="space-y-4">
              {FIELDS.map(({ key, label, icon: Icon }) => (
                <div key={`rec-${key}`} className="space-y-2">
                  <Label className="text-[var(--foreground)] flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4" />}
                    {label}
                  </Label>
                  <Input
                    value={recommended[key as keyof SystemReq]}
                    onChange={(e) => onChange({ recommended: { ...recommended, [key]: e.target.value } })}
                    className="border-[var(--border)]"
                    placeholder={`e.g., ${getPlaceholder(key)}`}
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function getPlaceholder(key: string): string {
  const placeholders: Record<string, string> = {
    os: "Windows 10 64-bit",
    processor: "Intel Core i5-8400",
    memory: "8 GB RAM",
    graphics: "NVIDIA GTX 1060 6GB",
    storage: "100 GB SSD",
  };
  return placeholders[key] || "";
}
