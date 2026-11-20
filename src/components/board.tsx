import Link from 'next/link';
import {
  columnString,
  OUTCOMES,
  type Banker,
  type Column,
  type FillPlan,
  type MatchAnalysis,
  oneIn,
} from '@/lib/engine';
import { fmtDateTime, OUTCOME_LABEL } from '@/lib/format';
import type { MatchView, ParamView, RuleSetView } from '@/lib/types';
import { ConfidenceBadge, OutcomeChip, ProbBar, StatusPill } from './ui';

export interface BoardRow {
  match: MatchView;
  a: MatchAnalysis | null;
}

function pct(p: number) {
  return `${Math.round(p * 100)}%`;
}

function leanText(lean: number) {
  if (lean > 0.1) return 'נוטה לבית';
  if (lean < -0.1) return 'נוטה לחוץ';
  return 'ניטרלי';
}

function agreement(a: MatchAnalysis, lean: number): 'agree' | 'conflict' | 'neutral' {
  if (Math.abs(lean) <= 0.1) return 'neutral';
  const dir = lean > 0 ? '1' : '2';
  if (a.recommendation === 'X') return 'neutral';
  return a.recommendation === dir ? 'agree' : 'conflict';
}

function signed(n: number) {
  return `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(2)}`;
}

export function matchHref(row: number, tab: string) {
  return `/?m=${row}&tab=${tab}#match-detail`;
}

/** The 16-row round board. Columns run start→end by importance; spiritual lean is last and muted. */
export function BoardTable({ rows, selected, tab, demo }: { rows: BoardRow[]; selected: number | null; tab: string; demo: boolean }) {
  return (
    <div role="region" aria-labelledby="board-caption" tabIndex={0} className="scroll-region hidden rounded-xl border border-line md:block">
      <table className="w-full min-w-[54rem] border-collapse text-sm">
        <caption id="board-caption" className="sr-only">
          16 משחקי הטופס לפי סדר הטופס, עם סיכויי 1/X/2, המלצה, רמת ביטחון, כיסוי ונטייה רוחנית
        </caption>
        <thead>
          <tr className="border-b border-line-strong bg-ground text-xs text-ink-2">
            <th scope="col" className="sticky start-0 z-10 bg-ground px-3 py-2 text-start font-medium">
              # · משחק
            </th>
            <th scope="col" className="px-2 py-2 text-start font-medium">מועד</th>
            <th scope="col" className="w-[13rem] px-2 py-2 text-start font-medium">
              סיכויים <span className="num" dir="ltr">1 · X · 2</span> (%)
            </th>
            <th scope="col" className="px-2 py-2 text-start font-medium">המלצה</th>
            <th scope="col" className="px-2 py-2 text-start font-medium">ביטחון</th>
            <th scope="col" className="px-2 py-2 text-start font-medium">כיסוי</th>
            <th scope="col" className="px-3 py-2 text-start font-medium text-spirit/90">נטייה רוחנית (צל)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ match: m, a }) => {
            const sel = selected === m.row;
            const rowBg = sel ? 'bg-real-soft' : demo ? 'demo-hatch bg-surface' : 'bg-surface';
            return (
              <tr key={m.row} className={`group border-b border-line last:border-b-0 ${rowBg} hover:bg-ground`}>
                <th scope="row" className={`sticky start-0 z-[1] px-0 py-0 text-start font-normal ${sel ? 'bg-real-soft' : 'bg-surface group-hover:bg-ground'}`}>
                  <Link
                    href={matchHref(m.row, tab)}
                    scroll={false}
                    aria-current={sel ? 'true' : undefined}
                    className="flex min-h-10 items-center gap-2.5 py-1.5 pe-3 ps-3"
                  >
                    <span className="num w-5 shrink-0 text-center text-xs font-semibold text-ink-2">{m.row}</span>
                    <span className="min-w-0">
                      <span className="block whitespace-nowrap font-medium">
                        <bdi>{m.home}</bdi> <span className="text-ink-3">–</span> <bdi>{m.away}</bdi>
                      </span>
                      <span className="block text-xs text-ink-2">{m.league}</span>
                    </span>
                  </Link>
                </th>
                <td className="num whitespace-nowrap px-2 py-1.5 text-xs text-ink-2">{fmtDateTime(m.kickoffAt)}</td>
                <td className="px-2 py-1.5">
                  {m.status === 'played' && m.result ? (
                    <span className="inline-flex items-center gap-2">
                      <OutcomeChip o={m.result} />
                      <span className="num" dir="ltr">
                        {m.scoreHome}–{m.scoreAway}
                      </span>
                    </span>
                  ) : a ? (
                    <ProbBar probs={a.probs} size="sm" />
                  ) : (
                    <span className="text-xs text-ink-3">אין תחזית עדיין</span>
                  )}
                </td>
                <td className="px-2 py-1.5">{a && <OutcomeChip o={a.recommendation} />}</td>
                <td className="px-2 py-1.5">{a && <ConfidenceBadge c={a.confidence} />}</td>
                <td className="px-2 py-1.5">
                  {a &&
                    (a.coverage === 'double' ? (
                      <span className="inline-flex items-center gap-1 text-xs">
                        כפול
                        <span className="num font-semibold" dir="ltr">
                          {[a.order[0], a.order[1]].sort().map((i) => OUTCOMES[i]).join('')}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-ink-2">יחיד</span>
                    ))}
                </td>
                <td className="px-3 py-1.5 text-xs text-spirit/90">
                  {m.spiritual && a ? (
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      {leanText(m.spiritual.lean)}
                      <span className="num" dir="ltr">
                        {signed(m.spiritual.lean)}
                      </span>
                      {agreement(a, m.spiritual.lean) === 'conflict' && <span className="text-warn">· סותר</span>}
                      {agreement(a, m.spiritual.lean) === 'agree' && <span className="text-ink-2">· תואם</span>}
                    </span>
                  ) : (
                    <span className="text-ink-3">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GlyphCell({ o, highlight = false }: { o: string; highlight?: boolean }) {
  const cls = o === '1' ? 'text-o1' : o === 'X' ? 'text-ink-2' : 'text-[#8a5a00]';
  return (
    <td className="p-0 text-center">
      <span className={`num inline-grid size-6 place-items-center rounded text-[0.8rem] font-bold ${cls} ${highlight ? 'bg-warn-soft ring-1 ring-warn/50' : ''}`}>{o}</span>
    </td>
  );
}

/** 16 × 20 grid (rows = matches in form order, columns 1–20 split into form A and form B). */
export function FillGrid({ plan, rows }: { plan: FillPlan; rows: BoardRow[] }) {
  const cols = plan.columns.map(columnString);
  return (
    <div role="region" aria-labelledby="fill-caption" tabIndex={0} className="scroll-region">
      <table className="border-collapse text-sm">
        <caption id="fill-caption" className="px-3 py-2 text-start text-xs text-ink-2">
          20 טורים לפי סדר הטופס · טופס א׳ = טורים 1–10 · טופס ב׳ = טורים 11–20 · ★ = אותו סימון בכל הטורים
        </caption>
        <thead className="text-xs text-ink-2">
          <tr>
            <td className="sticky start-0 bg-surface" />
            <th scope="colgroup" colSpan={10} className="border-b border-line px-1 pb-1 font-medium">טופס א׳</th>
            <th scope="colgroup" colSpan={10} className="border-b border-s-2 border-line px-1 pb-1 font-medium">טופס ב׳</th>
          </tr>
          <tr>
            <th scope="col" className="sticky start-0 z-[1] bg-surface px-2 py-1 text-start font-medium">משחק</th>
            {cols.map((_, j) => (
              <th key={j} scope="col" className={`num w-7 px-0 py-1 font-medium ${j === 10 ? 'border-s-2 border-line' : ''}`}>
                {j + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ match: m }, i) => {
            const marks = cols.map((c) => c[i]);
            const fixed = new Set(marks).size === 1;
            return (
              <tr key={m.row} className="border-t border-line">
                <th scope="row" className="sticky start-0 z-[1] whitespace-nowrap bg-surface px-2 py-0.5 text-start text-xs font-normal">
                  <span className="num inline-block w-5 font-semibold text-ink-2">{m.row}</span>
                  <bdi className="inline-block max-w-[7.5rem] truncate align-bottom">{m.home}</bdi>
                  {fixed && (
                    <span className="ms-1 text-ink-2" title="קבוע בכל הטורים">
                      ★<span className="sr-only"> קבוע</span>
                    </span>
                  )}
                </th>
                {marks.map((o, j) => (
                  <GlyphCellWrap key={j} o={o} border={j === 10} />
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function GlyphCellWrap({ o, border }: { o: string; border: boolean }) {
  const cls = o === '1' ? 'text-o1' : o === 'X' ? 'text-ink-2' : 'text-[#8a5a00]';
  return (
    <td className={`p-0 text-center ${border ? 'border-s-2 border-line' : ''}`}>
      <span className={`num inline-grid size-6 place-items-center text-[0.8rem] font-bold ${cls}`}>{o}</span>
    </td>
  );
}

export function PlanComparison({ plans }: { plans: FillPlan[] }) {
  return (
    <ol className="space-y-1.5 px-3 py-3 text-sm">
      {plans.map((p, i) => (
        <li key={p.id} className={`flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 rounded-lg px-3 py-2 ${i === 0 ? 'bg-real-soft' : 'bg-ground'}`}>
          <span className="min-w-0">
            {i === 0 && <span className="me-1.5 font-semibold text-real">נבחר ·</span>}
            {p.label}
          </span>
          <span className="num whitespace-nowrap text-ink-2">
            סיכוי ל-16/16: <strong className="text-ink">{oneIn(p.hitProbability)}</strong>
          </span>
        </li>
      ))}
    </ol>
  );
}

export function BankersTable({ picks, allHit, rows }: { picks: Banker[]; allHit: number; rows: BoardRow[] }) {
  const byRow = new Map(rows.map((r) => [r.match.row, r.match]));
  return (
    <div className="space-y-3 p-3">
      <div role="region" aria-labelledby="bankers-caption" tabIndex={0} className="scroll-region rounded-lg border border-line">
        <table className="w-full border-collapse text-sm">
          <caption id="bankers-caption" className="px-3 py-2 text-start text-xs text-ink-2">
            {picks.length} המשחקים עם הסיכוי הגבוה ביותר לסימון אחד – מועמדים לווינר ליין
          </caption>
          <thead className="bg-ground text-xs text-ink-2">
            <tr>
              <th scope="col" className="px-3 py-1.5 text-start font-medium">משחק</th>
              <th scope="col" className="px-2 py-1.5 text-start font-medium">סימון</th>
              <th scope="col" className="px-3 py-1.5 text-end font-medium">סיכוי</th>
            </tr>
          </thead>
          <tbody>
            {picks.map((b) => {
              const m = byRow.get(b.row)!;
              return (
                <tr key={b.row} className="border-t border-line">
                  <th scope="row" className="px-3 py-1.5 text-start font-normal">
                    <span className="num me-2 text-xs font-semibold text-ink-2">{b.row}</span>
                    <bdi>{m.home}</bdi> – <bdi>{m.away}</bdi>
                  </th>
                  <td className="px-2 py-1.5">
                    <OutcomeChip o={b.pick} />
                  </td>
                  <td className="num px-3 py-1.5 text-end">{pct(b.probability)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="rounded-lg bg-ground px-3 py-2 text-sm">
        סיכוי שכל {picks.length} הבנקרים יפגעו יחד: <strong className="num">{pct(allHit)}</strong>
        <span className="block text-xs text-ink-2">
          גם הבנקר החזק ביותר מפספס לעיתים קרובות. יחסי ווינר ליין נבדקים באתר לפני שליחה (הנחיות §5 – נתוני התוכנייה עשויים להשתנות).
        </span>
      </p>
    </div>
  );
}

export function AlternativesTable({ columns, reference, startRank }: { columns: Column[]; reference: string; startRank: number }) {
  return (
    <div role="region" aria-labelledby="alt-caption" tabIndex={0} className="scroll-region">
      <table className="border-collapse text-sm">
        <caption id="alt-caption" className="px-3 py-2 text-start text-xs text-ink-2">
          {columns.length} הטורים הבאים בסבירות (דירוג {startRank}–{startRank + columns.length - 1}). תא מודגש = שונה מהטור הסביר ביותר.
        </caption>
        <thead className="text-xs text-ink-2">
          <tr>
            <th scope="col" className="sticky start-0 z-[1] bg-surface px-2 py-1 text-start font-medium">דירוג</th>
            {Array.from({ length: 16 }, (_, i) => (
              <th key={i} scope="col" className="num w-7 px-0 py-1 font-medium" aria-label={`משחק ${i + 1}`}>
                {i + 1}
              </th>
            ))}
            <th scope="col" className="px-2 py-1 text-end font-medium whitespace-nowrap">סיכוי 16/16</th>
          </tr>
        </thead>
        <tbody>
          {columns.map((c, k) => {
            const s = columnString(c);
            return (
              <tr key={s} className="border-t border-line">
                <th scope="row" className="num sticky start-0 z-[1] bg-surface px-2 py-0.5 text-start text-xs font-semibold text-ink-2">
                  {startRank + k}
                </th>
                {s.split('').map((o, i) => (
                  <GlyphCell key={i} o={o} highlight={o !== reference[i]} />
                ))}
                <td className="num whitespace-nowrap px-2 text-end text-xs text-ink-2">{oneIn(c.probability)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const ZODIAC: Record<string, string> = { tropical: 'טרופי', sidereal: 'סידרי' };
const HOUSES: Record<string, string> = { whole_sign: 'Whole Sign' };
const SY: Record<string, string> = { saadia: 'נוסח רס"ג', gra: 'נוסח הגר"א' };

/** Selected match: realistic map and spiritual map side by side (never blended silently). */
export function MatchDetail({ row, tab, params, ruleSet }: { row: BoardRow; tab: string; params: ParamView[]; ruleSet: RuleSetView }) {
  const { match: m, a } = row;
  const real = params.filter((p) => p.layer === 'realistic');
  const spirit = params.filter((p) => p.layer === 'spiritual');
  const fav = a ? Math.round(a.probs[a.order[0]] * 10) : null;
  return (
    <section id="match-detail" aria-labelledby="md-h" className="@container scroll-mt-20 rounded-xl border border-line bg-surface">
      <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <p className="text-xs text-ink-2">
            משחק <span className="num">{m.row}</span> · {m.league} · <span className="num">{fmtDateTime(m.kickoffAt)}</span>
          </p>
          <h2 id="md-h" className="text-lg font-bold">
            <bdi>{m.home}</bdi> – <bdi>{m.away}</bdi>
          </h2>
        </div>
        <Link href={`/?tab=${tab}`} scroll={false} className="grid min-h-11 min-w-11 place-items-center rounded-lg text-ink-2 hover:bg-ground" aria-label="סגירת פרטי המשחק">
          <span aria-hidden className="text-xl leading-none">×</span>
        </Link>
      </div>

      <div className="grid gap-px bg-line @lg:grid-cols-2">
        <div className="space-y-3 bg-surface p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-real">
            <span aria-hidden className="size-2.5 rounded-full bg-real" /> מפה ריאלית
          </h3>
          {a ? (
            <>
              <ProbBar probs={a.probs} />
              <p className="text-sm">
                המלצה: <strong>{a.recommendation}</strong> ({OUTCOME_LABEL[a.recommendation]}) · <ConfidenceBadge c={a.confidence} />
              </p>
              <p className="text-sm text-ink-2">
                בערך <span className="num">{fav}</span> מכל 10 משחקים כאלה מסתיימים ב-{a.recommendation} – כלומר ב-
                <span className="num">{10 - (fav ?? 0)}</span> מתוך 10 לא.
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-2">אין תחזית למשחק הזה עדיין.</p>
          )}
          <ul className="space-y-1 text-xs">
            {real.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2">
                <span className="min-w-0">{p.name}</span>
                {p.state === 'active' ? (
                  <StatusPill tone="ok">פעיל · <span className="num">{Math.round(p.weight * 100)}%</span></StatusPill>
                ) : (
                  <StatusPill tone="neutral">בצל</StatusPill>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3 bg-surface p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-spirit">
            <span aria-hidden className="size-2.5 rounded-full bg-spirit" /> מפה רוחנית
          </h3>
          {m.spiritual ? (
            <>
              <LeanMeter lean={m.spiritual.lean} />
              <p className="text-sm text-ink-2">
                נטיית תיקו: <span className="num">{Math.round(m.spiritual.drawLean * 100)}%</span> · סט כללים{' '}
                <span dir="ltr">{m.spiritual.ruleSet}</span>
              </p>
            </>
          ) : (
            <p className="text-sm text-ink-2">אין מפה רוחנית למשחק הזה עדיין.</p>
          )}
          <p className="rounded-md bg-spirit-soft px-2.5 py-1.5 text-xs text-spirit">
            משקל רוחני λ = <span className="num">{ruleSet.spiritualLambda}</span> – מוצג לצד ההמלצה ואינו משנה אותה עד שיוכח שיפור בבדיקה בדיעבד.
          </p>
          <ul className="space-y-1 text-xs">
            {spirit.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2">
                <span className="min-w-0">{p.name}</span>
                <StatusPill tone="spirit">בצל</StatusPill>
              </li>
            ))}
          </ul>
          <p className="text-xs text-ink-2">
            {ZODIAC[ruleSet.zodiac] ?? ruleSet.zodiac} · {HOUSES[ruleSet.houseSystem] ?? ruleSet.houseSystem} · אורבים{' '}
            <span className="num">{ruleSet.orbAspect}°/{ruleSet.orbTransit}°</span> · {SY[ruleSet.seferYetzirah] ?? ruleSet.seferYetzirah}
          </p>
        </div>
      </div>

      <div className="space-y-2 border-t border-line px-4 py-3 text-sm">
        <p className="text-xs text-ink-2">
          הקבוצה הימנית בטופס אינה בהכרח המארחת (הנחיות §4). מארחת בפועל: טרם אומתה מול לוח הליגה.
        </p>
        <div className="flex flex-wrap gap-2">
          {[m.home, m.away].map((t) => (
            <Link key={t} href={`/teams?t=${encodeURIComponent(t)}`} className="inline-flex min-h-11 items-center rounded-lg border border-line px-3 hover:bg-ground">
              כרטיס קבוצה: <bdi className="ms-1 font-medium">{t}</bdi>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function LeanMeter({ lean }: { lean: number }) {
  const pos = ((lean + 1) / 2) * 100; // 0 = away … 100 = home
  const text = `${leanText(lean)} (${signed(lean)} בסולם ‎−1 חוץ עד ‎+1 בית)`;
  return (
    <div role="img" aria-label={`נטייה רוחנית: ${text}`}>
      <div className="mb-1 flex justify-between text-[0.7rem] text-ink-2">
        <span>בית</span>
        <span>ניטרלי</span>
        <span>חוץ</span>
      </div>
      {/* home is at the start (right) edge, matching the form */}
      <div className="relative h-2 rounded-full bg-spirit-soft ring-1 ring-spirit/30">
        <span className="absolute inset-y-0 start-1/2 w-px bg-spirit/40" />
        <span className="absolute top-1/2 size-3.5 -translate-y-1/2 rounded-full border-2 border-surface bg-spirit shadow" style={{ insetInlineStart: `calc(${100 - pos}% - 0.44rem)` }} />
      </div>
      <p className="mt-1 text-sm text-spirit">
        {leanText(lean)} <span className="num" dir="ltr">{signed(lean)}</span>
      </p>
    </div>
  );
}

/** Phones (<768px): the same 16 rows as a compact list so the answer ("what do I mark?") is visible without sideways scrolling. */
export function MobileBoard({ rows, selected, tab, demo }: { rows: BoardRow[]; selected: number | null; tab: string; demo: boolean }) {
  return (
    <ol aria-label="16 משחקי הטופס לפי סדר הטופס" className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface md:hidden">
      {rows.map(({ match: m, a }) => {
        const sel = selected === m.row;
        return (
          <li key={m.row} className={sel ? 'bg-real-soft' : demo ? 'demo-hatch' : ''}>
            <Link href={matchHref(m.row, tab)} scroll={false} aria-current={sel ? 'true' : undefined} className="grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-x-2.5 gap-y-1.5 px-3 py-2.5">
              <span className="num row-span-2 self-start pt-0.5 text-center text-xs font-semibold text-ink-2">{m.row}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  <bdi>{m.home}</bdi> <span className="text-ink-3">–</span> <bdi>{m.away}</bdi>
                </span>
                <span className="block truncate text-xs text-ink-2">
                  {m.league} · <span className="num">{fmtDateTime(m.kickoffAt)}</span>
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                {a && <ConfidenceBadge c={a.confidence} />}
                {a && <OutcomeChip o={a.recommendation} />}
              </span>
              <span className="col-span-2">
                {m.status === 'played' && m.result ? (
                  <span className="num text-sm" dir="ltr">{m.scoreHome}–{m.scoreAway}</span>
                ) : a ? (
                  <ProbBar probs={a.probs} size="sm" />
                ) : (
                  <span className="text-xs text-ink-3">אין תחזית עדיין</span>
                )}
              </span>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
