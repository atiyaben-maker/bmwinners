import Link from 'next/link';
import { BottomNav, SideNav } from '@/components/Nav';
import { isSupabaseConfigured } from '@/lib/supabase/config';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[15rem_minmax(0,1fr)]">
      <aside className="no-print hidden border-e border-line bg-surface lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:p-4">
        <Link href="/" className="mb-6 flex items-center gap-2.5 px-2 py-1">
          <span aria-hidden className="grid size-9 place-items-center rounded-lg bg-ink font-display text-sm font-bold text-white">
            BM
          </span>
          <span className="font-display text-lg font-bold">BM Winners</span>
        </Link>
        <SideNav />
        <div className="mt-auto space-y-3 border-t border-line pt-4 text-sm">
          <p className="px-2 text-ink-2">
            {isSupabaseConfigured ? 'מחובר למסד הנתונים' : 'מצב דמו · מסד נתונים לא מחובר'}
          </p>
          {isSupabaseConfigured && (
            <form action="/auth/signout" method="post">
              <button className="min-h-11 w-full rounded-lg px-2 text-start text-ink-2 hover:bg-ground hover:text-ink">
                יציאה
              </button>
            </form>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {!isSupabaseConfigured && (
          <div role="note" className="no-print border-b border-warn/30 bg-warn-soft px-4 py-2 text-sm text-warn">
            <strong className="font-semibold">נתוני דמו</strong> · מסד הנתונים עוד לא חובר. המשחקים והתוצאות רשמיים;
            ההסתברויות הן לדוגמה בלבד ואינן תחזית.
          </div>
        )}
        <header className="no-print sticky top-0 z-20 flex items-center justify-between border-b border-line bg-surface/95 px-4 py-2.5 backdrop-blur lg:hidden">
          <Link href="/" className="flex min-h-11 items-center gap-2">
            <span aria-hidden className="grid size-8 place-items-center rounded-md bg-ink font-display text-xs font-bold text-white">
              BM
            </span>
            <span className="font-display font-bold">BM Winners</span>
          </Link>
          {isSupabaseConfigured && (
            <form action="/auth/signout" method="post">
              <button className="min-h-11 rounded-lg px-3 text-sm text-ink-2 hover:bg-ground">יציאה</button>
            </form>
          )}
        </header>
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 px-3 pt-4 pb-24 sm:px-5 lg:px-6 lg:pb-10 lg:pt-6">
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
