import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { loadSiteSettings, saveSiteSettings } from "../../lib/gameStore";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadSiteSettings()
      .then((settings) => setTheme(settings.theme))
      .catch(() => undefined);
  }, [setTheme]);

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="rounded-full border-[var(--border)] opacity-50" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  const handleThemeChange = () => {
    const newTheme = isDark ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");

    loadSiteSettings()
      .then((settings) => saveSiteSettings({ ...settings, theme: newTheme }))
      .catch((error) => console.error("Failed to save theme:", error));
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-full border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]"
      onClick={handleThemeChange}
      aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
    >
      {isDark ? (
        <Sun className="mr-2 h-4 w-4 text-yellow-300" />
      ) : (
        <Moon className="mr-2 h-4 w-4 text-slate-800" />
      )}
      {isDark ? "Day" : "Night"}
    </Button>
  );
}
