import type { Metadata } from 'next';
import { Suspense } from 'react';
import {
  AlternativesTable,
  BankersTable,
  BoardTable,
  MobileBoard,
  FillGrid,
  MatchDetail,
  PlanComparison,
  type BoardRow,
} from '@/components/board';
import { Tabs } from '@/components/Tabs';
import { EmptyState, Freshness, LoadingRegion, PageHeader, StatusPill, Tile } from '@/components/ui';
import {
  analyse,
  bankers,
  columnString,
  expectedDraws,
  fillPlans,
  oneIn,
  topColumns,
  type Probs,
} from '@/lib/engine';
import { fmtDate, fmtDateTime, fmtShekel } from '@/lib/format';
import { getCurrentRound, getParams, getRuleSet } from '@/server/data';

export const metadata: Metadata = { title: 'לוח מחזור' };

type SP = Promise<Record<string, string | string[] | undefined>>;
const TABS = ['columns', 'bankers', 'alternatives'] as const;

export default function BoardPage({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<BoardSkeleton />}>
      <Board searchParams={searchParams} />
    </Suspense>
  );
}

function BoardSkeleton() {
  return (
    <div>
      <div className="mb-4 h-14 w-64 animate-pulse rounded-lg bg-line/70" />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-line/70" />
        ))}
      </div>
      <LoadingRegion label="טוען את לוח המחזור" rows={16} />
    </div>
  );
}

async function Board({ searchParams }: { searchParams: SP }) {
  const [sp, round, params, ruleSet] = await Promise.all([searchParams, getCurrentRound(), getParams(), getRuleSet()]);

  if (!round || round.matches.length === 0) {
    return (
      <>
        <PageHeader title="לוח מחזור" />
        <EmptyState title="אין מחזור טעון">
          הטופס הבא ייקלט מאתר ווינר לאחר פרסומו (בדרך כלל ביום שלישי). עד אז אין משחקים להצגה.
        </EmptyState>
      </>
    );
  }

  const tab = TABS.includes(sp.tab as (typeof TABS)[number]) ? (sp.tab as string) : 'columns';
  const mNum = Number(sp.m);
  const rows: BoardRow[] = round.matches.map((m) => ({ match: m, a: m.combined ? analyse(m.row, m.combined) : null }));
  const selected = rows.find((r) => r.match.row === mNum) ?? null;

  const complete = rows.every((r) => r.a);
  const probs = rows.map((r) => r.a?.probs).filter(Boolean) as Probs[];
  const plans = complete ? fillPlans(probs, 20) : [];
  const best = plans[0];
  const top = complete ? topColumns(probs, 20 + 50 + 40) : [];
  const fillSet = new Set(best?.columns.map(columnString));
  const alternatives = top.filter((c) => !fillSet.has(columnString(c))).slice(0, 50);
  const bank = bankers(rows.flatMap((r) => (r.a ? [r.a] : [])), 5);
  const lowCount = rows.filter((r) => r.a?.confidence === 'low').length;
  const closed = round.closingAt ? new Date(round.closingAt).getTime() < Date.now() : false;

  return (
    <div className="space-y-4">
      <PageHeader
        title={`מחזור ${round.id}`}
        eyebrow={
          <>
            ווינר 16 · הגרלה <span className="num">{fmtDate(round.drawDate)}</span> · פרס ראשון{' '}
            <span className="num">{fmtShekel(round.firstPrize)}</span>
          </>
        }
      >
        {closed ? (
          <StatusPill tone="neutral">נסגר · <span className="num">{fmtDateTime(round.closingAt)}</span></StatusPill>
        ) : (
          <StatusPill tone="ok">פתוח עד <span className="num">{fmtDateTime(round.closingAt)}</span></StatusPill>
        )}
        <Freshness iso={round.predictionsAt} staleAfterHours={24} label="תחזיות עודכנו" />
      </PageHeader>

      {round.isDemo && (
        <p role="note" className="demo-hatch rounded-lg border border-warn/30 bg-warn-soft px-3 py-2 text-sm text-warn">
          <strong>תחזיות דמו.</strong> המשחקים מהטופס הרשמי, אבל ההסתברויות לדוגמה בלבד – לא למילוי טופס. שלב 1 (איסוף
          נתונים ומודל) יחליף אותן.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="סיכוי ל-16/16 עם 20 הטורים" value={best ? oneIn(best.hitProbability) : '—'} sub="בהנחת אי-תלות בין המשחקים" />
        <Tile label="תיקו צפויים בטופס" value={<>≈<span className="num">{expectedDraws(probs).toFixed(1)}</span></>} sub="סכום סיכויי ה-X" />
        <Tile label="משחקים בביטחון נמוך" value={`${lowCount} / ${rows.length}`} sub="סיכוי מרבי מתחת ל-45%" tone={lowCount > 6 ? 'warn' : undefined} />
        <Tile label={`כל ${bank.picks.length} הבנקרים יפגעו`} value={`${Math.round(bank.allHit * 100)}%`} sub="מכפלת הסיכויים" />
      </div>

      <div className="grid items-start gap-4 2xl:grid-cols-[minmax(0,1fr)_44rem]">
        <div className="min-w-0 space-y-2">
          <BoardTable rows={rows} selected={selected?.match.row ?? null} tab={tab} demo={round.isDemo} />
          <MobileBoard rows={rows} selected={selected?.match.row ?? null} tab={tab} demo={round.isDemo} />
          <p className="text-xs text-ink-2">
            ביטחון: ●●● גבוה = סיכוי מרבי ≥55% · ●●○ בינוני = 45–54% · ●○○ נמוך = מתחת ל-45% (מומלץ כפול). לחיצה על משחק פותחת את
            שתי המפות.
          </p>
        </div>

        <div className="min-w-0 space-y-4 2xl:sticky 2xl:top-6">
          {selected && <MatchDetail row={selected} tab={tab} params={params} ruleSet={ruleSet} />}
          <section aria-label="טבלת צד" className="rounded-xl border border-line bg-surface">
            {complete && best ? (
              <Tabs
                label="טבלת צד"
                initial={tab}
                tabs={[
                  {
                    id: 'columns',
                    label: '20 טורים',
                    content: (
                      <>
                        <PlanComparison plans={plans} />
                        <FillGrid plan={best} rows={rows} />
                        <p className="border-t border-line px-3 py-2 text-xs text-ink-2">
                          2 טפסים × 10 טורים = 60 ₪. הטורים נבחרים לפי סיכוי מרבי לפגיעה מלאה בלבד (לא לפי כסף או קופה).
                        </p>
                      </>
                    ),
                  },
                  { id: 'bankers', label: 'בנקרים', content: <BankersTable picks={bank.picks} allHit={bank.allHit} rows={rows} /> },
                  {
                    id: 'alternatives',
                    label: '50 חלופות',
                    content: <AlternativesTable columns={alternatives} reference={columnString(top[0])} startRank={21} />,
                  },
                ]}
              />
            ) : (
              <div className="p-4">
                <EmptyState title="הטורים עוד לא חושבו">חסרות תחזיות לחלק מהמשחקים. הטורים יחושבו כשכל 16 המשחקים יקבלו הסתברויות.</EmptyState>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
