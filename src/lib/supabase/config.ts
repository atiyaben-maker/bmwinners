// Supabase is "configured" only when both public values exist (synced by the Vercel⇄Supabase
// integration). Without them the app runs in demo mode: no login, demo data, persistent banner.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
// The Supabase→Vercel project connection syncs URL + ANON key together, so prefer that pair;
// a publishable key left over from an earlier connection could belong to another project.
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? '';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);
