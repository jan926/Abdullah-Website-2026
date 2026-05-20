import { useState } from "react";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Cpu, HardDrive, Zap, Database, Search, CheckCircle2 } from "lucide-react";
import { searchGameRequirements, getGameRequirementsSuggestions } from "../../lib/gameRequirementsDb";

type SystemReq = {
  os: string;
  processor: string;
  memory: string;
  graphics: string;
  storage: string;
};

type Props = {
  minimum: SystemReq;
  recommended: SystemReq;
  onChange: (patch: { minimum?: SystemReq; recommended?: SystemReq }) => void;
};

const FIELDS = [
  { key: "os", label: "Operating System", icon: null },
  { key: "processor", label: "Processor (CPU)", icon: Cpu },
  { key: "memory", label: "Memory (RAM)", icon: Zap },
  { key: "graphics", label: "Graphics (GPU)", icon: Database },
  { key: "storage", label: "Storage Space", icon: HardDrive },
];

export function SystemRequirementsEditor({ minimum, recommended, onChange }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [storeSource, setStoreSource] = useState<"all" | "steam" | "epic" | "ea" | "ubisoft" | "arealgamer">("all");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuccess, setSearchSuccess] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const updateField = (type: "minimum" | "recommended", key: string, value: string) => {
    if (type === "minimum") {
      onChange({ minimum: { ...minimum, [key]: value } });
    } else {
      onChange({ recommended: { ...recommended, [key]: value } });
    }
  };

  const handleSearchInput = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 1) {
      const localResults = getGameRequirementsSuggestions(query);
      setSuggestions(localResults);
      setShowSuggestions(true);

      if (query.length > 2) {
        setIsFetchingSuggestions(true);
        try {
          const response = await fetch(
            `/api/steam-search?type=suggest&name=${encodeURIComponent(query)}&store=${encodeURIComponent(storeSource)}`
          );
          if (response.ok) {
            const data = await response.json();
            const remoteResults = Array.isArray(data?.suggestions) ? data.suggestions : [];
            const combined = Array.from(new Set([...localResults, ...remoteResults])).slice(0, 10);
            setSuggestions(combined);
          }
        } catch (error) {
          console.error("Suggestion fetch error:", error);
        } finally {
          setIsFetchingSuggestions(false);
        }
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleAutoFill = async (gameName?: string) => {
    const nameToSearch = gameName || searchQuery;
    if (!nameToSearch.trim()) return;

    setIsSearching(true);
    setSearchSuccess(false);
    
    try {
      const gameReqs = await searchGameRequirements(nameToSearch, storeSource);
      if (gameReqs) {
        onChange({
          minimum: gameReqs.minimum,
          recommended: gameReqs.recommended,
        });
        setSearchSuccess(true);
        setSearchQuery("");
        setShowSuggestions(false);
        setSuggestions([]);
        setTimeout(() => setSearchSuccess(false), 3000);
      } else {
        alert("Game not found in database. Please enter manually.");
      }
    } catch (error) {
      console.error("Search error:", error);
      alert("Error searching for game requirements");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Auto-fill Search Section */}
      <Card className="p-4 md:p-6 border-[var(--border)] shadow-sm bg-gradient-to-r from-cyan-500/5 to-blue-500/5">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400" />
            <Label className="text-[var(--foreground)] font-semibold">
              Auto-fill from Game Database
            </Label>
            {searchSuccess && (
              <div className="flex items-center gap-1 text-emerald-400 text-sm ml-auto">
                <CheckCircle2 className="w-4 h-4" />
                Filled!
              </div>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-[220px_1fr] items-end">
            <div className="space-y-2">
              <Label className="text-[var(--foreground)]">Store source</Label>
              <Select value={storeSource} onValueChange={(value) => setStoreSource(value as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All stores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stores</SelectItem>
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
                    onChange={(e) => handleSearchInput(e.target.value)}
                    placeholder="Type game name (e.g., Cyberpunk 2077, Elden Ring)..."
                    className="border-[var(--border)]"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {isFetchingSuggestions && (
                        <div className="px-3 py-2 text-xs text-[var(--muted-foreground)]">
                          Loading suggestions...
                        </div>
                      )}
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => handleAutoFill(suggestion)}
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
                  disabled={isSearching || !searchQuery.trim()}
                  className="bg-cyan-500 hover:bg-cyan-600 text-white"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Search local matches and live store suggestions from Steam, Epic, EA, Ubisoft, and ARealGamer.
          </p>
        </div>
      </Card>

      {/* Manual Entry Section */}
      <div className="space-y-4">
        <Label className="text-[var(--foreground)] font-semibold">
          Or enter system requirements manually
        </Label>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Minimum Requirements */}
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
                  onChange={(e) => updateField("minimum", key, e.target.value)}
                  className="border-[var(--border)]"
                  placeholder={`e.g., ${getPlaceholder(key)}`}
                />
              </div>
            ))}
          </div>
        </Card>

        {/* Recommended Requirements */}
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
                  onChange={(e) => updateField("recommended", key, e.target.value)}
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
