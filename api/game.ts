import { readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

type Game = {
  id: string;
  title: string;
  cover?: string;
  description?: string;
  category?: string;
  categories?: string[];
  rating?: number;
  downloads?: number;
  size?: string;
  releaseDate?: string;
  developer?: string;
  screenshots?: string[];
  systemRequirements?: {
    minimum?: Record<string, string>;
    recommended?: Record<string, string>;
  };
};

type GameRow = {
  id: string;
  payload: Game;
  updated_at?: string;
};

const SITE_URL = "https://steamfree.games";
const SITE_NAME = "AQ Gaming Hub";
const SITE_DOMAIN = "steamfree.games";
const META_DESCRIPTION_MIN_LENGTH = 150;
const META_DESCRIPTION_MAX_LENGTH = 160;

let templateCache: string | null = null;
let gamesCache: { rows: GameRow[]; ts: number } | null = null;
const CACHE_TTL_MS = 60_000;

const normalizeMetaText = (value: string) => value.replace(/\s+/g, " ").trim();

const fitMetaDescription = (value: string) => {
  const normalized = normalizeMetaText(value);

  if (normalized.length > META_DESCRIPTION_MAX_LENGTH) {
    const hardLimit = META_DESCRIPTION_MAX_LENGTH - 3;
    const candidate = normalized.slice(0, hardLimit);
    const lastSpace = candidate.lastIndexOf(" ");
    const cut =
      lastSpace >= META_DESCRIPTION_MIN_LENGTH - 3
        ? candidate.slice(0, lastSpace)
        : candidate;
    return `${cut.trimEnd()}...`;
  }

  if (normalized.length >= META_DESCRIPTION_MIN_LENGTH) return normalized;

  const fillerWords =
    "Includes screenshots, system requirements, and direct download details.".split(
      " ",
    );
  let padded = normalized;

  for (const word of fillerWords) {
    const next = `${padded} ${word}`;
    if (next.length > META_DESCRIPTION_MAX_LENGTH) break;
    padded = next;
    if (padded.length >= META_DESCRIPTION_MIN_LENGTH) break;
  }

  return padded;
};

const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const escapeJsonForHtml = (data: unknown) =>
  JSON.stringify(data).replace(/</g, "\\u003c");

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const getCategories = (game: Game) =>
  game.categories?.length
    ? game.categories.filter(Boolean)
    : game.category
      ? [game.category]
      : [];

const getGameSlug = (game: Pick<Game, "id" | "title">) => {
  const titleSlug = slugify(game.title || "") || "game";
  const idSlug = slugify(game.id || "");

  if (idSlug === titleSlug || idSlug.startsWith(`${titleSlug}-`)) {
    return idSlug;
  }

  return titleSlug;
};

const getGamePath = (game: Pick<Game, "id" | "title">) =>
  `/game/${getGameSlug(game)}`;

const getGameUrl = (game: Pick<Game, "id" | "title">) =>
  `${SITE_URL}${getGamePath(game)}`;

const findGame = (rows: GameRow[], routeParam: string) => {
  const decoded = decodeURIComponent(routeParam).toLowerCase();

  return rows.find((row) => {
    const game = { ...row.payload, id: row.id || row.payload.id };
    const id = String(game.id || "").toLowerCase();
    const idSlug = slugify(String(game.id || ""));
    const titleSlug = slugify(game.title || "");

    return (
      decoded === id ||
      decoded === idSlug ||
      decoded === titleSlug ||
      decoded === getGameSlug(game) ||
      decoded.endsWith(`-${id}`)
    );
  });
};

const buildTitle = (game: Game) =>
  `${game.title} Free Download for PC (Full Version) | ${SITE_NAME}`;

const buildH1 = (game: Game) => `${game.title} Free Download for PC`;

const buildDescription = (game: Game) => {
  const genre = getCategories(game).filter((category) => category !== "All").join("/");
  const genrePart = genre || game.category || "PC";
  const sizePart = game.size ? `, ${game.size}` : "";

  return fitMetaDescription(
    `${game.title} free download for PC at ${SITE_NAME}. Full version ${genrePart} game${sizePart}, with screenshots, system requirements, and direct download details.`,
  );
};

const buildGameJsonLd = (game: Game) => {
  const gameUrl = getGameUrl(game);
  const categories = getCategories(game).filter((category) => category !== "All");
  const images = [game.cover, ...(game.screenshots || [])].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VideoGame",
        name: game.title,
        description: game.description,
        ...(categories.length > 0 && { genre: categories }),
        ...(images.length > 0 && { image: images.length === 1 ? images[0] : images }),
        url: gameUrl,
        gamePlatform: "PC",
        operatingSystem: "Windows",
        applicationCategory: "Game",
        ...(game.developer && { author: { "@type": "Organization", name: game.developer } }),
        publisher: { "@type": "Organization", name: SITE_NAME },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: game.rating || 4.5,
          ratingCount: Math.max(game.downloads || 1, 1),
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: gameUrl,
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: SITE_NAME, item: `${SITE_URL}/` },
          ...(categories[0]
            ? [
                {
                  "@type": "ListItem",
                  position: 2,
                  name: `${categories[0]} Games`,
                  item: `${SITE_URL}/category/${encodeURIComponent(categories[0].toLowerCase())}`,
                },
              ]
            : []),
          {
            "@type": "ListItem",
            position: categories[0] ? 3 : 2,
            name: buildH1(game),
            item: gameUrl,
          },
        ],
      },
    ],
  };
};

const replaceOrAppendMeta = (
  head: string,
  attr: "name" | "property",
  key: string,
  content: string,
) => {
  const tag = `<meta ${attr}="${key}" content="${escapeHtml(content)}" />`;
  const pattern = new RegExp(`<meta\\s+${attr}="${key}"[^>]*>`, "i");
  return pattern.test(head) ? head.replace(pattern, tag) : `${head}\n    ${tag}`;
};

const replaceCanonical = (head: string, url: string) => {
  const tag = `<link rel="canonical" href="${escapeHtml(url)}" />`;
  return /<link\s+rel="canonical"[^>]*>/i.test(head)
    ? head.replace(/<link\s+rel="canonical"[^>]*>/i, tag)
    : `${head}\n    ${tag}`;
};

const renderSeoContent = (game: Game) => {
  const categories = getCategories(game).filter((category) => category !== "All");
  const categoryLinks = categories
    .map(
      (category) =>
        `<a href="/category/${encodeURIComponent(category.toLowerCase())}">${escapeHtml(category)} Games</a>`,
    )
    .join(" / ");
  const minimum = game.systemRequirements?.minimum || {};
  const recommended = game.systemRequirements?.recommended || {};
  const screenshots = (game.screenshots || [])
    .slice(0, 4)
    .map(
      (src, index) =>
        `<img src="${escapeHtml(src)}" alt="${escapeHtml(`${game.title} free download for PC screenshot ${index + 1}`)}" loading="lazy" decoding="async" />`,
    )
    .join("");

  return `
      <article class="seo-prerender">
        <nav aria-label="Breadcrumb"><a href="/">Home</a>${categoryLinks ? ` / ${categoryLinks}` : ""}</nav>
        <h1>${escapeHtml(buildH1(game))}</h1>
        ${game.cover ? `<img src="${escapeHtml(game.cover)}" alt="${escapeHtml(`${game.title} free download for PC cover image`)}" width="600" height="900" />` : ""}
        <p>${escapeHtml(game.description || buildDescription(game))}</p>
        <dl>
          <dt>Developer</dt><dd>${escapeHtml(game.developer || "Unknown")}</dd>
          <dt>Category</dt><dd>${escapeHtml(categories.join(", ") || game.category || "PC")}</dd>
          <dt>File size</dt><dd>${escapeHtml(game.size || "See download page")}</dd>
          <dt>Release date</dt><dd>${escapeHtml(game.releaseDate || "")}</dd>
        </dl>
        <h2>System Requirements</h2>
        <p>Minimum: ${escapeHtml(Object.values(minimum).filter(Boolean).join(", "))}</p>
        <p>Recommended: ${escapeHtml(Object.values(recommended).filter(Boolean).join(", "))}</p>
        ${screenshots ? `<h2>Screenshots</h2><div>${screenshots}</div>` : ""}
      </article>`;
};

const loadTemplate = async () => {
  if (templateCache) return templateCache;

  const candidates = [
    path.join(process.cwd(), "dist", "app-shell.html"),
    path.join(process.cwd(), "app-shell.html"),
    path.join(process.cwd(), "dist", "index.html"),
    path.join(process.cwd(), "index.html"),
  ];

  for (const candidate of candidates) {
    try {
      templateCache = await readFile(candidate, "utf8");
      return templateCache;
    } catch {
      // Try next deployment layout.
    }
  }

  throw new Error("Could not load app shell HTML");
};

const loadGames = async () => {
  if (gamesCache && Date.now() - gamesCache.ts < CACHE_TTL_MS) {
    return gamesCache.rows;
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase is not configured");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase
    .from("games")
    .select("id,payload,updated_at")
    .order("updated_at", { ascending: false });

  if (error) throw error;

  const rows = (data || []).map((row: GameRow) => ({
    ...row,
    payload: { ...row.payload, id: row.id || row.payload.id },
  }));

  gamesCache = { rows, ts: Date.now() };
  return rows;
};

const renderGamePage = (template: string, game: Game) => {
  const title = buildTitle(game);
  const description = buildDescription(game);
  const canonical = getGameUrl(game);
  const image = game.cover || `${SITE_URL}/aq.png`;
  const imageAlt = `${game.title} free download for PC cover image`;
  const jsonLd = buildGameJsonLd(game);

  let head = template.match(/<head>([\s\S]*?)<\/head>/i)?.[1] || "";
  head = head.replace(/\s*<script[^>]+type=["']application\/ld\+json["'][^>]*>.*?<\/script>/gis, "");
  head = /<title>.*?<\/title>/is.test(head)
    ? head.replace(/<title>.*?<\/title>/is, `<title>${escapeHtml(title)}</title>`)
    : `${head}\n    <title>${escapeHtml(title)}</title>`;
  head = replaceOrAppendMeta(head, "name", "description", description);
  head = replaceOrAppendMeta(head, "name", "robots", "index, follow");
  head = replaceOrAppendMeta(head, "property", "og:title", title);
  head = replaceOrAppendMeta(head, "property", "og:description", description);
  head = replaceOrAppendMeta(head, "property", "og:url", canonical);
  head = replaceOrAppendMeta(head, "property", "og:image", image);
  head = replaceOrAppendMeta(head, "property", "og:image:alt", imageAlt);
  head = replaceOrAppendMeta(head, "name", "twitter:title", title);
  head = replaceOrAppendMeta(head, "name", "twitter:description", description);
  head = replaceOrAppendMeta(head, "name", "twitter:image", image);
  head = replaceOrAppendMeta(head, "name", "twitter:image:alt", imageAlt);
  head = replaceCanonical(head, canonical);
  head += `\n    <script id="game-jsonld" type="application/ld+json">${escapeJsonForHtml(jsonLd)}</script>`;

  return template
    .replace(/<head>[\s\S]*?<\/head>/i, `<head>${head}</head>`)
    .replace(/<div id="root">[\s\S]*?<\/div>/i, `<div id="root">${renderSeoContent(game)}</div>`);
};

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  const routeParam =
    req.query?.slug ||
    req.query?.id ||
    String(req.url || "").split("/").filter(Boolean).at(-1) ||
    "";

  try {
    const [template, rows] = await Promise.all([loadTemplate(), loadGames()]);
    const row = findGame(rows, String(routeParam));

    if (!row) {
      return res.status(404).send("Game not found");
    }

    const game = { ...row.payload, id: row.id || row.payload.id };
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=86400");
    return res.status(200).send(renderGamePage(template, game));
  } catch (error) {
    console.error("Failed to render game SEO page:", error);
    return res.status(500).send("Failed to render game page");
  }
}
