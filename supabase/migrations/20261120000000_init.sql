-- BM Winners – initial schema
-- Built from the work plan (spec + status doc, 13.11.2026):
--   * three data layers: fixed (people/clubs facts), changing (memberships, availability), change log
--   * rounds / matches / official results / prize tiers (winner.co.il is the source of truth)
--   * predictions per layer (market, model, lineup, spiritual, combined) frozen before kickoff
--   * parameter registry + source reliability (learning mechanism)
--   * spiritual rule set v1, decisions, plan documents
-- Single-owner app: every table is protected by RLS and readable/writable only by the owner.

create extension if not exists pgcrypto;

-- ───────────────────────── owner / access ─────────────────────────
create table public.app_owner (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.app_owner where user_id = auth.uid());
$$;

revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to authenticated;

-- ───────────────────────── enums ─────────────────────────
create type public.membership_role as enum ('player', 'goalkeeper', 'coach', 'owner');
create type public.outcome as enum ('1', 'X', '2');
create type public.match_status as enum ('scheduled', 'played', 'cancelled', 'postponed');
create type public.prediction_layer as enum ('market', 'model', 'lineup', 'spiritual', 'combined');
create type public.param_state as enum ('active', 'shadow', 'retired');
create type public.source_tier as enum ('official', 'professional', 'derived', 'market', 'press', 'index', 'computed');
create type public.verification as enum ('unverified', 'single_source', 'verified');

-- ───────────────────────── fixed layer ─────────────────────────
create table public.leagues (
  code text primary key,                -- e.g. 'IL1', 'IL2', 'EPL'
  name_he text not null,                -- as written on winner.co.il, e.g. 'ליגת Winner'
  country text not null,
  official_url text
);

create table public.clubs (
  id uuid primary key default gen_random_uuid(),
  league_code text references public.leagues (code),
  name_he text not null,                -- canonical: as on the Winner form
  name_en text,
  founded_date date,                    -- original official founding date (rule set v1)
  founded_alt jsonb not null default '[]'::jsonb, -- other candidate dates (merger, rename) with sources
  founded_verification public.verification not null default 'unverified',
  city text,
  stadium_name text,
  stadium_lat double precision,
  stadium_lng double precision,
  official_url text,
  created_at timestamptz not null default now(),
  unique (name_he, league_code)
);

create table public.people (
  id uuid primary key default gen_random_uuid(),
  full_name_he text not null,
  full_name_en text,
  birth_date date,
  birth_place text,
  birth_time time,                      -- almost always NULL; never defaulted to noon
  birth_verification public.verification not null default 'unverified',
  created_at timestamptz not null default now()
);

-- every fact keeps its sources; "verified" = two independent sources, at least one official
create table public.fact_sources (
  id bigint generated always as identity primary key,
  entity text not null check (entity in ('person', 'club')),
  entity_id uuid not null,
  field text not null,                  -- e.g. 'birth_date', 'founded_date'
  value text not null,
  source_url text not null,
  tier public.source_tier not null,
  checked_at timestamptz not null default now()
);
create index on public.fact_sources (entity, entity_id, field);

-- ───────────────────────── changing layer ─────────────────────────
create table public.memberships (
  id bigint generated always as identity primary key,
  person_id uuid not null references public.people (id) on delete cascade,
  club_id uuid not null references public.clubs (id) on delete cascade,
  role public.membership_role not null,
  position text,
  valid_from date not null,
  valid_to date,                        -- NULL = current
  source_url text
);
create index on public.memberships (club_id) where valid_to is null;

create table public.availability (
  id bigint generated always as identity primary key,
  person_id uuid not null references public.people (id) on delete cascade,
  status text not null check (status in ('available', 'injured', 'suspended', 'doubtful')),
  from_date date not null,
  until_date date,
  note text,
  source_url text
);

create table public.fan_metrics (
  club_id uuid references public.clubs (id) on delete cascade,
  season text not null,
  avg_attendance integer,
  capacity integer,
  source_url text,
  primary key (club_id, season)
);

-- change log: every update to the changing layer is recorded with effective date and source
create table public.change_log (
  id bigint generated always as identity primary key,
  entity text not null,
  entity_id text not null,
  field text not null,
  old_value text,
  new_value text,
  source_url text,
  effective_at date,
  logged_at timestamptz not null default now()
);

-- ───────────────────────── rounds & matches ─────────────────────────
create table public.rounds (
  id bigint primary key,                -- Winner round number, e.g. 264401
  game text not null default 'winner16',
  draw_date date not null,
  closing_at timestamptz,
  first_prize numeric,
  status text not null default 'open' check (status in ('open', 'closed', 'verified')),
  source_url text,
  created_at timestamptz not null default now()
);

create table public.round_matches (
  round_id bigint not null references public.rounds (id) on delete cascade,
  row_no smallint not null check (row_no between 1 and 16),
  form_home text not null,              -- names exactly as on the form
  form_away text not null,
  league_label text not null,
  home_club_id uuid references public.clubs (id),
  away_club_id uuid references public.clubs (id),
  host_club_id uuid references public.clubs (id), -- actual host from the league fixture (regulations §4)
  kickoff_at timestamptz,
  status public.match_status not null default 'scheduled',
  result public.outcome,
  score_home smallint,
  score_away smallint,
  primary key (round_id, row_no)
);

create table public.prize_tiers (
  round_id bigint not null references public.rounds (id) on delete cascade,
  hits smallint not null check (hits between 12 and 16),
  winners integer,
  amount numeric,
  total numeric,
  primary key (round_id, hits)
);

-- ───────────────────────── predictions ─────────────────────────
create table public.rule_sets (
  version text primary key,             -- 'v1'
  zodiac text not null,
  house_system text not null,
  orb_aspect numeric not null,
  orb_transit numeric not null,
  sefer_yetzirah text not null,
  letter_planet jsonb not null,
  club_birth_rule text not null,
  gematria_rule text not null,
  weights jsonb not null,
  spiritual_lambda numeric not null default 0,
  locked_at timestamptz not null default now()
);

create table public.predictions (
  id bigint generated always as identity primary key,
  round_id bigint not null,
  row_no smallint not null,
  layer public.prediction_layer not null,
  p1 numeric not null check (p1 between 0 and 1),
  px numeric not null check (px between 0 and 1),
  p2 numeric not null check (p2 between 0 and 1),
  lean numeric,                         -- spiritual lean −1..+1 (spiritual layer)
  draw_lean numeric,
  rule_set text references public.rule_sets (version),
  is_demo boolean not null default false,
  created_at timestamptz not null default now(),
  frozen_at timestamptz,                -- set when locked before kickoff; never edited afterwards
  foreign key (round_id, row_no) references public.round_matches (round_id, row_no) on delete cascade
);
create index on public.predictions (round_id, layer);

create table public.spiritual_components (
  prediction_id bigint not null references public.predictions (id) on delete cascade,
  component text not null check (component in ('R1', 'R2', 'R3', 'R4', 'R5')),
  side text check (side in ('home', 'away', 'match')),
  value jsonb not null,
  primary key (prediction_id, component, side)
);

create table public.column_sets (
  round_id bigint not null references public.rounds (id) on delete cascade,
  kind text not null check (kind in ('fill', 'alternative')),
  rank smallint not null,
  form text check (form in ('A', 'B')),
  marks text not null check (marks ~ '^[1X2]{16}$'),
  probability numeric,
  frozen_at timestamptz,
  primary key (round_id, kind, rank)
);

create table public.bankers (
  id bigint generated always as identity primary key,
  round_id bigint not null references public.rounds (id) on delete cascade,
  match_label text not null,
  league_label text,
  pick public.outcome not null,
  probability numeric not null,
  winner_line_odds numeric,
  result public.outcome,
  frozen_at timestamptz
);

-- ───────────────────────── learning ─────────────────────────
create table public.params (
  id text primary key,
  name_he text not null,
  layer text not null check (layer in ('realistic', 'spiritual')),
  state public.param_state not null default 'shadow',
  weight numeric not null default 0,
  version text not null default 'v1',
  measured_matches integer not null default 0,
  rps_delta numeric,
  notes text
);

create table public.param_history (
  id bigint generated always as identity primary key,
  param_id text not null references public.params (id) on delete cascade,
  weight numeric not null,
  state public.param_state not null,
  reason text not null,
  changed_at timestamptz not null default now()
);

create table public.sources (
  id text primary key,
  name text not null,
  tier public.source_tier not null,
  used_for text not null,
  url text,
  checks integer not null default 0,
  errors integer not null default 0,
  status text not null default 'active' check (status in ('active', 'downgraded', 'retired'))
);

create table public.round_metrics (
  round_id bigint not null references public.rounds (id) on delete cascade,
  layer text not null,
  rps numeric,
  log_score numeric,
  hits smallint,
  best_column_hits smallint,
  computed_at timestamptz not null default now(),
  primary key (round_id, layer)
);

-- ───────────────────────── plan & decisions ─────────────────────────
create table public.decisions (
  id text primary key,
  topic text not null,
  decision text not null,
  rationale text,
  decided_at date not null
);

create table public.plan_docs (
  slug text primary key,
  title text not null,
  body_md text not null,
  source_url text,
  updated_at timestamptz not null default now()
);

-- ───────────────────────── RLS: owner only ─────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'leagues','clubs','people','fact_sources','memberships','availability','fan_metrics','change_log',
    'rounds','round_matches','prize_tiers','rule_sets','predictions','spiritual_components','column_sets',
    'bankers','params','param_history','sources','round_metrics','decisions','plan_docs'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon', t);
    if t = 'change_log' then
      -- append-only: the app may read and add, never rewrite history
      execute format('create policy owner_read on public.%I for select to authenticated using ((select public.is_owner()))', t);
      execute format('create policy owner_insert on public.%I for insert to authenticated with check ((select public.is_owner()))', t);
    else
      execute format('create policy owner_all on public.%I for all to authenticated using ((select public.is_owner())) with check ((select public.is_owner()))', t);
    end if;
  end loop;
end $$;

revoke all on table public.app_owner from anon;

alter table public.app_owner enable row level security;
create policy owner_self_read on public.app_owner for select to authenticated using (user_id = (select auth.uid()));

-- first sign-in claims ownership once (sign-ups are disabled and the login is allow-listed,
-- so the only account that can ever reach this is the owner's)
create or replace function public.claim_ownership()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return false;
  end if;
  if not exists (select 1 from public.app_owner) then
    insert into public.app_owner (user_id) values (auth.uid());
  end if;
  return exists (select 1 from public.app_owner where user_id = auth.uid());
end $$;

revoke all on function public.claim_ownership() from public;
grant execute on function public.claim_ownership() to authenticated;

-- frozen predictions may not be edited (learning integrity: no hindsight)
create or replace function public.block_frozen_edits()
returns trigger language plpgsql as $$
begin
  if old.frozen_at is not null then
    raise exception 'frozen rows cannot be changed';
  end if;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end $$;

create trigger predictions_frozen before update or delete on public.predictions
  for each row execute function public.block_frozen_edits();
create trigger column_sets_frozen before update or delete on public.column_sets
  for each row execute function public.block_frozen_edits();
