import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { LoginForm } from './LoginForm';

export const metadata: Metadata = { title: 'כניסה' };

const ERRORS: Record<string, string> = {
  forbidden: 'החשבון הזה אינו מורשה למערכת.',
  link: 'קישור הכניסה פג תוקף או שכבר נוצל. בקשו קוד חדש.',
};

async function Form({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const next = typeof sp.next === 'string' ? sp.next : '/';
  const err = typeof sp.error === 'string' ? (ERRORS[sp.error] ?? null) : null;
  return <LoginForm next={next} initialError={err} />;
}

export default function LoginPage(props: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-4 py-10 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex items-center gap-3">
          <span aria-hidden className="grid size-10 place-items-center rounded-lg bg-ink font-display text-sm font-bold text-white">
            BM
          </span>
          <div>
            <h1 className="text-xl font-bold">כניסה ל-BM Winners</h1>
            <p className="text-sm text-ink-2">מערכת אישית · משתמש מורשה אחד</p>
          </div>
        </div>
        {isSupabaseConfigured ? (
          <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-ground" />}>
            <Form searchParams={props.searchParams} />
          </Suspense>
        ) : (
          <div className="space-y-4">
            <p role="status" className="rounded-lg border border-warn/30 bg-warn-soft p-3 text-sm text-warn">
              המערכת פועלת במצב דמו: מסד הנתונים עוד לא חובר, ולכן אין כניסה ואין נתונים אמיתיים.
            </p>
            <Link href="/" className="flex h-12 items-center justify-center rounded-lg bg-ink font-medium text-white">
              ללוח המחזור (דמו)
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
