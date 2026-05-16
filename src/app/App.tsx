import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { ThemeProvider } from "next-themes";
import { router } from "./routes";
import { loadSiteSettings } from "../lib/gameStore";

export default function App() {
  useEffect(() => {
    loadSiteSettings()
      .then((settings) => {
        document.documentElement.classList.toggle("dark", settings.theme === "dark");
      })
      .catch((error) => console.error("Failed to load site settings:", error));
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
