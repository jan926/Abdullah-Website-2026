import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (resolvedTheme === "light" || resolvedTheme === "dark") {
      setCurrentTheme(resolvedTheme);
    }
  }, [resolvedTheme]);

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="rounded-full border-[var(--border)] opacity-50" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = currentTheme === "dark";

  const handleThemeChange = () => {
    const newTheme = isDark ? "light" : "dark";
    setCurrentTheme(newTheme);
    setTheme(newTheme);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className="rounded-full border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)]"
      onClick={handleThemeChange}
      aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
      aria-pressed={isDark}
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
