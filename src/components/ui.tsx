import type { Confidence, Outcome, Probs } from '@/lib/engine';
import { toPercents } from '@/lib/engine';
import { CONFIDENCE_DOTS, CONFIDENCE_LABEL, fmtAge, fmtDateTime, OUTCOME_LABEL } from '@/lib/format';

const SEG = [
  { o: '1', cls: 'bg-o1 text-white' },
  { o: 'X', cls: 'bg-ox text-ink' },
  { o: '2', cls: 'bg-o2 text-ink' },
] as const;

/** 100% stacked bar in fixed form order 1 · X · 2 (fills from the start edge). */
export function ProbBar({ probs, size = 'md' }: { probs: Probs; size?: 'sm' | 'md' }) {
  const pc = toPercents(probs);
  const label = `סיכויים: 1 (${OUTCOME_LABEL['1']}) ${pc[0]}%, X (${OUTCOME_LABEL.X}) ${pc[1]}%, 2 (${OUTCOME_LABEL['2']}) ${pc[2]}%`;
  return (
    <div
      role="img"
      aria-label={label}
      title={label}
      className={`num flex w-full overflow-hidden rounded-md ring-1 ring-ink/25 ${size === 'sm' ? 'h-5 text-[0.7rem]' : 'h-6 text-xs'}`}
    >
      {SEG.map((s, i) => (
        <span
          key={s.o}
          style={{ width: `${pc[i]}%` }}
          className={`flex items-center justify-center font-semibold ${s.cls} ${i > 0 ? 'border-s-2 border-surface' : ''}`}
        >
          {pc[i] >= 12 ? `${pc[i]}%` : ''}
        </span>
      ))}
    </div>
  );
}

export function OutcomeChip({ o, muted = false }: { o: Outcome; muted?: boolean }) {
  const cls = o === '1' ? 'bg-o1 text-white' : o === 'X' ? 'bg-ox text-ink' : 'bg-o2 text-ink';
  return (
    <span
      title={OUTCOME_LABEL[o]}
      className={`num inline-grid size-7 place-items-center rounded-md font-bold ${muted ? 'bg-ground text-ink ring-1 ring-line-strong' : cls}`}
    >
      {o}
    </span>
  );
}

export function ConfidenceBadge({ c }: { c: Confidence }) {
  const tone = c === 'high' ? 'text-ink' : c === 'medium' ? 'text-ink-2' : 'text-warn';
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap text-sm ${tone}`}>
      <span aria-hidden className="tracking-tight">
        {CONFIDENCE_DOTS[c]}
      </span>
      {CONFIDENCE_LABEL[c]}
    </span>
  );
}

/** "updated X ago"; amber + label when older than `staleAfterHours`. */
export function Freshness({ iso, staleAfterHours, label = 'עודכן' }: { iso: string | null; staleAfterHours: number; label?: string }) {
  if (!iso) return <span className="text-sm text-ink-3">{label}: אין נתונים</span>;
  const stale = Date.now() - new Date(iso).getTime() > staleAfterHours * 3600_000;
  return (
    <span className={`inline-flex items-center gap-1.5 text-sm ${stale ? 'text-warn' : 'text-ink-2'}`}>
      <span aria-hidden>{stale ? '⚠' : '↻'}</span>
      {label}{' '}
      <time dateTime={iso} title={fmtDateTime(iso)}>
        {fmtAge(iso)}
      </time>
      {stale && <span className="font-medium">· לא עדכני</span>}
    </span>
  );
}

export function PageHeader({ title, children, eyebrow }: { title: string; eyebrow?: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
      <div className="min-w-0">
        {eyebrow && <div className="mb-0.5 text-sm text-ink-2">{eyebrow}</div>}
        <h1 className="text-2xl font-bold sm:text-[1.65rem]">{title}</h1>
      </div>
      {children && <div className="flex flex-wrap items-center gap-x-4 gap-y-1">{children}</div>}
    </div>
  );
}

export function Card({ title, children, className = '', actions, id }: { title?: React.ReactNode; children: React.ReactNode; className?: string; actions?: React.ReactNode; id?: string }) {
  return (
    <section aria-labelledby={title && id ? `${id}-h` : undefined} className={`min-w-0 rounded-xl border border-line bg-surface ${className}`}>
      {title && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
          <h2 id={id ? `${id}-h` : undefined} className="text-base font-bold">
            {title}
          </h2>
          {actions}
        </div>
      )}
      {children}
    </section>
  );
}

export function Tile({ label, value, sub, tone }: { label: string; value: React.ReactNode; sub?: React.ReactNode; tone?: 'warn' }) {
  return (
    <div className="min-w-0 rounded-xl border border-line bg-surface px-4 py-3">
      <div className="text-sm text-ink-2">{label}</div>
      <div className={`num mt-0.5 font-display text-xl font-bold sm:text-2xl ${tone === 'warn' ? 'text-warn' : ''}`}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-ink-2">{sub}</div>}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line-strong bg-surface px-5 py-8 text-center">
      <p className="font-display font-semibold">{title}</p>
      {children && <div className="mx-auto mt-1.5 max-w-prose text-sm text-ink-2">{children}</div>}
    </div>
  );
}

export function StatusPill({ tone, children }: { tone: 'ok' | 'warn' | 'neutral' | 'spirit'; children: React.ReactNode }) {
  const cls = {
    ok: 'bg-real-soft text-real',
    warn: 'bg-warn-soft text-warn',
    neutral: 'bg-ground text-ink-2',
    spirit: 'bg-spirit-soft text-spirit',
  }[tone];
  return <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>{children}</span>;
}

export function Skeleton({ rows = 8, className = '' }: { rows?: number; className?: string }) {
  return (
    <div aria-hidden className={`space-y-2 ${className}`}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-9 animate-pulse rounded-md bg-line/70 motion-reduce:animate-none" />
      ))}
    </div>
  );
}

export function LoadingRegion({ label, rows }: { label: string; rows?: number }) {
  return (
    <div role="status" aria-label={label}>
      <span className="sr-only">{label}</span>
      <Skeleton rows={rows} />
    </div>
  );
}
