import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const indexPath = path.join(distDir, "index.html");
const gamesSourcePath = path.join(root, "src", "app", "data", "games.ts");
const SITE_URL = "https://steamfree.games";
const SITE_DOMAIN = "steamfree.games";
const SITE_NAME = "AQ Gaming Hub";

const META_DESCRIPTION_MIN_LENGTH = 150;
const META_DESCRIPTION_MAX_LENGTH = 160;

const normalizeMetaText = (value) => value.replace(/\s+/g, " ").trim();

const fitMetaDescription = (value) => {
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

const escapeJsonForHtml = (data) =>
  JSON.stringify(data).replace(/</g, "\\u003c");

const slugify = (value) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const getGameCategories = (game) =>
  game.categories?.length ? game.categories.filter(Boolean) : game.category ? [game.category] : [];

const buildGameSlug = (game) => {
  const titleSlug = slugify(game.title) || "game";
  const idSlug = slugify(game.id);

  if (idSlug === titleSlug || idSlug.startsWith(`${titleSlug}-`)) {
    return idSlug;
  }

  return titleSlug;
};
const getGamePath = (game) => `/game/${buildGameSlug(game)}`;
const getGameUrl = (game) => `${SITE_URL}${getGamePath(game)}`;
const getCategoryPath = (category) =>
  category.toLowerCase() === "all"
    ? "/category/all"
    : `/category/${encodeURIComponent(category.toLowerCase())}`;

const buildHomePageTitle = () =>
  `${SITE_NAME} - Free PC Games Download | ${SITE_DOMAIN}`;

const buildHomeMetaDescription = (gameCount) =>
  `${SITE_NAME} on ${SITE_DOMAIN} offers free PC games download for Windows. Browse ${gameCount > 0 ? `${gameCount}+ ` : ""}full-version titles, repacks, and direct download pages with system requirements.`;

const buildCategoryPageTitle = (categoryName) =>
  categoryName === "All"
    ? `All PC Games Free Download - ${SITE_NAME}`
    : `${categoryName} Games Free Download for PC - ${SITE_NAME}`;

const buildCategoryMetaDescription = (categoryName, gameCount) =>
  categoryName === "All"
    ? `Download free PC games at ${SITE_NAME}. Browse ${gameCount}+ full-version Windows games with direct download links, screenshots, and system requirements.`
    : `Download free ${categoryName.toLowerCase()} PC games at ${SITE_NAME}. Browse ${gameCount}+ ${categoryName.toLowerCase()} titles with direct download links and full-version installs.`;

const buildCategoriesHubDescription = (categoryCount) =>
  `Explore ${categoryCount > 0 ? `${categoryCount}+ ` : ""}PC game categories on ${SITE_NAME}. Find action, RPG, racing, horror, and more free download pages.`;

const buildGamePageTitle = (game) =>
  `${game.title} Free Download for PC (Full Version) | ${SITE_NAME}`;

const buildGamePageH1 = (game) => `${game.title} Free Download for PC`;

const buildGameMetaDescription = (game) => {
  const genre = getGameCategories(game).filter((category) => category !== "All").join("/");
  const genrePart = genre || game.category || "PC";
  const sizePart = game.size ? `, ${game.size}` : "";

  return fitMetaDescription(
    `${game.title} free download for PC at ${SITE_NAME}. Full version ${genrePart} game${sizePart}, with screenshots, system requirements, and direct download details.`,
  );
};

const buildSiteJsonLd = () => ({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/aq.png`,
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      alternateName: [
        "AQ Gaming Hub",
        "SteamFree Games",
        SITE_DOMAIN,
        `${SITE_NAME} ${SITE_DOMAIN}`,
      ],
      url: `${SITE_URL}/`,
      publisher: { "@id": `${SITE_URL}/#organization` },
      description: `${SITE_NAME} on ${SITE_DOMAIN} is a free PC games download hub for Windows full-version titles, repacks, and direct download pages.`,
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ],
});

const buildGameItemListJsonLd = (games, name, url) => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name,
  url,
  numberOfItems: games.length,
  itemListElement: games.slice(0, 100).map((game, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: getGameUrl(game),
    name: game.title,
  })),
});

const buildGameJsonLd = (game) => {
  const gameUrl = getGameUrl(game);
  const categories = getGameCategories(game).filter((category) => category !== "All");
  const images = [game.cover, ...(game.screenshots || [])].filter(Boolean);

  const graph = [
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
        ratingValue: game.rating,
        ratingCount: Math.max(game.downloads || 0, 1),
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
      "@type": "SoftwareApplication",
      name: game.title,
      description: game.description,
      operatingSystem: "Windows",
      applicationCategory: "GameApplication",
      ...(categories.length > 0 && { applicationSubCategory: categories[0] }),
      ...(game.size && { fileSize: game.size }),
      ...(game.cover && { image: game.cover }),
      url: gameUrl,
      installUrl: gameUrl,
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
                item: `${SITE_URL}${getCategoryPath(categories[0])}`,
              },
            ]
          : []),
        {
          "@type": "ListItem",
          position: categories[0] ? 3 : 2,
          name: buildGamePageH1(game),
          item: gameUrl,
        },
      ],
    },
  ];

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
};

const replaceOrAppendMeta = (head, attr, key, content) => {
  const escaped = escapeHtml(content);
  const pattern = new RegExp(`<meta\\s+${attr}="${key}"[^>]*>`, "i");
  const tag = `<meta ${attr}="${key}" content="${escaped}" />`;
  return pattern.test(head) ? head.replace(pattern, tag) : `${head}\n    ${tag}`;
};

const replaceCanonical = (head, url) => {
  const tag = `<link rel="canonical" href="${escapeHtml(url)}" />`;
  return /<link\s+rel="canonical"[^>]*>/i.test(head)
    ? head.replace(/<link\s+rel="canonical"[^>]*>/i, tag)
    : `${head}\n    ${tag}`;
};

const replaceTitle = (head, title) => {
  const tag = `<title>${escapeHtml(title)}</title>`;
  return /<title>.*?<\/title>/is.test(head)
    ? head.replace(/<title>.*?<\/title>/is, tag)
    : `${head}\n    ${tag}`;
};

const stripExistingJsonLd = (head) =>
  head.replace(/\s*<script[^>]+type=["']application\/ld\+json["'][^>]*>.*?<\/script>/gis, "");

const renderShell = (template, { title, description, canonical, image, imageAlt, robots = "index, follow", jsonLd, appHtml }) => {
  const headMatch = template.match(/<head>([\s\S]*?)<\/head>/i);
  if (!headMatch) throw new Error("Could not find <head> in dist/index.html");

  let head = headMatch[1];
  head = stripExistingJsonLd(head);
  head = replaceTitle(head, title);
  head = replaceOrAppendMeta(head, "name", "description", description);
  head = replaceOrAppendMeta(head, "name", "robots", robots);
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

  const jsonLdBlocks = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];
  jsonLdBlocks.forEach((block, index) => {
    head += `\n    <script id="prerender-jsonld-${index + 1}" type="application/ld+json">${escapeJsonForHtml(block)}</script>`;
  });

  return template
    .replace(/<head>[\s\S]*?<\/head>/i, `<head>${head}</head>`)
    .replace(/<div id="root"><\/div>/i, `<div id="root">${appHtml}</div>`);
};

const renderGameHtml = (game) => {
  const categories = getGameCategories(game).filter((category) => category !== "All");
  const categoryLinks = categories
    .map((category) => `<a href="${getCategoryPath(category)}">${escapeHtml(category)} Games</a>`)
    .join(" ");
  const screenshots = (game.screenshots || [])
    .slice(0, 4)
    .map((src, index) => `<img src="${escapeHtml(src)}" alt="${escapeHtml(`${game.title} free download for PC screenshot ${index + 1}`)}" loading="lazy" decoding="async" />`)
    .join("");

  return `
      <article class="seo-prerender">
        <nav aria-label="Breadcrumb"><a href="/">Home</a> ${categoryLinks ? `/ ${categoryLinks}` : ""}</nav>
        <h1>${escapeHtml(buildGamePageH1(game))}</h1>
        <img src="${escapeHtml(game.cover)}" alt="${escapeHtml(`${game.title} free download for PC cover image`)}" width="600" height="900" />
        <p>${escapeHtml(game.description)}</p>
        <dl>
          <dt>Developer</dt><dd>${escapeHtml(game.developer || "Unknown")}</dd>
          <dt>Category</dt><dd>${escapeHtml(categories.join(", ") || game.category || "PC")}</dd>
          <dt>File size</dt><dd>${escapeHtml(game.size || "See download page")}</dd>
          <dt>Release date</dt><dd>${escapeHtml(game.releaseDate || "")}</dd>
        </dl>
        <h2>System Requirements</h2>
        <p>Minimum: ${escapeHtml(game.systemRequirements?.minimum?.os || "")}, ${escapeHtml(game.systemRequirements?.minimum?.processor || "")}, ${escapeHtml(game.systemRequirements?.minimum?.memory || "")} RAM, ${escapeHtml(game.systemRequirements?.minimum?.graphics || "")}, ${escapeHtml(game.systemRequirements?.minimum?.storage || "")} storage.</p>
        <p>Recommended: ${escapeHtml(game.systemRequirements?.recommended?.os || "")}, ${escapeHtml(game.systemRequirements?.recommended?.processor || "")}, ${escapeHtml(game.systemRequirements?.recommended?.memory || "")} RAM, ${escapeHtml(game.systemRequirements?.recommended?.graphics || "")}, ${escapeHtml(game.systemRequirements?.recommended?.storage || "")} storage.</p>
        <h2>Screenshots</h2>
        <div>${screenshots}</div>
        <p><a href="${getGamePath(game)}">Download ${escapeHtml(game.title)} for PC</a></p>
      </article>`;
};

const renderListingHtml = ({ h1, intro, games, categories = [] }) => {
  const categoryLinks = categories
    .map((category) => `<li><a href="${getCategoryPath(category)}">${escapeHtml(category)} Games</a></li>`)
    .join("");
  const gameLinks = games
    .slice(0, 120)
    .map((game) => `<li><a href="${getGamePath(game)}">${escapeHtml(game.title)} Free Download for PC</a></li>`)
    .join("");

  return `
      <main class="seo-prerender">
        <h1>${escapeHtml(h1)}</h1>
        <p>${escapeHtml(intro)}</p>
        ${categoryLinks ? `<h2>Game Categories</h2><ul>${categoryLinks}</ul>` : ""}
        <h2>PC Games</h2>
        <ul>${gameLinks}</ul>
      </main>`;
};

const writeRoute = async (routePath, html) => {
  const cleanPath = routePath.replace(/^\/|\/$/g, "");
  const outDir = cleanPath ? path.join(distDir, ...cleanPath.split("/")) : distDir;
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "index.html"), html, "utf8");

  if (cleanPath) {
    const parts = cleanPath.split("/");
    const htmlFile = path.join(
      distDir,
      ...parts.slice(0, -1),
      `${parts.at(-1)}.html`,
    );
    await mkdir(path.dirname(htmlFile), { recursive: true });
    await writeFile(htmlFile, html, "utf8");
  }
};

const loadSeedGames = async () => {
  const source = await readFile(gamesSourcePath, "utf8");
  const withoutInterfaces = source
    .replace(/export interface[\s\S]*?export const gamesData: Game\[] = /, "export const gamesData = ")
    .replace(/export interface[\s\S]*?export const categories = /, "export const categories = ");
  const dataUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent(withoutInterfaces)}`;
  const mod = await import(dataUrl);
  return { games: mod.gamesData, categories: mod.categories };
};

const main = async () => {
  const template = await readFile(indexPath, "utf8");
  const { games, categories } = await loadSeedGames();
  const visibleCategories = categories.filter((category) => category !== "All");
  const homeDescription = buildHomeMetaDescription(games.length);

  await writeFile(path.join(distDir, "app-shell.html"), template, "utf8");

  await writeRoute(
    "/",
    renderShell(template, {
      title: buildHomePageTitle(),
      description: homeDescription,
      canonical: `${SITE_URL}/`,
      image: `${SITE_URL}/aq.png`,
      imageAlt: `${SITE_NAME} on steamfree.games - Free PC Games Download`,
      jsonLd: [
        buildSiteJsonLd(),
        buildGameItemListJsonLd(games, buildHomePageTitle(), `${SITE_URL}/`),
      ],
      appHtml: renderListingHtml({
        h1: buildHomePageTitle(),
        intro: homeDescription,
        games,
        categories: visibleCategories,
      }),
    }),
  );

  await writeRoute(
    "/categories",
    renderShell(template, {
      title: `Browse PC Game Categories - ${SITE_NAME}`,
      description: buildCategoriesHubDescription(visibleCategories.length),
      canonical: `${SITE_URL}/categories`,
      image: `${SITE_URL}/aq.png`,
      imageAlt: `${SITE_NAME} game categories`,
      jsonLd: [
        buildSiteJsonLd(),
        buildGameItemListJsonLd(games, `Browse PC Game Categories - ${SITE_NAME}`, `${SITE_URL}/categories`),
      ],
      appHtml: renderListingHtml({
        h1: "Browse PC Game Categories",
        intro: buildCategoriesHubDescription(visibleCategories.length),
        games,
        categories: visibleCategories,
      }),
    }),
  );

  await writeRoute(
    "/search",
    renderShell(template, {
      title: `Search PC Games - ${SITE_NAME}`,
      description: `Search ${SITE_NAME} for free PC games download pages, full-version titles, and category listings.`,
      canonical: `${SITE_URL}/search`,
      image: `${SITE_URL}/aq.png`,
      imageAlt: `${SITE_NAME} search`,
      robots: "noindex, follow",
      jsonLd: buildSiteJsonLd(),
      appHtml: renderListingHtml({
        h1: "Search PC Games",
        intro: `Search ${SITE_NAME} for free PC games download pages, full-version titles, and category listings.`,
        games,
        categories: visibleCategories,
      }),
    }),
  );

  for (const category of categories) {
    const categoryGames =
      category === "All"
        ? games
        : games.filter((game) =>
            getGameCategories(game).some((gameCategory) => gameCategory.toLowerCase() === category.toLowerCase()),
          );
    const description = buildCategoryMetaDescription(category, categoryGames.length);
    const routePath = getCategoryPath(category);

    await writeRoute(
      routePath,
      renderShell(template, {
        title: buildCategoryPageTitle(category),
        description,
        canonical: `${SITE_URL}${routePath}`,
        image: `${SITE_URL}/aq.png`,
        imageAlt: `${SITE_NAME} ${category} PC games`,
        jsonLd: [
          buildSiteJsonLd(),
          buildGameItemListJsonLd(categoryGames, buildCategoryPageTitle(category), `${SITE_URL}${routePath}`),
        ],
        appHtml: renderListingHtml({
          h1: category === "All" ? "All PC Games Free Download" : `${category} Games Free Download`,
          intro: description,
          games: categoryGames,
          categories: visibleCategories,
        }),
      }),
    );
  }

  for (const game of games) {
    const title = buildGamePageTitle(game);
    const description = buildGameMetaDescription(game);

    await writeRoute(
      getGamePath(game),
      renderShell(template, {
        title,
        description,
        canonical: getGameUrl(game),
        image: game.cover || `${SITE_URL}/aq.png`,
        imageAlt: `${game.title} free download for PC cover image`,
        jsonLd: buildGameJsonLd(game),
        appHtml: renderGameHtml(game),
      }),
    );
  }

  console.log(
    `Prerendered SEO HTML for ${games.length} games, ${categories.length} categories, and the homepage.`,
  );
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
