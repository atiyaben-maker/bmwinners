const TZ = 'Asia/Jerusalem';

const dateTime = new Intl.DateTimeFormat('he-IL', {
  timeZone: TZ,
  weekday: 'short',
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});
const dateOnly = new Intl.DateTimeFormat('he-IL', { timeZone: TZ, day: '2-digit', month: '2-digit', year: 'numeric' });
const shekel = new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 });
const integer = new Intl.NumberFormat('he-IL', { maximumFractionDigits: 0 });

export function fmtDateTime(iso: string | null): string {
  return iso ? dateTime.format(new Date(iso)) : '—';
}
export function fmtDate(iso: string | null): string {
  return iso ? dateOnly.format(new Date(iso)) : '—';
}
export function fmtShekel(n: number | null): string {
  return n == null ? '—' : shekel.format(n);
}
export function fmtInt(n: number | null): string {
  return n == null ? '—' : integer.format(n);
}

/** Relative age in Hebrew ("לפני 3 שעות"). `now` is injectable for tests. */
export function fmtAge(iso: string, now = Date.now()): string {
  const mins = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'עכשיו';
  if (mins < 60) return `לפני ${mins} דק׳`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `לפני ${hours} שע׳`;
  return `לפני ${Math.round(hours / 24)} ימים`;
}

export const OUTCOME_LABEL = { '1': 'בית', X: 'תיקו', '2': 'חוץ' } as const;
export const CONFIDENCE_LABEL = { high: 'גבוה', medium: 'בינוני', low: 'נמוך' } as const;
export const CONFIDENCE_DOTS = { high: '●●●', medium: '●●○', low: '●○○' } as const;
