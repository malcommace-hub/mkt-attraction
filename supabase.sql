-- ============================================================
-- Supply Generation Dashboard — esquema (modelo por OPORTUNIDAD)
-- Para una base NUEVA: pegá todo y ejecutá.
-- Si ya tenías datos del modelo anterior (por semana), usá en su lugar el
-- script de MIGRACIÓN que te pasó el asistente.
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- opportunities (la unidad central)
-- ------------------------------------------------------------
create table if not exists public.opportunities (
  id           uuid primary key default gen_random_uuid(),
  role         text not null default '',
  company      text not null default '',
  seniority    text not null default 'Semi-Senior'
               check (seniority in ('Junior', 'Semi-Senior', 'Senior')),
  date         date not null default current_date,  -- fecha de carga de la oportunidad
  applications integer not null default 0 check (applications >= 0),
  presented    integer not null default 0 check (presented >= 0),
  confirmed    integer not null default 0 check (confirmed >= 0),
  note         text,
  created_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- contents (piezas; se asignan a oportunidades)
-- ------------------------------------------------------------
create table if not exists public.contents (
  id          uuid primary key default gen_random_uuid(),
  channel     text not null default 'LinkedIn'
              check (channel in ('LinkedIn', 'Instagram', 'TikTok', 'Todas las redes')),
  title       text not null default '',
  views       integer not null default 0 check (views >= 0),
  url         text,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- content_opportunities (vínculo muchos-a-muchos)
-- ------------------------------------------------------------
create table if not exists public.content_opportunities (
  content_id     uuid not null references public.contents(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  primary key (content_id, opportunity_id)
);

-- ------------------------------------------------------------
-- months (total mensual de presentados — todas las fuentes, carga manual)
-- ------------------------------------------------------------
create table if not exists public.months (
  month           text primary key,        -- 'YYYY-MM'
  total_presented integer not null default 0 check (total_presented >= 0),
  created_at      timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Índices
-- ------------------------------------------------------------
create index if not exists idx_opportunities_date on public.opportunities(date desc);
create index if not exists idx_link_content        on public.content_opportunities(content_id);
create index if not exists idx_link_opportunity    on public.content_opportunities(opportunity_id);

-- ============================================================
-- Row Level Security: políticas "allow all" (herramienta interna y pública)
-- ============================================================
alter table public.opportunities         enable row level security;
alter table public.contents              enable row level security;
alter table public.content_opportunities enable row level security;
alter table public.months                enable row level security;

drop policy if exists "allow all opportunities" on public.opportunities;
create policy "allow all opportunities" on public.opportunities for all using (true) with check (true);

drop policy if exists "allow all contents" on public.contents;
create policy "allow all contents" on public.contents for all using (true) with check (true);

drop policy if exists "allow all content_opportunities" on public.content_opportunities;
create policy "allow all content_opportunities" on public.content_opportunities for all using (true) with check (true);

drop policy if exists "allow all months" on public.months;
create policy "allow all months" on public.months for all using (true) with check (true);
