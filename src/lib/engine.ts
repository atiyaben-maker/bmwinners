// Recommendation engine – pure functions, no I/O (unit-tested in engine.test.ts).
// Implements the work plan: per-match 1/X/2 probabilities → recommendation, confidence,
// coverage, the exact top-K columns by product of probabilities (Bar-Ilan ranking method),
// the 20-column weekly fill (best of three structures) and bankers.

export const OUTCOMES = ['1', 'X', '2'] as const;
export type Outcome = (typeof OUTCOMES)[number];
export type Probs = readonly [number, number, number];
export type Confidence = 'high' | 'medium' | 'low';

export const CONFIDENCE_HIGH = 0.55;
export const CONFIDENCE_MEDIUM = 0.45;

export function normalize(p: Probs): Probs {
  const s = p[0] + p[1] + p[2];
  if (!(s > 0)) throw new Error('probabilities must sum to a positive number');
  return [p[0] / s, p[1] / s, p[2] / s];
}

/** Whole percentages that always sum to 100 (largest-remainder method). */
export function toPercents(p: Probs): [number, number, number] {
  const n = normalize(p);
  const raw = n.map((x) => x * 100);
  const floor = raw.map(Math.floor);
  let rest = 100 - floor.reduce((a, b) => a + b, 0);
  const order = raw
    .map((x, i) => ({ i, r: x - Math.floor(x) }))
    .sort((a, b) => b.r - a.r || a.i - b.i);
  for (const { i } of order) {
    if (rest <= 0) break;
    floor[i] += 1;
    rest -= 1;
  }
  return floor as [number, number, number];
}

/** Outcome indexes sorted from most to least likely (ties keep form order 1, X, 2). */
export function ranked(p: Probs): [number, number, number] {
  return [0, 1, 2].sort((a, b) => p[b] - p[a] || a - b) as [number, number, number];
}

export function confidenceOf(p: Probs): Confidence {
  const max = Math.max(...normalize(p));
  if (max >= CONFIDENCE_HIGH) return 'high';
  if (max >= CONFIDENCE_MEDIUM) return 'medium';
  return 'low';
}

export interface MatchAnalysis {
  row: number;
  probs: Probs;
  percents: [number, number, number];
  order: [number, number, number];
  recommendation: Outcome;
  confidence: Confidence;
  coverage: 'single' | 'double';
}

export function analyse(row: number, raw: Probs): MatchAnalysis {
  const probs = normalize(raw);
  const order = ranked(probs);
  const confidence = confidenceOf(probs);
  return {
    row,
    probs,
    percents: toPercents(probs),
    order,
    recommendation: OUTCOMES[order[0]],
    confidence,
    coverage: confidence === 'low' ? 'double' : 'single',
  };
}

export interface Column {
  marks: number[]; // outcome index per match, in form order
  probability: number; // chance this column hits 16/16 (under independence)
}

export function columnString(c: Pick<Column, 'marks'>): string {
  return c.marks.map((m) => OUTCOMES[m]).join('');
}

function columnProbability(matches: readonly Probs[], marks: number[]): number {
  return marks.reduce((acc, m, i) => acc * matches[i][m], 1);
}

/**
 * Exact K most likely columns (best-first search over rank vectors).
 * Rank vector r: r[i] = 0 → most likely outcome of match i, 1 → second, 2 → third.
 */
export function topColumns(matchesRaw: readonly Probs[], k: number): Column[] {
  const matches = matchesRaw.map(normalize);
  const orders = matches.map(ranked);
  const n = matches.length;
  const logp = (r: number[]) =>
    r.reduce((acc, ri, i) => acc + Math.log(Math.max(matches[i][orders[i][ri]], 1e-12)), 0);
  const key = (r: number[]) => r.join('');
  const start = new Array(n).fill(0);
  const frontier: { r: number[]; lp: number }[] = [{ r: start, lp: logp(start) }];
  const seen = new Set([key(start)]);
  const out: Column[] = [];
  while (out.length < k && frontier.length) {
    let best = 0;
    for (let j = 1; j < frontier.length; j++) if (frontier[j].lp > frontier[best].lp) best = j;
    const { r } = frontier.splice(best, 1)[0];
    const marks = r.map((ri, i) => orders[i][ri]);
    out.push({ marks, probability: columnProbability(matches, marks) });
    for (let i = 0; i < n; i++) {
      if (r[i] >= 2) continue;
      const next = r.slice();
      next[i] += 1;
      const kk = key(next);
      if (seen.has(kk)) continue;
      seen.add(kk);
      frontier.push({ r: next, lp: logp(next) });
    }
  }
  return out;
}

export interface FillPlan {
  id: 'singles' | 'double_two_triples' | 'four_doubles';
  label: string;
  columns: Column[]; // exactly `size` distinct columns
  hitProbability: number; // P(at least one column is 16/16)
}

function uniqueAdd(target: Column[], seen: Set<string>, c: Column) {
  const s = columnString(c);
  if (seen.has(s)) return false;
  seen.add(s);
  target.push(c);
  return true;
}

function expandSystem(matches: readonly Probs[], choices: number[][]): Column[] {
  let combos: number[][] = [[]];
  for (const opts of choices) {
    const next: number[][] = [];
    for (const c of combos) for (const o of opts) next.push([...c, o]);
    combos = next;
  }
  return combos.map((marks) => ({ marks, probability: columnProbability(matches, marks) }));
}

/** The weekly fill: three ways to spend `size` columns; returns all, best first. */
export function fillPlans(matchesRaw: readonly Probs[], size = 20): FillPlan[] {
  const matches = matchesRaw.map(normalize);
  const orders = matches.map(ranked);
  const byUncertainty = matches
    .map((p, i) => ({ i, max: Math.max(...p) }))
    .sort((a, b) => a.max - b.max || a.i - b.i)
    .map((x) => x.i);
  const pool = topColumns(matches, size + 200);

  const finish = (base: Column[]): Column[] => {
    const seen = new Set<string>();
    const cols: Column[] = [];
    for (const c of base) if (cols.length < size) uniqueAdd(cols, seen, c);
    for (const c of pool) if (cols.length < size) uniqueAdd(cols, seen, c);
    return cols;
  };

  const system = (triples: number[], doubles: number[]) =>
    expandSystem(
      matches,
      matches.map((_, i) =>
        triples.includes(i) ? [0, 1, 2] : doubles.includes(i) ? [orders[i][0], orders[i][1]] : [orders[i][0]],
      ),
    );

  const plans: FillPlan[] = [
    { id: 'singles', label: `${size} הטורים הסבירים ביותר`, columns: finish(pool.slice(0, size)), hitProbability: 0 },
    {
      id: 'double_two_triples',
      label: 'שיטה: 2 משולשים + כפול אחד (18 טורים) + טורים בודדים',
      columns: finish(system(byUncertainty.slice(0, 2), byUncertainty.slice(2, 3))),
      hitProbability: 0,
    },
    {
      id: 'four_doubles',
      label: 'שיטה: 4 כפולים (16 טורים) + טורים בודדים',
      columns: finish(system([], byUncertainty.slice(0, 4))),
      hitProbability: 0,
    },
  ];
  for (const p of plans) p.hitProbability = p.columns.reduce((a, c) => a + c.probability, 0);
  return plans.sort((a, b) => b.hitProbability - a.hitProbability);
}

export interface Banker {
  row: number;
  pick: Outcome;
  probability: number;
}

export function bankers(analyses: MatchAnalysis[], count = 5): { picks: Banker[]; allHit: number } {
  const picks = analyses
    .map((a) => ({ row: a.row, pick: a.recommendation, probability: a.probs[a.order[0]] }))
    .sort((a, b) => b.probability - a.probability || a.row - b.row)
    .slice(0, count);
  return { picks, allHit: picks.reduce((acc, b) => acc * b.probability, 1) };
}

export function expectedDraws(matches: readonly Probs[]): number {
  return matches.map(normalize).reduce((a, p) => a + p[1], 0);
}

/** "1 in N" wording for small probabilities. */
export function oneIn(p: number): string {
  if (!(p > 0)) return '—';
  const n = Math.round(1 / p);
  return `1 ל-${n.toLocaleString('he-IL')}`;
}

/** Ranked probability score for one match (lower is better). */
export function rps(raw: Probs, actual: Outcome): number {
  const p = normalize(raw);
  const o = [0, 0, 0];
  o[OUTCOMES.indexOf(actual)] = 1;
  const c1 = p[0] - o[0];
  const c2 = p[0] + p[1] - (o[0] + o[1]);
  return (c1 * c1 + c2 * c2) / 2;
}
