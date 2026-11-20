import type { Outcome, Probs } from './engine';

export interface SpiritualView {
  probs: Probs;
  lean: number; // −1 (away) … +1 (home)
  drawLean: number; // 0 … 1
  ruleSet: string;
}

export interface MatchView {
  row: number;
  home: string;
  away: string;
  league: string;
  kickoffAt: string | null;
  status: 'scheduled' | 'played' | 'cancelled' | 'postponed';
  result: Outcome | null;
  scoreHome: number | null;
  scoreAway: number | null;
  combined: Probs | null;
  spiritual: SpiritualView | null;
}

export interface RoundView {
  id: number;
  drawDate: string;
  closingAt: string | null;
  firstPrize: number | null;
  status: 'open' | 'closed' | 'verified';
  sourceUrl: string | null;
  isDemo: boolean;
  predictionsAt: string | null;
  matches: MatchView[];
}

export interface PrizeTier {
  hits: number;
  winners: number | null;
  amount: number | null;
}

export interface ParamView {
  id: string;
  name: string;
  layer: 'realistic' | 'spiritual';
  state: 'active' | 'shadow' | 'retired';
  weight: number;
  notes: string | null;
}

export interface SourceView {
  id: string;
  name: string;
  tier: string;
  usedFor: string | null;
  url: string | null;
  reliability: number | null;
  sample: number | null;
}

export interface DecisionView {
  id: string;
  topic: string;
  decision: string;
  rationale: string | null;
  decidedAt: string;
}

export interface RuleSetView {
  version: string;
  zodiac: string;
  houseSystem: string;
  orbAspect: number;
  orbTransit: number;
  seferYetzirah: string;
  letterPlanet: Record<string, string>;
  weights: Record<string, number>;
  spiritualLambda: number;
}

export interface MetricView {
  roundId: number;
  layer: string;
  rps: number | null;
  hits: number | null;
}

export type DataMode = 'demo' | 'live';
