-- Run this in Supabase Dashboard → SQL Editor → New query → Run
-- Project: suyawzhvjfdlbukcyunj

-- Games catalog (full game object stored as JSON)
CREATE TABLE IF NOT EXISTS public.games (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Site-wide config: settings, categories list, analytics
CREATE TABLE IF NOT EXISTS public.site_config (
  id TEXT PRIMARY KEY,
  payload JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS games_updated_at_idx ON public.games (updated_at DESC);

ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

-- Public read for everyone (visitors)
DROP POLICY IF EXISTS "games_select_public" ON public.games;
CREATE POLICY "games_select_public" ON public.games
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "site_config_select_public" ON public.site_config;
CREATE POLICY "site_config_select_public" ON public.site_config
  FOR SELECT USING (true);

-- Allow writes via anon key (same as your current localStorage admin).
-- TODO: tighten with Supabase Auth for production.
DROP POLICY IF EXISTS "games_insert_public" ON public.games;
CREATE POLICY "games_insert_public" ON public.games
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "games_update_public" ON public.games;
CREATE POLICY "games_update_public" ON public.games
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "games_delete_public" ON public.games;
CREATE POLICY "games_delete_public" ON public.games
  FOR DELETE USING (true);

DROP POLICY IF EXISTS "site_config_insert_public" ON public.site_config;
CREATE POLICY "site_config_insert_public" ON public.site_config
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "site_config_update_public" ON public.site_config;
CREATE POLICY "site_config_update_public" ON public.site_config
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "site_config_delete_public" ON public.site_config;
CREATE POLICY "site_config_delete_public" ON public.site_config
  FOR DELETE USING (true);

-- Optional Realtime (Dashboard → Database → Publications → supabase_realtime → add games + site_config)
