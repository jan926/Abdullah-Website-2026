import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { loadSiteSettings, saveSiteSettings } from "../../lib/gameStore";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button variant="outline" size="sm" className="opacity-0 pointer-events-none">...</Button>;
  }

  const isDark = theme === "dark";
  
  const handleThemeChange = () => {
    const newTheme = isDark ? "light" : "dark";
    setTheme(newTheme);
    
    // Save to site settings
    const settings = loadSiteSettings();
    saveSiteSettings({ ...settings, theme: newTheme as "light" | "dark" });
  };
  
  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-full border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]"
      onClick={handleThemeChange}
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
