import type { Game } from "../app/data/games";
import { getGameCategories } from "./gameCategories";

export const SITE_URL = "https://steamfree.games";

const isCompressedGame = (game: Game) =>
  /compress/i.test(game.title) ||
  /compress/i.test(game.size) ||
  game.tags?.some((tag) => /compress/i.test(tag)) === true;

export const buildHomePageTitle = (siteName = "AQ Gaming Hub") =>
  `${siteName} - Free PC Games Download for PC`;

export const buildHomeMetaDescription = (siteName = "AQ Gaming Hub", gameCount = 0) =>
  `${siteName} offers free PC games download for Windows. Browse ${gameCount > 0 ? `${gameCount}+ ` : ""}full-version titles, repacks, and direct download pages with system requirements and install guides.`;

export const buildCategoryPageTitle = (categoryName: string, siteName = "AQ Gaming Hub") =>
  categoryName === "All"
    ? `All PC Games Free Download - ${siteName}`
    : `${categoryName} Games Free Download for PC - ${siteName}`;

export const buildCategoryMetaDescription = (
  categoryName: string,
  gameCount: number,
  siteName = "AQ Gaming Hub"
) =>
  categoryName === "All"
    ? `Download free PC games at ${siteName}. Browse ${gameCount}+ full-version Windows games with direct download links, screenshots, and system requirements.`
    : `Download free ${categoryName.toLowerCase()} PC games at ${siteName}. Browse ${gameCount}+ ${categoryName.toLowerCase()} titles with direct download links and full-version installs.`;

export const buildCategoriesHubTitle = (siteName = "AQ Gaming Hub") =>
  `Browse PC Game Categories - ${siteName}`;

export const buildCategoriesHubDescription = (siteName = "AQ Gaming Hub", categoryCount = 0) =>
  `Explore ${categoryCount > 0 ? `${categoryCount}+ ` : ""}PC game categories on ${siteName}. Find action, RPG, racing, horror, and more free download pages.`;

export const buildSearchPageTitle = (query: string, siteName = "AQ Gaming Hub") =>
  query.trim()
    ? `Search: ${query} - ${siteName}`
    : `Search PC Games - ${siteName}`;

export const buildSearchPageDescription = (query: string, siteName = "AQ Gaming Hub") =>
  query.trim()
    ? `Search results for "${query}" on ${siteName}. Find free PC game downloads, repacks, and full-version titles.`
    : `Search ${siteName} for free PC games download pages, full-version titles, and category listings.`;

export const buildGamePageTitle = (game: Game, siteName = "AQ Gaming Hub") =>
  isCompressedGame(game)
    ? `${game.title} Highly Compressed Free Download for PC - ${siteName}`
    : `${game.title} Free Download for PC - ${siteName}`;

export const buildGamePageH1 = (game: Game) => `${game.title} Free Download`;

export const buildGameMetaDescription = (game: Game, siteName = "AQ Gaming Hub") =>
  `Download ${game.title} free for PC at ${siteName}. Full-version Windows game with system requirements, screenshots, and direct download. Size: ${game.size}. Developer: ${game.developer}.`;

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
    "free pc games download for pc",
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
  imageAlt?: string;
  robots?: string;
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
  const imageUrl = opts.image || `${SITE_URL}/aq.png`;
  const imageAlt = opts.imageAlt || opts.title;

  setMeta("description", opts.description);
  if (opts.keywords) setMeta("keywords", opts.keywords);
  setMeta("robots", opts.robots || "index, follow");
  setMeta("og:title", opts.title, "property");
  setMeta("og:description", opts.description, "property");
  setMeta("og:type", opts.type || "website", "property");
  setMeta("og:url", canonicalUrl, "property");
  setMeta("og:image", imageUrl, "property");
  setMeta("og:image:alt", imageAlt, "property");
  setMeta("og:locale", "en_US", "property");
  if (opts.siteName) setMeta("og:site_name", opts.siteName, "property");
  setMeta("twitter:card", "summary_large_image");
  setMeta("twitter:title", opts.title);
  setMeta("twitter:description", opts.description);
  setMeta("twitter:image", imageUrl);
  setMeta("twitter:image:alt", imageAlt);

  let canonical = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
  if (!canonical) {
    canonical = document.createElement("link");
    canonical.rel = "canonical";
    document.head.appendChild(canonical);
  }
  canonical.href = canonicalUrl;
};

export const injectJsonLd = (id: string, data: object) => {
  removeJsonLd(id);

  const script = document.createElement("script");
  script.id = id;
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

export const removeJsonLd = (id: string) => {
  document.getElementById(id)?.remove();
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
  add(`${game.title} free download`);
  add(`${game.title} free download pc`);
  add(`${game.title} free download for pc`);
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
    add(siteName.toLowerCase());
    add(`${game.title} ${siteName}`);
    add(`${game.title} ${siteName.toLowerCase()}`);
    add(`${siteName} ${game.title}`);
    add(`${siteName.toLowerCase()} ${game.title}`);
    add(`${game.title} aq gaming hub`);
    add(`aq gaming hub ${game.title}`);
  }
  return Array.from(parts).join(", ");
};

export const buildGameJsonLd = (game: Game, siteName = "AQ Gaming Hub") => {
  const gameUrl = `${SITE_URL}/game/${game.id}`;
  const downloadUrl = getGameDownloadUrl(game);
  const images = [game.cover, ...(game.screenshots || [])].filter(Boolean);
  const categories = getGameCategories(game);

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
        genre: categories,
        keywords: [game.title, siteName, `${game.title} free download`, ...(game.tags || [])].join(", "),
        image: images,
        url: gameUrl,
        gamePlatform: "PC",
        operatingSystem: "Windows",
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
        applicationCategory: "GameApplication",
        applicationSubCategory: categories[0] || "Game",
        downloadUrl,
        installUrl: gameUrl,
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
        genre: categories,
        image: images,
        url: gameUrl,
        gamePlatform: "PC",
        operatingSystem: "Windows",
        author: { "@type": "Organization", name: game.developer },
        publisher: { "@type": "Organization", name: siteName },
        aggregateRating: sharedRating,
        offers: sharedOffer,
      },
      buildBreadcrumbJsonLd([
        { name: siteName, url: `${SITE_URL}/` },
        ...(categories[0]
          ? [{ name: `${categories[0]} Games`, url: `${SITE_URL}/category/${encodeURIComponent(categories[0].toLowerCase())}` }]
          : []),
        { name: `${game.title} Free Download`, url: gameUrl },
      ]),
    ],
  };
};

export const buildBreadcrumbJsonLd = (items: { name: string; url: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const buildSiteJsonLd = (siteName: string, siteUrl: string) => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteName,
  alternateName: [
    "AQ Gaming Hub",
    "aq gaming hub",
    "AQ GamingHub",
    "AQ Games Hub",
    `${siteName} free download`,
    `${siteName} games`,
    "free pc games download for pc",
  ],
  url: siteUrl,
  description: `${siteName} is a free PC games download hub for Windows full-version titles, repacks, and direct download pages.`,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${siteUrl.replace(/\/$/, "")}/search?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
});
