import type { Game } from "../app/data/games";
import { getGameCategories } from "./gameCategories";

export const SITE_URL = "https://steamfree.games";

const isCompressedGame = (game: Game) =>
  /compress/i.test(game.title) ||
  /compress/i.test(game.size) ||
  game.tags?.some((tag) => /compress/i.test(tag)) === true;

export const buildGamePageTitle = (game: Game) =>
  isCompressedGame(game)
    ? `${game.title} Highly Compressed Free Download`
    : `${game.title} Free Download for PC Full Version`;

export const buildGameMetaDescription = (game: Game) =>
  `${game.title} PC game free download full version with system requirements, screenshots, and direct installation guide. Size: ${game.size}. Developer: ${game.developer}.`;

export const buildGameCoverAlt = (game: Game) => `${game.title} PC Game Cover`;

export const buildGameScreenshotAlt = (game: Game, index: number) =>
  `${game.title} PC Game Screenshot ${index + 1}`;

export const buildGameHeroAlt = (game: Game) => `${game.title} PC Game Screenshot`;

const getGameDownloadUrl = (game: Game) =>
  game.downloadLink ||
  game.downloadParts?.find((part) => part.link)?.link ||
  `${SITE_URL}/game/${game.id}`;

const formatSystemRequirements = (game: Game) => {
  const min = game.systemRequirements.minimum;
  return `Minimum: ${min.os}, ${min.processor}, ${min.memory} RAM, ${min.graphics}, ${min.storage} storage. Recommended: ${game.systemRequirements.recommended.os}, ${game.systemRequirements.recommended.processor}, ${game.systemRequirements.recommended.memory} RAM, ${game.systemRequirements.recommended.graphics}, ${game.systemRequirements.recommended.storage} storage.`;
};

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
    "AQ Gaming Hub",
    "aq gaming hub",
    "AQ GamingHub",
    "AQ Games Hub",
    "AQ Gaming Hub official",
    "AQ Gaming Hub PC",
    "AQ Gaming Hub PC games",
    "AQ Gaming Hub free download",
    "AQ Gaming Hub download free PC games",
    "aq gaming hub pc free download",
    "download pc games",
    "free pc games download",
    "free download pc games",
    "pc games free download full version",
    "download free pc games for windows",
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

  return Array.from(parts).slice(0, 300).join(", ");
};

export const setDocumentMeta = (opts: {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  siteName?: string;
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

  const canonicalUrl = opts.url || SITE_URL;

  setMeta("description", opts.description);
  if (opts.keywords) setMeta("keywords", opts.keywords);
  setMeta("og:title", opts.title, "property");
  setMeta("og:description", opts.description, "property");
  setMeta("og:type", opts.type || "website", "property");
  setMeta("og:url", canonicalUrl, "property");
  setMeta("og:image", opts.image || `${SITE_URL}/aq.png`, "property");
  if (opts.siteName) setMeta("og:site_name", opts.siteName, "property");
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", opts.title);
  setMeta("twitter:description", opts.description);
  setMeta("twitter:image", opts.image || `${SITE_URL}/aq.png`);

  let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;
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

/** Meta keywords string from game tags (not shown on page). */
export const buildGameMetaKeywords = (game: Game, siteName?: string) => {
  const parts = new Set<string>();
  const add = (v?: string) => {
    if (!v) return;
    v.split(",").forEach((x) => {
      const t = x.trim();
      if (t) parts.add(t);
    });
  };
  add(game.title);
  add(`${game.title} download`);
  add(`${game.title} free download pc`);
  add(`${game.title} free download for pc full version`);
  add(`${game.title} highly compressed free download`);
  add(game.developer);
  game.tags?.forEach(add);
  getGameCategories(game).forEach((c) => {
    add(c);
    add(`${c} games download`);
  });
  if (siteName) {
    add(siteName);
    add(`${game.title} ${siteName}`);
  }
  return Array.from(parts).join(", ");
};

export const buildGameJsonLd = (game: Game, siteName = "AQ Gaming Hub") => {
  const gameUrl = `${SITE_URL}/game/${game.id}`;
  const downloadUrl = getGameDownloadUrl(game);
  const images = [game.cover, ...(game.screenshots || [])].filter(Boolean);

  const sharedOffer = {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: gameUrl,
  };

  const sharedRating = {
    "@type": "AggregateRating",
    ratingValue: game.rating,
    ratingCount: Math.max(game.downloads, 1),
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VideoGame",
        name: game.title,
        description: game.description,
        genre: getGameCategories(game),
        keywords: game.tags?.join(", "),
        image: images,
        url: gameUrl,
        author: { "@type": "Organization", name: game.developer },
        publisher: { "@type": "Organization", name: siteName },
        aggregateRating: sharedRating,
        offers: sharedOffer,
      },
      {
        "@type": "SoftwareApplication",
        name: game.title,
        description: game.description,
        operatingSystem: "Windows",
        applicationCategory: "Game",
        downloadUrl,
        fileSize: game.size,
        softwareVersion: "Full Version",
        image: game.cover,
        url: gameUrl,
        softwareRequirements: formatSystemRequirements(game),
        author: { "@type": "Organization", name: game.developer },
        publisher: { "@type": "Organization", name: siteName },
        offers: sharedOffer,
      },
      {
        "@type": "Game",
        name: game.title,
        description: game.description,
        genre: getGameCategories(game),
        image: images,
        url: gameUrl,
        gamePlatform: "PC",
        operatingSystem: "Windows",
        author: { "@type": "Organization", name: game.developer },
        publisher: { "@type": "Organization", name: siteName },
        aggregateRating: sharedRating,
        offers: sharedOffer,
      },
    ],
  };
};

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
