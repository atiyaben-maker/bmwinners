import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Card, EmptyState, LoadingRegion, OutcomeChip, PageHeader, StatusPill, Tile } from '@/components/ui';
import { fmtDate, fmtInt, fmtShekel } from '@/lib/format';
import { getMetrics, getParams, getPreviousRound, getPrizes, getSources } from '@/server/data';

export const metadata: Metadata = { title: 'מדידה ולמידה' };

const TIER: Record<string, string> = {
  official: 'רשמי',
  professional: 'מקצועי',
  derived: 'נגזר',
  market: 'שוק',
  press: 'עיתונות',
  index: 'אינדקס',
  computed: 'חישובי',
};

export default function LearningPage() {
  return (
    <>
      <PageHeader title="מדידה ולמידה" eyebrow="דיוק בלבד: RPS, פגיעות ופגיעה מלאה – בלי מדדי כסף" />
      <Suspense fallback={<LoadingRegion label="טוען מדדים" rows={12} />}>
        <Learning />
      </Suspense>
    </>
  );
}

async function Learning() {
  const [metrics, params, sources, prev] = await Promise.all([getMetrics(), getParams(), getSources(), getPreviousRound()]);
  const prizes = prev ? await getPrizes(prev.id) : [];
  const rounds = new Set(metrics.map((m) => m.roundId)).size;
  const combined = metrics.filter((m) => m.layer === 'combined');
  const meanRps = combined.length ? combined.reduce((a, m) => a + (m.rps ?? 0), 0) / combined.length : null;
  const meanHits = combined.length ? combined.reduce((a, m) => a + (m.hits ?? 0), 0) / combined.length : null;
  const active = params.filter((p) => p.state === 'active').length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Tile label="מחזורים שנמדדו" value={rounds} sub="תחזיות שהוקפאו לפני שריקת הפתיחה" />
        <Tile label="RPS ממוצע (נמוך = טוב)" value={meanRps == null ? '—' : meanRps.toFixed(3)} sub={`n = ${combined.length} מחזורים`} />
        <Tile label="פגיעות ממוצעות בטור המוביל" value={meanHits == null ? '—' : meanHits.toFixed(1)} sub="מתוך 16" />
        <Tile label="פרמטרים פעילים / בצל" value={`${active} / ${params.length - active}`} sub="פרמטר עובר לפעיל רק אחרי שיפור מדוד" />
      </div>

      {rounds === 0 && (
        <EmptyState title="עוד אין מדידה">
          המדידה מתחילה אחרי המחזור הראשון שבו התחזיות הוקפאו לפני המשחקים. תחזיות דמו לא נמדדות. אחרי כמה מחזורים יופיעו כאן כיול
          (&quot;כשאמרנו 60% – זה קרה X%&quot;), בדיקות הסרה לכל פרמטר והשוואת צל.
        </EmptyState>
      )}

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <Card title="מרשם פרמטרים" id="params">
          <div role="region" aria-labelledby="params-h" tabIndex={0} className="scroll-region rounded-b-xl">
            <table className="w-full min-w-[30rem] border-collapse text-sm">
              <thead className="bg-ground text-xs text-ink-2">
                <tr>
                  <th scope="col" className="px-4 py-2 text-start font-medium">פרמטר</th>
                  <th scope="col" className="px-2 py-2 text-start font-medium">מפה</th>
                  <th scope="col" className="px-2 py-2 text-start font-medium">מצב</th>
                  <th scope="col" className="px-4 py-2 text-end font-medium">משקל (%)</th>
                </tr>
              </thead>
              <tbody>
                {params.map((p) => (
                  <tr key={p.id} className="border-t border-line">
                    <th scope="row" className="px-4 py-2 text-start font-normal">
                      {p.name}
                      {p.notes && <span className="block text-xs text-ink-2">{p.notes}</span>}
                    </th>
                    <td className={`px-2 py-2 text-xs ${p.layer === 'realistic' ? 'text-real' : 'text-spirit'}`}>
                      {p.layer === 'realistic' ? 'ריאלית' : 'רוחנית'}
                    </td>
                    <td className="px-2 py-2">
                      {p.state === 'active' ? (
                        <StatusPill tone="ok">● פעיל</StatusPill>
                      ) : p.state === 'shadow' ? (
                        <StatusPill tone="neutral">◌ בצל</StatusPill>
                      ) : (
                        <StatusPill tone="warn">✕ הוצא</StatusPill>
                      )}
                    </td>
                    <td className="num px-4 py-2 text-end">{Math.round(p.weight * 100)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="אמינות מקורות" id="sources">
          <div role="region" aria-labelledby="sources-h" tabIndex={0} className="scroll-region rounded-b-xl">
            <table className="w-full min-w-[30rem] border-collapse text-sm">
              <thead className="bg-ground text-xs text-ink-2">
                <tr>
                  <th scope="col" className="px-4 py-2 text-start font-medium">מקור</th>
                  <th scope="col" className="px-2 py-2 text-start font-medium">סוג</th>
                  <th scope="col" className="px-2 py-2 text-start font-medium">משמש ל</th>
                  <th scope="col" className="px-4 py-2 text-end font-medium">אמינות (n)</th>
                </tr>
              </thead>
              <tbody>
                {sources.map((s) => (
                  <tr key={s.id} className="border-t border-line">
                    <th scope="row" className="px-4 py-2 text-start font-normal">
                      <bdi>{s.name}</bdi>
                    </th>
                    <td className="px-2 py-2 text-xs">{TIER[s.tier] ?? s.tier}</td>
                    <td className="px-2 py-2 text-xs text-ink-2">{s.usedFor}</td>
                    <td className="num px-4 py-2 text-end text-xs">
                      {s.reliability == null ? <span className="text-ink-3">טרם נבדק (0)</span> : `${Math.round(s.reliability * 100)}% (${s.sample})`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {prev && (
        <Card
          id="prev"
          title={
            <>
              תוצאות רשמיות · מחזור <span className="num">{prev.id}</span>
            </>
          }
          actions={
            <span className="text-xs text-ink-2">
              הגרלה <span className="num">{fmtDate(prev.drawDate)}</span> · {prev.status === 'verified' ? 'מאומת מול winner.co.il' : 'לא מאומת'}
            </span>
          }
        >
          <div className="grid gap-px bg-line lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div role="region" aria-labelledby="prev-h" tabIndex={0} className="scroll-region">
              <table className="w-full min-w-[26rem] border-collapse text-sm">
                <thead className="bg-ground text-xs text-ink-2">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-start font-medium"># · משחק</th>
                    <th scope="col" className="px-2 py-2 text-start font-medium">תוצאה</th>
                    <th scope="col" className="px-4 py-2 text-start font-medium">סימון</th>
                  </tr>
                </thead>
                <tbody>
                  {prev.matches.map((m) => (
                    <tr key={m.row} className="border-t border-line">
                      <th scope="row" className="px-4 py-1.5 text-start font-normal">
                        <span className="num me-2 text-xs font-semibold text-ink-2">{m.row}</span>
                        <bdi>{m.home}</bdi> – <bdi>{m.away}</bdi>
                      </th>
                      <td className="num px-2 py-1.5" dir="ltr">
                        {m.scoreHome != null ? `${m.scoreHome}–${m.scoreAway}` : '—'}
                      </td>
                      <td className="px-4 py-1.5">{m.result && <OutcomeChip o={m.result} />}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-surface">
              <table className="w-full border-collapse text-sm">
                <caption className="px-4 py-2 text-start text-xs font-semibold text-ink-2">טבלת פרסים</caption>
                <thead className="bg-ground text-xs text-ink-2">
                  <tr>
                    <th scope="col" className="px-4 py-1.5 text-start font-medium">פגיעות</th>
                    <th scope="col" className="px-2 py-1.5 text-end font-medium">זוכים</th>
                    <th scope="col" className="px-4 py-1.5 text-end font-medium">פרס</th>
                  </tr>
                </thead>
                <tbody>
                  {prizes.map((t) => (
                    <tr key={t.hits} className="border-t border-line">
                      <th scope="row" className="num px-4 py-1.5 text-start font-normal">{t.hits}</th>
                      <td className="num px-2 py-1.5 text-end">{fmtInt(t.winners)}</td>
                      <td className="num px-4 py-1.5 text-end">{fmtShekel(t.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="px-4 py-2 text-xs text-ink-2">
                התפלגות התוצאות: <span className="num">{prev.matches.filter((m) => m.result === '1').length}</span> × 1 ·{' '}
                <span className="num">{prev.matches.filter((m) => m.result === 'X').length}</span> × X ·{' '}
                <span className="num">{prev.matches.filter((m) => m.result === '2').length}</span> × 2
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
