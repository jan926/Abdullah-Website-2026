import { useEffect } from "react";
import { useLocation } from "react-router";
import { loadGames, loadSiteSettings, loadCategories } from "../../lib/gameStore";
import { buildSiteJsonLd, buildSiteKeywords, injectJsonLd, setDocumentMeta } from "../../lib/seo";

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
        const siteName = settings.siteName || "SF Games PC";
        const baseTitle = `${siteName} - Download Free PC Games`;

        const siteUrl = window.location.origin;
        setDocumentMeta({
          title: baseTitle,
          description: `${baseTitle}. Browse ${games.length}+ full-version titles, repacks, and updates.`,
          keywords: [siteName, `${siteName} download`, `${siteName} games`, keywords].join(", "),
          url: `${siteUrl}${location.pathname}`,
        });

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
  }, [location.pathname]);

  return null;
}
