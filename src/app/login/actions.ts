'use server';

import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export interface LoginState {
  step: 'email' | 'code';
  email: string;
  message: string | null;
  error: string | null;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Same answer whether or not the address is allowed – never reveal which email owns the system.
const SENT = 'אם הכתובת מורשית, נשלח אליה קוד בן 6 ספרות (ובנוסף קישור כניסה). הקוד בתוקף לשעה.';

function safeNext(next: unknown): string {
  const n = typeof next === 'string' ? next : '/';
  return n.startsWith('/') && !n.startsWith('//') && !n.startsWith('/login') ? n : '/';
}

export async function sendCode(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { step: 'email', email, message: null, error: 'יש להזין כתובת אימייל תקינה, לדוגמה name@example.com' };
  }
  if (!isSupabaseConfigured) {
    return { step: 'email', email, message: null, error: 'המערכת במצב דמו – אין צורך בכניסה. חזרו ללוח המחזור.' };
  }
  const allowed = process.env.ALLOWED_EMAIL?.trim().toLowerCase();
  if (allowed && email === allowed) {
    const supabase = await createClient();
    const next = safeNext(form.get('next'));
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bmwinners.com';
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${origin}/auth/confirm?next=${encodeURIComponent(next)}`,
      },
    });
    if (error && error.status === 429) {
      return { step: 'email', email, message: null, error: 'נשלחו יותר מדי בקשות. נסו שוב בעוד דקה.' };
    }
  }
  return { step: 'code', email, message: SENT, error: null };
}

export async function verifyCode(prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get('email') ?? prev.email).trim().toLowerCase();
  const token = String(form.get('token') ?? '').replace(/\D/g, '');
  if (token.length !== 6) {
    return { ...prev, email, step: 'code', message: null, error: 'הקוד מכיל 6 ספרות בדיוק.' };
  }
  const allowed = process.env.ALLOWED_EMAIL?.trim().toLowerCase();
  if (!isSupabaseConfigured || (allowed && email !== allowed)) {
    return { ...prev, email, step: 'code', message: null, error: 'הקוד שגוי או שפג תוקפו. אפשר לבקש קוד חדש.' };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) {
    return { ...prev, email, step: 'code', message: null, error: 'הקוד שגוי או שפג תוקפו. אפשר לבקש קוד חדש.' };
  }
  await supabase.rpc('claim_ownership');
  redirect(safeNext(form.get('next')));
}
