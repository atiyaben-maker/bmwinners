import { describe, expect, it } from 'vitest';
import {
  analyse,
  bankers,
  columnString,
  confidenceOf,
  fillPlans,
  normalize,
  oneIn,
  rps,
  toPercents,
  topColumns,
  type Probs,
} from './engine';
import { DEMO_ROUND } from './demo';

const round: Probs[] = DEMO_ROUND.matches.map((m) => m.combined!);

describe('normalize / percents', () => {
  it('normalizes to 1', () => {
    for (const p of round) {
      const n = normalize(p);
      expect(Math.abs(n[0] + n[1] + n[2] - 1)).toBeLessThan(1e-9);
    }
  });
  it('whole percentages always sum to 100', () => {
    const cases: Probs[] = [[1, 1, 1], [0.335, 0.335, 0.33], [0.999, 0.0005, 0.0005], ...round];
    for (const c of cases) {
      const pc = toPercents(c);
      expect(pc.reduce((a, b) => a + b, 0)).toBe(100);
      pc.forEach((x) => expect(Number.isInteger(x)).toBe(true));
    }
  });
  it('rejects empty probabilities', () => {
    expect(() => normalize([0, 0, 0])).toThrow();
  });
});

describe('confidence and recommendation', () => {
  it('uses the documented thresholds', () => {
    expect(confidenceOf([0.58, 0.24, 0.18])).toBe('high');
    expect(confidenceOf([0.47, 0.29, 0.24])).toBe('medium');
    expect(confidenceOf([0.35, 0.33, 0.32])).toBe('low');
  });
  it('recommends the most likely outcome and doubles low-confidence matches', () => {
    const a = analyse(8, [0.36, 0.27, 0.37]);
    expect(a.recommendation).toBe('2');
    expect(a.coverage).toBe('double');
  });
  it('breaks ties in form order 1, X, 2', () => {
    expect(analyse(1, [1, 1, 1]).recommendation).toBe('1');
  });
});

describe('top columns', () => {
  const top = topColumns(round, 50);
  it('returns exactly K distinct valid columns', () => {
    expect(top).toHaveLength(50);
    const s = new Set(top.map(columnString));
    expect(s.size).toBe(50);
    for (const c of s) expect(c).toMatch(/^[1X2]{16}$/);
  });
  it('is sorted by probability, best first, and starts with the all-favourites column', () => {
    for (let i = 1; i < top.length; i++) expect(top[i - 1].probability).toBeGreaterThanOrEqual(top[i].probability - 1e-15);
    expect(columnString(top[0])).toBe(round.map((p) => analyse(0, p).recommendation).join(''));
  });
  it('is exact: matches brute force on a small round', () => {
    const small: Probs[] = round.slice(0, 5);
    const all: { s: string; p: number }[] = [];
    const rec = (i: number, s: string, p: number) => {
      if (i === small.length) return void all.push({ s, p });
      const n = normalize(small[i]);
      ['1', 'X', '2'].forEach((o, j) => rec(i + 1, s + o, p * n[j]));
    };
    rec(0, '', 1);
    all.sort((a, b) => b.p - a.p);
    const got = topColumns(small, 20);
    got.forEach((c, i) => expect(c.probability).toBeCloseTo(all[i].p, 12));
  });
  it('is deterministic', () => {
    expect(topColumns(round, 20).map(columnString)).toEqual(topColumns(round, 20).map(columnString));
  });
});

describe('weekly fill (2 forms × 10 = 20 columns)', () => {
  const plans = fillPlans(round, 20);
  it('every plan has exactly 20 distinct columns', () => {
    for (const p of plans) {
      expect(p.columns).toHaveLength(20);
      expect(new Set(p.columns.map(columnString)).size).toBe(20);
    }
  });
  it('is sorted by chance of a 16/16 hit and the best plan beats any single column', () => {
    for (let i = 1; i < plans.length; i++) expect(plans[i - 1].hitProbability).toBeGreaterThanOrEqual(plans[i].hitProbability);
    expect(plans[0].hitProbability).toBeGreaterThan(topColumns(round, 1)[0].probability);
  });
  it('the "20 most likely columns" plan is the optimum for 20 distinct columns', () => {
    const optimum = topColumns(round, 20).reduce((a, c) => a + c.probability, 0);
    for (const p of plans) expect(p.hitProbability).toBeLessThanOrEqual(optimum + 1e-15);
    expect(plans.find((p) => p.id === 'singles')!.hitProbability).toBeCloseTo(optimum, 15);
  });
});

describe('bankers', () => {
  it('picks the most confident matches and multiplies their chances', () => {
    const a = round.map((p, i) => analyse(i + 1, p));
    const b = bankers(a, 5);
    expect(b.picks).toHaveLength(5);
    expect(b.picks[0].row).toBe(4);
    const product = b.picks.reduce((acc, x) => acc * x.probability, 1);
    expect(b.allHit).toBeCloseTo(product, 12);
    expect(b.allHit).toBeLessThan(b.picks[b.picks.length - 1].probability);
  });
});

describe('measurement', () => {
  it('RPS: perfect forecast is 0, worst is 1', () => {
    expect(rps([1, 0, 0], '1')).toBe(0);
    expect(rps([1, 0, 0], '2')).toBe(1);
    expect(rps([1 / 3, 1 / 3, 1 / 3], 'X')).toBeCloseTo(1 / 9, 12);
  });
  it('formats 1-in-N', () => {
    expect(oneIn(0.001)).toBe('1 ל-1,000');
    expect(oneIn(0)).toBe('—');
  });
});
