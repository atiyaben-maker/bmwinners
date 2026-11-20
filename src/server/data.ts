import 'server-only';
import { cache } from 'react';
import type { Outcome, Probs } from '@/lib/engine';
import {
  DEMO_DECISIONS,
  DEMO_PARAMS,
  DEMO_PREVIOUS,
  DEMO_PRIZES,
  DEMO_ROUND,
  DEMO_RULESET,
  DEMO_SOURCES,
} from '@/lib/demo';
import { createClient } from '@/lib/supabase/server';
import type {
  DecisionView,
  MatchView,
  MetricView,
  ParamView,
  PrizeTier,
  RoundView,
  RuleSetView,
  SourceView,
} from '@/lib/types';
import { requireViewer } from './auth';

// Data Access Layer. Every function re-checks the viewer; RLS enforces the owner in the DB.
// Reads stay dynamic (per request) – a private single-user app must never share caches.

type Row = Record<string, unknown>;
const num = (v: unknown) => (v == null ? null : Number(v));

async function db() {
  const viewer = await requireViewer();
  return viewer.mode === 'live' ? await createClient() : null;
}

function toMatch(m: Row, preds: Row[]): MatchView {
  const mine = preds.filter((p) => p.row_no === m.row_no);
  const c = mine.find((p) => p.layer === 'combined');
  const s = mine.find((p) => p.layer === 'spiritual');
  return {
    row: Number(m.row_no),
    home: String(m.form_home),
    away: String(m.form_away),
    league: String(m.league_label),
    kickoffAt: (m.kickoff_at as string) ?? null,
    status: m.status as MatchView['status'],
    result: (m.result as Outcome) ?? null,
    scoreHome: num(m.score_home),
    scoreAway: num(m.score_away),
    combined: c ? ([Number(c.p1), Number(c.px), Number(c.p2)] as Probs) : null,
    spiritual: s
      ? {
          probs: [Number(s.p1), Number(s.px), Number(s.p2)] as Probs,
          lean: Number(s.lean ?? 0),
          drawLean: Number(s.draw_lean ?? 0),
          ruleSet: String(s.rule_set ?? 'v1'),
        }
      : null,
  };
}

async function loadRound(id?: number, offset = 0): Promise<RoundView | null> {
  const supabase = await db();
  if (!supabase) return offset === 0 ? DEMO_ROUND : DEMO_PREVIOUS;
  let q = supabase.from('rounds').select('*').order('id', { ascending: false });
  q = id ? q.eq('id', id) : q.range(offset, offset);
  const { data: rounds, error } = await q;
  if (error) throw new Error(`rounds: ${error.message}`);
  const r = rounds?.[0];
  if (!r) return null;
  const [{ data: matches, error: e1 }, { data: preds, error: e2 }] = await Promise.all([
    supabase.from('round_matches').select('*').eq('round_id', r.id).order('row_no'),
    supabase
      .from('predictions')
      .select('row_no, layer, p1, px, p2, lean, draw_lean, rule_set, is_demo, created_at')
      .eq('round_id', r.id)
      .in('layer', ['combined', 'spiritual']),
  ]);
  if (e1) throw new Error(`round_matches: ${e1.message}`);
  if (e2) throw new Error(`predictions: ${e2.message}`);
  const p = (preds ?? []) as Row[];
  const latest = p.map((x) => String(x.created_at)).sort().at(-1) ?? null;
  return {
    id: Number(r.id),
    drawDate: r.draw_date,
    closingAt: r.closing_at,
    firstPrize: num(r.first_prize),
    status: r.status,
    sourceUrl: r.source_url,
    isDemo: p.some((x) => x.is_demo === true),
    predictionsAt: latest,
    matches: ((matches ?? []) as Row[]).map((m) => toMatch(m, p)),
  };
}

export const getCurrentRound = cache(() => loadRound(undefined, 0));
export const getPreviousRound = cache(() => loadRound(undefined, 1));

export const getPrizes = cache(async (roundId: number): Promise<PrizeTier[]> => {
  const supabase = await db();
  if (!supabase) return roundId === DEMO_PREVIOUS.id ? DEMO_PRIZES : [];
  const { data, error } = await supabase
    .from('prize_tiers')
    .select('hits, winners, amount')
    .eq('round_id', roundId)
    .order('hits', { ascending: false });
  if (error) throw new Error(`prize_tiers: ${error.message}`);
  return (data ?? []).map((t) => ({ hits: t.hits, winners: num(t.winners), amount: num(t.amount) }));
});

export const getParams = cache(async (): Promise<ParamView[]> => {
  const supabase = await db();
  if (!supabase) return DEMO_PARAMS;
  const { data, error } = await supabase.from('params').select('*').order('layer').order('weight', { ascending: false });
  if (error) throw new Error(`params: ${error.message}`);
  return (data ?? []).map((p) => ({
    id: p.id,
    name: p.name_he,
    layer: p.layer,
    state: p.state,
    weight: Number(p.weight),
    notes: p.notes,
  }));
});

export const getSources = cache(async (): Promise<SourceView[]> => {
  const supabase = await db();
  if (!supabase) return DEMO_SOURCES;
  const { data, error } = await supabase.from('sources').select('*');
  if (error) throw new Error(`sources: ${error.message}`);
  return (data ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    tier: s.tier,
    usedFor: s.used_for,
    url: s.url,
    sample: s.checks,
    reliability: s.checks > 0 ? 1 - s.errors / s.checks : null,
  }));
});

export const getDecisions = cache(async (): Promise<DecisionView[]> => {
  const supabase = await db();
  if (!supabase) return DEMO_DECISIONS;
  const { data, error } = await supabase.from('decisions').select('*').order('decided_at');
  if (error) throw new Error(`decisions: ${error.message}`);
  return (data ?? []).map((d) => ({
    id: d.id,
    topic: d.topic,
    decision: d.decision,
    rationale: d.rationale,
    decidedAt: d.decided_at,
  }));
});

export const getRuleSet = cache(async (): Promise<RuleSetView> => {
  const supabase = await db();
  if (!supabase) return DEMO_RULESET;
  const { data, error } = await supabase.from('rule_sets').select('*').order('locked_at', { ascending: false }).limit(1);
  if (error) throw new Error(`rule_sets: ${error.message}`);
  const r = data?.[0];
  if (!r) return DEMO_RULESET;
  return {
    version: r.version,
    zodiac: r.zodiac,
    houseSystem: r.house_system,
    orbAspect: Number(r.orb_aspect),
    orbTransit: Number(r.orb_transit),
    seferYetzirah: r.sefer_yetzirah,
    letterPlanet: r.letter_planet,
    weights: r.weights,
    spiritualLambda: Number(r.spiritual_lambda),
  };
});

export const getMetrics = cache(async (): Promise<MetricView[]> => {
  const supabase = await db();
  if (!supabase) return [];
  const { data, error } = await supabase.from('round_metrics').select('round_id, layer, rps, hits').order('round_id');
  if (error) throw new Error(`round_metrics: ${error.message}`);
  return (data ?? []).map((m) => ({ roundId: m.round_id, layer: m.layer, rps: num(m.rps), hits: num(m.hits) }));
});
