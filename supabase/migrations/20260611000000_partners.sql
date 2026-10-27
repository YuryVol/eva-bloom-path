-- Partners table
create table if not exists partners (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  base_url text not null,
  utm_campaign text not null default 'route_complete',
  is_active boolean not null default true,
  sphere_ids text[] not null default '{}',
  trigger_condition jsonb not null default '{}',
  eva_phrase text not null default '',
  cta_text text not null default '',
  is_free boolean not null default false,
  created_at timestamptz not null default now()
);

-- Partner analytics events
create table if not exists partner_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade,
  partner_slug text not null,
  sphere_id text not null,
  event_type text not null check (event_type in ('shown', 'clicked', 'dismissed')),
  journey_id uuid,
  coins_balance integer not null default 0,
  created_at timestamptz not null default now()
);

-- Extend journeys with partner tracking
alter table journeys
  add column if not exists partner_shown boolean not null default false,
  add column if not exists partner_clicked boolean not null default false;

-- RLS
alter table partners enable row level security;
alter table partner_events enable row level security;

-- Partners are public (read-only for authenticated users)
create policy "partners_read" on partners for select to authenticated using (true);

-- Users can only insert/read their own events
create policy "partner_events_insert" on partner_events for insert to authenticated
  with check (auth.uid() = user_id);
create policy "partner_events_read" on partner_events for select to authenticated
  using (auth.uid() = user_id);

-- Index for cooldown queries
create index if not exists partner_events_user_slug_idx
  on partner_events (user_id, partner_slug, created_at desc);
