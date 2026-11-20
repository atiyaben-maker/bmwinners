import 'server-only';
import { redirect } from 'next/navigation';
import { connection } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export interface Viewer {
  mode: 'demo' | 'live';
  email: string | null;
}

/**
 * Verifies the JWT signature (getClaims) on every data read — the proxy alone is not trusted.
 * Demo mode (no Supabase env) has no accounts and only demo data.
 */
export async function requireViewer(): Promise<Viewer> {
  if (!isSupabaseConfigured) {
    await connection(); // demo pages still render per request (fresh "updated X ago" stamps)
    return { mode: 'demo', email: null };
  }
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) redirect('/login');
  const allowed = process.env.ALLOWED_EMAIL?.trim().toLowerCase();
  const email = typeof claims.email === 'string' ? claims.email.toLowerCase() : null;
  // Fail closed: without ALLOWED_EMAIL nobody is let in.
  if (!allowed || email !== allowed) redirect('/login?error=forbidden');
  return { mode: 'live', email };
}
