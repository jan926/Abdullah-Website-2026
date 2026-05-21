import { Link, useNavigate } from "react-router";
import { Search, Shield, Gamepad2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ThemeToggle } from "./ThemeToggle";
import { useState, useEffect } from "react";
import { loadSiteSettings } from "../../lib/gameStore";

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [siteName, setSiteName] = useState("SF Games PC");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const authenticated = localStorage.getItem("adminAuthenticated");
    setIsAdminAuthenticated(authenticated === "true");
    loadSiteSettings()
      .then((settings) => {
        setSiteName(settings.siteName || "SF Games PC");
        setLogoUrl(settings.logoUrl || null);
      })
      .catch((error) => console.error("Failed to load site settings:", error));
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAdminAuthenticated) {
      navigate("/admin");
    } else {
      navigate("/admin/login");
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
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search for games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-full"
                />
              </div>
            </form>
          </div>

          <div className="order-2 sm:order-none flex items-center gap-3 justify-end">
            <ThemeToggle />
            <Link
              to="/categories"
              className="text-[var(--foreground)] hover:text-cyan-400 transition-colors font-medium hidden md:block"
            >
              Browse
            </Link>
            <Button
              variant="default"
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-4 py-2 rounded-full neon-glow-cyan"
              onClick={handleAdminClick}
            >
              <Shield className="mr-2 h-4 w-4" />
              Admin
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
