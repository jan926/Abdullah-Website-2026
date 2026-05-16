import { useEffect } from "react";
import { useLocation } from "react-router";
import { loadGames, loadSiteSettings, loadCategories } from "../../lib/gameStore";
import { buildSiteKeywords, injectJsonLd, setDocumentMeta } from "../../lib/seo";

export function SiteMeta() {
  const location = useLocation();

  useEffect(() => {
    const apply = async () => {
      try {
        const [settings, games, categories] = await Promise.all([
          loadSiteSettings(),
          loadGames(),
          loadCategories(),
        ]);

        const keywords = buildSiteKeywords(games, categories.filter((c) => c !== "All"));
        const siteName = settings.siteName || "Download Your Games";

        setDocumentMeta({
          title: `${siteName} | PC Game Downloads`,
          description: `Download the latest PC games on ${siteName}. Browse ${games.length}+ titles across ${categories.length} categories with fast links and updates.`,
          keywords,
          url: `https://steamfree.games${location.pathname}`,
        });

        injectJsonLd("site-jsonld", {
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: siteName,
          url: "https://steamfree.games/",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://steamfree.games/search?q={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        });

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
  }, [location.pathname]);

  return null;
}
