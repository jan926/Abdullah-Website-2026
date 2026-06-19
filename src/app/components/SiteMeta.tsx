import { useEffect } from "react";
import { useLocation } from "react-router";
import { loadGames, loadSiteSettings, loadCategories } from "../../lib/gameStore";
import { gameHasCategory } from "../../lib/gameCategories";
import {
  buildCategoriesHubDescription,
  buildCategoriesHubTitle,
  buildCategoryMetaDescription,
  buildCategoryPageTitle,
  buildHomeMetaDescription,
  buildHomePageTitle,
  buildSearchPageDescription,
  buildSearchPageTitle,
  buildSiteJsonLd,
  buildSiteKeywords,
  injectJsonLd,
  removeJsonLd,
  setDocumentMeta,
  SITE_URL,
} from "../../lib/seo";

function parseCategoryFromPath(pathname: string) {
  const match = pathname.match(/^\/category\/([^/]+)/);
  if (!match) return null;

  const raw = decodeURIComponent(match[1]).toLowerCase();
  if (raw === "all") return "All";

  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function SiteMeta() {
  const location = useLocation();

  useEffect(() => {
    if (/^\/game\/[^/]+/.test(location.pathname)) {
      removeJsonLd("site-jsonld");
      return;
    }

    const apply = async () => {
      try {
        const [settings, games, categories] = await Promise.all([
          loadSiteSettings(),
          loadGames(),
          loadCategories(),
        ]);

        const siteName = settings.siteName || "AQ Gaming Hub";
        const siteUrl = SITE_URL.replace(/\/$/, "");
        const pageUrl = `${siteUrl}${location.pathname}${location.search}`;
        const catalogKeywords = buildSiteKeywords(games, categories.filter((c) => c !== "All"));
        const categoryFromPath = parseCategoryFromPath(location.pathname);
        const searchQuery = new URLSearchParams(location.search).get("q")?.trim() || "";

        let title = buildHomePageTitle(siteName);
        let description = buildHomeMetaDescription(siteName, games.length);

        if (location.pathname === "/") {
          title = buildHomePageTitle(siteName);
          description = buildHomeMetaDescription(siteName, games.length);
        } else if (location.pathname === "/categories") {
          title = buildCategoriesHubTitle(siteName);
          description = buildCategoriesHubDescription(
            siteName,
            categories.filter((c) => c !== "All").length
          );
        } else if (categoryFromPath) {
          const categoryGames = categoryFromPath === "All"
            ? games
            : games.filter((game) => gameHasCategory(game, categoryFromPath));

          title = buildCategoryPageTitle(categoryFromPath, siteName);
          description = buildCategoryMetaDescription(
            categoryFromPath,
            categoryGames.length,
            siteName
          );
        } else if (location.pathname === "/search") {
          title = buildSearchPageTitle(searchQuery, siteName);
          description = buildSearchPageDescription(searchQuery, siteName);
        }

        setDocumentMeta({
          title,
          description,
          keywords: [
            siteName,
            siteName.toLowerCase(),
            `${siteName} official`,
            `${siteName} PC games`,
            `${siteName} free download`,
            `${siteName} pc games free download`,
            `${siteName} download free PC games`,
            `${siteName} steamfree.games`,
            "steamfree.games AQ Gaming Hub",
            "SteamFree Games",
            "steamfree.games",
            "free pc games download for pc",
            "free pc games download",
            catalogKeywords,
          ].join(", "),
          url: pageUrl,
          siteName,
          imageAlt: `${siteName} on steamfree.games - Free PC Games Download`,
        });

        removeJsonLd("game-jsonld");
        injectJsonLd("site-jsonld", buildSiteJsonLd(siteName, `${siteUrl}/`));

        if (settings.logoUrl) {
          let link = document.querySelector("link[rel='icon']") as HTMLLinkElement | null;
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = settings.logoUrl;
        }
      } catch (error) {
        console.error("Failed to apply site meta:", error);
      }
    };

    apply();
  }, [location.pathname, location.search]);

  return null;
}
