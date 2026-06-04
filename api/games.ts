import { createClient } from "@supabase/supabase-js";

// Module-level memory cache — survives across warm serverless invocations
const CACHE_TTL_MS = 30_000;
let memCache: { games: unknown[]; ts: number } | null = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Serve from memory cache if still fresh
  if (memCache && Date.now() - memCache.ts < CACHE_TTL_MS) {
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300",
    );
    return res.status(200).json({ games: memCache.games, source: "memory" });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(503).json({ error: "Supabase is not configured" });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("games")
      .select("id, payload")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Supabase query error", error);
      return res
        .status(502)
        .json({ error: "Failed to fetch games from database" });
    }

    const games = (data ?? []).map((row) => row.payload);

    // Populate memory cache on success
    memCache = { games, ts: Date.now() };

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300",
    );
    return res.status(200).json({ games, source: "db" });
  } catch (err) {
    console.error("Unexpected error in /api/games", err);
    return res.status(502).json({ error: "Unexpected error fetching games" });
  }
}
