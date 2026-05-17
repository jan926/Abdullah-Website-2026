import type { Game } from "../app/data/games";
import { getGameCategories } from "./gameCategories";

const SITE_URL = "https://steamfree.games";

export const buildSiteKeywords = (games: Game[], categories: string[]) => {
  const parts = new Set<string>();

  const add = (value?: string) => {
    if (!value) return;
    value
      .split(/[,|/]+/)
      .map((v) => v.trim())
      .filter(Boolean)
      .forEach((v) => parts.add(v.toLowerCase()));
  };

  [
    "download pc games",
    "free pc games download",
    "game download site",
    "latest pc games",
    "full version pc games",
    "direct download games",
    "cracked pc games download",
    "repack games download",
    "steam games download",
    "indie games download",
    "action games download",
    "adventure games download",
    "rpg games download",
    "racing games download",
    "horror games download",
    "open world games download",
    "multiplayer pc games",
    "single player pc games",
    "windows games download",
    "highly compressed pc games",
  ].forEach((k) => parts.add(k));

  categories.forEach((c) => {
    add(c);
    add(`${c} games download`);
    add(`download ${c} games for pc`);
  });

  games.forEach((game) => {
    add(game.title);
    add(game.developer);
    getGameCategories(game).forEach((c) => {
      add(c);
      add(`${c} games`);
    });
    add(`${game.title} download`);
    add(`${game.title} free download`);
    add(`${game.title} pc download`);
    add(`${game.title} full version`);
    game.tags?.forEach((tag) => add(tag));
  });

  return Array.from(parts).slice(0, 600).join(", ");
};

export const setDocumentMeta = (opts: {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}) => {
  document.title = opts.title;

  const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
    let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.content = content;
  };

  setMeta("description", opts.description);
  if (opts.keywords) setMeta("keywords", opts.keywords);
  setMeta("og:title", opts.title, "property");
  setMeta("og:description", opts.description, "property");
  setMeta("og:type", opts.type || "website", "property");
  setMeta("og:url", opts.url || SITE_URL, "property");
  setMeta("og:image", opts.image || `${SITE_URL}/og-image.png`, "property");
  setMeta("twitter:title", opts.title);
  setMeta("twitter:description", opts.description);
  setMeta("twitter:image", opts.image || `${SITE_URL}/og-image.png`);
};

export const injectJsonLd = (id: string, data: object) => {
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

export const buildGameJsonLd = (game: Game, siteName = "Download Your Games") => ({
  "@context": "https://schema.org",
  "@type": "VideoGame",
  name: game.title,
  description: game.description,
  genre: getGameCategories(game),
  keywords: game.tags?.join(", "),
  image: [game.cover, ...(game.screenshots || [])].filter(Boolean),
  author: { "@type": "Organization", name: game.developer },
  publisher: { "@type": "Organization", name: siteName },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: game.rating,
    ratingCount: Math.max(game.downloads, 1),
  },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: `https://steamfree.games/game/${game.id}`,
  },
});

export const buildSiteJsonLd = (siteName: string, siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  alternateName: [siteName, `${siteName} download`, `${siteName} games`],
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});
