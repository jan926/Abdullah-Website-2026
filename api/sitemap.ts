type GameRow = {
  id: string;
  payload?: { title?: string; releaseDate?: string; tags?: string[] };
  updated_at?: string;
};

const SITE_URL = "https://steamfree.games";
const SITEMAP_CACHE_MS = 10 * 60_000; // 10 minutes
let sitemapCache: { xml: string; ts: number } | null = null;

const STATIC_PATHS = [
  { loc: `${SITE_URL}/`, changefreq: "daily", priority: "1.0" },
  { loc: `${SITE_URL}/categories`, changefreq: "weekly", priority: "0.8" },
  { loc: `${SITE_URL}/category/all`, changefreq: "daily", priority: "0.85" },
];

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const toCategoryPath = (name: string) =>
  name.toLowerCase() === "all"
    ? `${SITE_URL}/category/all`
    : `${SITE_URL}/category/${encodeURIComponent(name.toLowerCase())}`;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const toGamePath = (row: GameRow) => {
  const titleSlug = slugify(row.payload?.title || "") || "game";
  const idSlug = slugify(row.id);
  const routeSlug =
    idSlug === titleSlug || idSlug.startsWith(`${titleSlug}-`)
      ? idSlug
      : titleSlug;

  return `${SITE_URL}/game/${routeSlug}`;
};

async function fetchSupabaseRows<T>(table: string, select: string): Promise<T[]> {
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) return [];

  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${encodeURIComponent(select)}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  if (!response.ok) return [];
  return (await response.json()) as T[];
}

function buildUrlEntry(loc: string, changefreq: string, priority: string, lastmod?: string) {
  const lastmodTag = lastmod ? `\n    <lastmod>${escapeXml(lastmod)}</lastmod>` : "";
  return `  <url>\n    <loc>${escapeXml(loc)}</loc>${lastmodTag}\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).send("Method Not Allowed");
  }

  try {
    if (sitemapCache && Date.now() - sitemapCache.ts < SITEMAP_CACHE_MS) {
      res.setHeader("Content-Type", "application/xml; charset=utf-8");
      res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
      return res.status(200).send(sitemapCache.xml);
    }

    const [gameRows, configRows] = await Promise.all([
      fetchSupabaseRows<GameRow>("games", "id,payload,updated_at"),
      fetchSupabaseRows<{ id: string; payload: string[] }>("site_config", "id,payload"),
    ]);

    const categories =
      configRows.find((row) => row.id === "categories")?.payload?.filter((c) => c !== "All") || [];

    const gameEntries = gameRows.map((row) => {
      const lastmod = row.updated_at || row.payload?.releaseDate;
      return buildUrlEntry(toGamePath(row), "weekly", "0.9", lastmod?.slice(0, 10));
    });

    const tagSet = new Set<string>();
    gameRows.forEach((row) => {
      const tags = row.payload?.tags;
      if (Array.isArray(tags)) {
        tags.forEach((tag) => {
          const normalized = String(tag || "").trim();
          if (normalized) tagSet.add(normalized);
        });
      }
    });

    const tagEntries = Array.from(tagSet)
      .sort((a, b) => a.localeCompare(b))
      .map((tag) =>
        buildUrlEntry(`${SITE_URL}/search?q=${encodeURIComponent(tag)}`, "weekly", "0.7"),
      );

    const categoryEntries = categories.map((category) =>
      buildUrlEntry(toCategoryPath(category), "weekly", "0.75"),
    );

    const staticEntries = STATIC_PATHS.map((entry) =>
      buildUrlEntry(entry.loc, entry.changefreq, entry.priority),
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...categoryEntries, ...gameEntries, ...tagEntries].join("\n")}
</urlset>`;

    sitemapCache = { xml, ts: Date.now() };

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).send(xml);
  } catch (error) {
    console.error("Failed to generate sitemap:", error);

    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${STATIC_PATHS.map((entry) => buildUrlEntry(entry.loc, entry.changefreq, entry.priority)).join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    return res.status(200).send(fallbackXml);
  }
}
