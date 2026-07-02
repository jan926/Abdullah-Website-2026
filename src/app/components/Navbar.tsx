import { Link, useNavigate } from "react-router";
import { Search, Gamepad2, Eye } from "lucide-react";
import { Input } from "./ui/input";
import { ThemeToggle } from "./ThemeToggle";
import { useState, useEffect } from "react";
import { loadSiteSettings } from "../../lib/gameStore";
import { useOnlineUsersCounter } from "../../lib/onlineUsers";

const AFFILIATE_URL = "https://omg10.com/4/11227305";

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [siteName, setSiteName] = useState("AQ Gaming Hub");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const onlineUsers = useOnlineUsersCounter();
  const navigate = useNavigate();

  useEffect(() => {
    loadSiteSettings()
      .then((settings) => {
        setSiteName(settings.siteName || "AQ Gaming Hub");
        setLogoUrl(settings.logoUrl || null);
      })
      .catch((error) => console.error("Failed to load site settings:", error));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (Math.random() < 0.18) {
      window.location.href = AFFILIATE_URL;
      return;
    }

    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[var(--card)] border-b border-[var(--border)] shadow-lg">
      <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <Link to="/" className="flex items-center gap-3 group min-w-0">
            {logoUrl ? (
              <img src={logoUrl} alt="Site logo" loading="lazy" decoding="async" className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <Gamepad2 className="h-10 w-10 text-cyan-400" />
            )}
            <span className="block min-w-0 max-w-[220px] sm:max-w-none truncate text-lg sm:text-2xl font-bold text-[var(--foreground)] leading-tight">
              {siteName.split(" ").map((word, index) => (
                <span key={index} className={index === 1 ? "text-cyan-400" : ""}>
                  {word}{index < siteName.split(" ").length - 1 ? " " : ""}
                </span>
              ))}
            </span>
          </Link>

          <div className="order-3 sm:order-none w-full sm:flex-1 sm:max-w-xl">
            <form onSubmit={handleSearch}>
              <div className="relative flex items-center gap-2">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search for games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-24 py-3 rounded-full"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-cyan-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 transition"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          <div className="order-2 sm:order-none flex items-center gap-3 justify-end">
            <div className="flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs sm:text-sm text-[var(--muted-foreground)] whitespace-nowrap">
              <Eye className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>
                Online: <span className="font-semibold text-[var(--foreground)]">{onlineUsers.toLocaleString()}</span> Users
              </span>
            </div>
            <ThemeToggle />
            <Link
              to="/categories"
              className="text-[var(--foreground)] hover:text-cyan-400 transition-colors font-medium hidden md:block"
            >
              Browse
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
