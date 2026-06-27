import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

let supabase: SupabaseClient | null = null;

export async function requireSupabase(): Promise<SupabaseClient> {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file."
    );
  }

  if (!supabase) {
    const { createClient } = await import("@supabase/supabase-js");
    supabase = createClient(supabaseUrl!, supabaseAnonKey!);
  }

  return supabase;
}
