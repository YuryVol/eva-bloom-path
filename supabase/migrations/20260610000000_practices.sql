-- ============================================================
-- EVA: Practices catalog + completions + profile extensions
-- ============================================================

-- 1. practices -----------------------------------------------
create table if not exists public.practices (
  id            uuid primary key default gen_random_uuid(),
  sphere_id     text not null check (sphere_id in (
                  'family','relationships','career','growth',
                  'finance','rest','people','health')),
  type          text not null check (type in (
                  'stabilization','relaxation','harmonization')),
  name          text not null,
  description   text not null,
  mechanics     text not null,
  duration_min  integer not null,
  xp_reward     integer not null default 5,
  coins_reward  integer not null default 0,
  is_premium    boolean not null default false,
  component_key text not null unique,
  created_at    timestamptz not null default now()
);

alter table public.practices enable row level security;

-- All authenticated users can read practices
create policy "practices_read" on public.practices
  for select using (auth.role() = 'authenticated' or auth.role() = 'anon');

-- 2. practice_completions ------------------------------------
create table if not exists public.practice_completions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade,
  practice_id  uuid not null references public.practices on delete cascade,
  journey_id   uuid references public.journeys on delete set null,
  context      text not null default 'daily' check (context in ('journey','daily')),
  completed_at timestamptz not null default now(),
  skipped      boolean not null default false,
  notes        text
);

alter table public.practice_completions enable row level security;

create policy "completions_own" on public.practice_completions
  for all using (auth.uid() = user_id);

create index if not exists practice_completions_user_idx
  on public.practice_completions (user_id, completed_at desc);

create index if not exists practice_completions_practice_idx
  on public.practice_completions (practice_id);

-- 3. profiles extensions ------------------------------------
-- practice_streak already exists (added in gamification commit)
alter table public.profiles
  add column if not exists joy_archive  jsonb,
  add column if not exists body_map     jsonb;
