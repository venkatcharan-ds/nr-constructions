-- ── NR Constructions — Initial Schema ────────────────────────────────────────
-- Run against your Supabase project via:
--   supabase db push
-- or paste directly into the Supabase SQL editor.
-- ─────────────────────────────────────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ── Enums ─────────────────────────────────────────────────────────────────────

create type lead_source as enum ('website', 'whatsapp', 'phone', 'referral', 'other');
create type lead_status as enum ('new', 'contacted', 'visited', 'negotiating', 'closed', 'lost');
create type unit_config as enum ('2BHK');
create type project_status as enum ('active', 'sold_out', 'coming_soon');
create type device_type as enum ('mobile', 'tablet', 'desktop');

-- ── projects ──────────────────────────────────────────────────────────────────

create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  tagline     text,
  locality    text not null,
  district    text not null,
  state       text not null default 'Goa',
  pincode     text not null,
  status      project_status not null default 'active',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table projects is 'Real estate projects by NR Constructions.';

-- ── units ─────────────────────────────────────────────────────────────────────

create table if not exists units (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references projects(id) on delete cascade,
  unit_type        text not null,           -- 'Type A', 'Type B'
  config           unit_config not null,
  carpet_area_sqm  numeric(6,2) not null,
  carpet_area_sqft numeric(8,2) not null,
  price_inr        bigint not null,
  floor            smallint,
  is_available     boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index on units(project_id);
comment on table units is 'Individual apartment units within a project.';

-- ── leads ─────────────────────────────────────────────────────────────────────

create table if not exists leads (
  id            uuid primary key default gen_random_uuid(),
  -- Contact
  name          text not null,
  phone         text not null,
  email         text,
  message       text,
  -- Attribution
  source        lead_source not null default 'website',
  page_url      text,
  referrer      text,
  utm_source    text,
  utm_medium    text,
  utm_campaign  text,
  utm_term      text,
  utm_content   text,
  -- Device
  user_agent    text,
  device_type   device_type,
  -- Status
  status        lead_status not null default 'new',
  project_id    uuid references projects(id) on delete set null,
  -- Timestamps
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index on leads(created_at desc);
create index on leads(phone);
create index on leads(status);
create index on leads(project_id);
comment on table leads is 'Enquiry leads captured from the marketing website.';

-- ── site_visits ───────────────────────────────────────────────────────────────

create table if not exists site_visits (
  id             uuid primary key default gen_random_uuid(),
  lead_id        uuid references leads(id) on delete set null,
  -- Contact (denormalised for speed)
  name           text not null,
  phone          text not null,
  email          text,
  message        text,
  preferred_date date,
  -- Attribution
  source         lead_source not null default 'website',
  page_url       text,
  referrer       text,
  utm_source     text,
  utm_medium     text,
  utm_campaign   text,
  utm_term       text,
  utm_content    text,
  -- Device
  user_agent     text,
  device_type    device_type,
  -- Status
  is_confirmed   boolean not null default false,
  project_id     uuid references projects(id) on delete set null,
  -- Timestamps
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index on site_visits(created_at desc);
create index on site_visits(phone);
create index on site_visits(lead_id);
create index on site_visits(project_id);
comment on table site_visits is 'Site visit bookings. Each booking may link to a lead.';

-- ── updated_at trigger ────────────────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_updated_at  before update on projects    for each row execute function set_updated_at();
create trigger units_updated_at     before update on units       for each row execute function set_updated_at();
create trigger leads_updated_at     before update on leads       for each row execute function set_updated_at();
create trigger visits_updated_at    before update on site_visits for each row execute function set_updated_at();

-- ── Row Level Security ────────────────────────────────────────────────────────

alter table projects    enable row level security;
alter table units       enable row level security;
alter table leads       enable row level security;
alter table site_visits enable row level security;

-- projects: public read
create policy "projects_public_read"
  on projects for select to anon, authenticated
  using (true);

-- units: public read of available units only
create policy "units_public_read"
  on units for select to anon, authenticated
  using (is_available = true);

-- leads: anonymous users can insert their own lead
create policy "leads_anon_insert"
  on leads for insert to anon
  with check (true);

-- leads: authenticated (service role bypasses RLS) can read/update
create policy "leads_authenticated_all"
  on leads for all to authenticated
  using (true) with check (true);

-- site_visits: anonymous users can insert
create policy "visits_anon_insert"
  on site_visits for insert to anon
  with check (true);

-- site_visits: authenticated can read/update
create policy "visits_authenticated_all"
  on site_visits for all to authenticated
  using (true) with check (true);

-- ── Seed: Roshan Apartments project ──────────────────────────────────────────

insert into projects (slug, name, tagline, locality, district, state, pincode, status)
values (
  'roshan-apartments',
  'Roshan Apartments',
  'G+4 ready-to-move 2 BHK in Corlim, North Goa',
  'Corlim',
  'North Goa',
  'Goa',
  '403110',
  'active'
)
on conflict (slug) do nothing;

-- Seed units (linked via subquery so slug is the stable reference)
insert into units (project_id, unit_type, config, carpet_area_sqm, carpet_area_sqft, price_inr, is_available)
select
  p.id,
  u.unit_type,
  u.config::unit_config,
  u.carpet_area_sqm,
  u.carpet_area_sqft,
  u.price_inr,
  true
from projects p,
(values
  ('Type A', '2BHK', 102, 1098, 6100000),
  ('Type B', '2BHK', 103, 1109, 6300000)
) as u(unit_type, config, carpet_area_sqm, carpet_area_sqft, price_inr)
where p.slug = 'roshan-apartments'
on conflict do nothing;
