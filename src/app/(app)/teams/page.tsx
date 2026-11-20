import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Card, EmptyState, LoadingRegion, PageHeader, StatusPill } from '@/components/ui';
import { doubleLetters, gematria, reduced } from '@/lib/gematria';
import { fmtDateTime } from '@/lib/format';
import type { MatchView, RuleSetView } from '@/lib/types';
import { getCurrentRound, getRuleSet } from '@/server/data';

export const metadata: Metadata = { title: 'קבוצות ומפות' };
type SP = Promise<Record<string, string | string[] | undefined>>;

// Research protocol per round, in the locked order (decision "protocol", 13.11.2026).
const PROTOCOL = [
  { id: 'players', label: 'שחקני שדה (10)', layer: 'שני המפות' },
  { id: 'goalkeeper', label: 'שוער', layer: 'שני המפות' },
  { id: 'coach', label: 'מאמן', layer: 'שני המפות' },
  { id: 'owners', label: 'בעלים', layer: 'שני המפות' },
  { id: 'fans', label: 'אוהדים', layer: 'ריאלית בלבד' },
  { id: 'team', label: 'הקבוצה כיחידה (ייסוד, שם)', layer: 'שני המפות' },
  { id: 'venue', label: 'תאריך ומיקום המשחק', layer: 'שני המפות' },
] as const;

export default function TeamsPage({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <PageHeader title="קבוצות ומפות" eyebrow="מפה ריאלית ומפה רוחנית לכל קבוצה במחזור" />
      <Suspense fallback={<LoadingRegion label="טוען קבוצות" rows={10} />}>
        <Teams searchParams={searchParams} />
      </Suspense>
    </>
  );
}

interface TeamEntry {
  name: string;
  league: string;
  match: MatchView;
  side: 'home' | 'away';
}

async function Teams({ searchParams }: { searchParams: SP }) {
  const [sp, round, ruleSet] = await Promise.all([searchParams, getCurrentRound(), getRuleSet()]);
  if (!round) return <EmptyState title="אין מחזור טעון">הקבוצות מופיעות כאן לפי משחקי הטופס הנוכחי.</EmptyState>;

  const teams: TeamEntry[] = round.matches.flatMap((m) => [
    { name: m.home, league: m.league, match: m, side: 'home' as const },
    { name: m.away, league: m.league, match: m, side: 'away' as const },
  ]);
  const leagues = [...new Set(teams.map((t) => t.league))];
  const t = typeof sp.t === 'string' ? sp.t : null;
  const selected = teams.find((x) => x.name === t) ?? null;

  return (
    <div className="grid items-start gap-4 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <Card title={`${teams.length} קבוצות במחזור ${round.id}`} id="team-list" className="xl:sticky xl:top-6">
        <div className="max-h-none divide-y divide-line xl:max-h-[calc(100dvh-10rem)] xl:overflow-y-auto">
          {leagues.map((lg) => (
            <div key={lg} className="px-2 py-2">
              <h3 className="px-2 pb-1 text-xs font-semibold text-ink-2">{lg}</h3>
              <ul>
                {teams
                  .filter((x) => x.league === lg)
                  .map((x) => {
                    const sel = x.name === selected?.name;
                    return (
                      <li key={x.name}>
                        <Link
                          href={`/teams?t=${encodeURIComponent(x.name)}#team-card`}
                          scroll={false}
                          aria-current={sel ? 'true' : undefined}
                          className={`flex min-h-11 items-center justify-between gap-2 rounded-lg px-2 text-sm ${sel ? 'bg-ink text-white' : 'hover:bg-ground'}`}
                        >
                          <bdi className="min-w-0 truncate">{x.name}</bdi>
                          <span className={`num shrink-0 text-xs ${sel ? 'text-white/80' : 'text-ink-2'}`}>משחק {x.match.row}</span>
                        </Link>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
        </div>
      </Card>

      <div id="team-card" className="min-w-0 scroll-mt-20">
        {selected ? (
          <TeamCard team={selected} ruleSet={ruleSet} />
        ) : (
          <EmptyState title="בחרו קבוצה">כל כרטיס מציג את הנתונים הקבועים, הנתונים המשתנים, פרוטוקול המחקר והמפה הרוחנית של הקבוצה.</EmptyState>
        )}
      </div>
    </div>
  );
}

function Missing({ children }: { children: React.ReactNode }) {
  return <dd className="text-ink-3">{children}</dd>;
}

function TeamCard({ team, ruleSet }: { team: TeamEntry; ruleSet: RuleSetView }) {
  const m = team.match;
  const opponent = team.side === 'home' ? m.away : m.home;
  const g = gematria(team.name);
  const doubles = doubleLetters(team.name, ruleSet.letterPlanet);
  return (
    <div className="@container space-y-4">
      <div className="rounded-xl border border-line bg-surface px-4 py-3">
        <p className="text-xs text-ink-2">{team.league}</p>
        <h2 className="text-xl font-bold">
          <bdi>{team.name}</bdi>
        </h2>
        <p className="mt-1 text-sm text-ink-2">
          משחק <span className="num">{m.row}</span> בטופס: {team.side === 'home' ? 'צד ימין' : 'צד שמאל'} מול <bdi>{opponent}</bdi> ·{' '}
          <span className="num">{fmtDateTime(m.kickoffAt)}</span>
        </p>
      </div>

      <div className="grid gap-4 @2xl:grid-cols-2">
        <Card title={<span className="text-real">מפה ריאלית</span>} id="real">
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 px-4 py-3 text-sm">
            <dt className="text-ink-2">שכבה קבועה</dt>
            <dd className="font-medium">ייסוד, אצטדיון, בעלים היסטוריים</dd>
            <dt className="text-ink-2">תאריך ייסוד</dt>
            <Missing>טרם נאסף · נדרש מקור רשמי של המועדון</Missing>
            <dt className="text-ink-2">שכבה משתנה</dt>
            <dd className="font-medium">סגל, מאמן, זמינות, אוהדים</dd>
            <dt className="text-ink-2">סגל ומאמן</dt>
            <Missing>טרם נאסף · מקור: אתר ההתאחדות / הליגה</Missing>
            <dt className="text-ink-2">יומן שינויים</dt>
            <Missing>אין רשומות</Missing>
          </dl>
        </Card>

        <Card title={<span className="text-spirit">מפה רוחנית</span>} id="spirit">
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 px-4 py-3 text-sm">
            <dt className="text-ink-2">גימטריה (שם בטופס)</dt>
            <dd>
              <strong className="num">{g}</strong> <span className="text-ink-2">· מספר קטן</span> <strong className="num">{reduced(g)}</strong>
            </dd>
            <dt className="text-ink-2">אותיות כפולות</dt>
            <dd>
              {doubles.length ? (
                <ul className="flex flex-wrap gap-1.5">
                  {doubles.map((d) => (
                    <li key={d.letter}>
                      <StatusPill tone="spirit">
                        {d.letter}
                        {d.count > 1 && <span className="num">×{d.count}</span>} → {d.planet}
                      </StatusPill>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-ink-3">אין</span>
              )}
            </dd>
            <dt className="text-ink-2">מפת ייסוד (R3)</dt>
            <Missing>ממתינה לתאריך ייסוד מאומת</Missing>
            <dt className="text-ink-2">מפות אנשים (R4)</dt>
            <Missing>ממתינות לסגל ולתאריכי לידה</Missing>
          </dl>
          <p className="border-t border-line px-4 py-2 text-xs text-ink-2">
            חישוב לפי סט כללים <span dir="ltr">{ruleSet.version}</span>: גימטריה רגילה (סופיות כערך הבסיס), אותיות בגדכפר״ת לפי נוסח רס״ג.
            בצל – לא משפיע על ההמלצה.
          </p>
        </Card>
      </div>

      <Card title="פרוטוקול מחקר למחזור" id="protocol" actions={<StatusPill tone="neutral">ממתין לשלב 1</StatusPill>}>
        <ol className="divide-y divide-line">
          {PROTOCOL.map((p, i) => (
            <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
              <span className="flex min-w-0 items-center gap-3">
                <span className="num grid size-6 shrink-0 place-items-center rounded-full bg-ground text-xs font-semibold">{i + 1}</span>
                <span className="min-w-0">
                  {p.label} <span className="text-xs text-ink-2">· {p.layer}</span>
                </span>
              </span>
              <span className="shrink-0 text-xs text-ink-3">○ טרם בוצע</span>
            </li>
          ))}
        </ol>
        <p className="border-t border-line px-4 py-2 text-xs text-ink-2">
          אחרי שתי הקבוצות: סינתזת משחק ← סינתזת טופס. כל מחזור נחקר מחדש; נתונים קבועים נשמרים ומתעדכנים רק ביומן שינויים.
        </p>
      </Card>
    </div>
  );
}
