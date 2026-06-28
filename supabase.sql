-- ============================================================
-- Supply Generation Dashboard — esquema de base de datos
-- Pegá TODO este archivo en el SQL Editor de Supabase y ejecutá.
-- Es idempotente: se puede correr más de una vez sin romper nada.
-- ============================================================

-- Extensión para generar UUIDs.
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Tabla: weeks (la unidad central del tablero)
-- ------------------------------------------------------------
create table if not exists public.weeks (
  id          uuid primary key default gen_random_uuid(),
  week_start  date not null unique,            -- lunes de la semana
  insights    text default '',
  flag_note   text,                            -- si tiene texto, la semana queda "marcada" en el gráfico
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tabla: opportunities (búsquedas mostradas en la semana)
-- ------------------------------------------------------------
create table if not exists public.opportunities (
  id           uuid primary key default gen_random_uuid(),
  week_id      uuid not null references public.weeks(id) on delete cascade,
  role         text not null,
  company      text not null,
  seniority    text not null default 'Semi-Senior'
               check (seniority in ('Junior', 'Semi-Senior', 'Senior')),
  applications integer not null default 0 check (applications >= 0),
  presented    integer not null default 0 check (presented >= 0),
  confirmed    integer not null default 0 check (confirmed >= 0),
  date         date,
  created_at   timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tabla: contents (piezas publicadas en la semana)
-- ------------------------------------------------------------
create table if not exists public.contents (
  id          uuid primary key default gen_random_uuid(),
  week_id     uuid not null references public.weeks(id) on delete cascade,
  channel     text not null default 'LinkedIn'
              check (channel in ('LinkedIn', 'Instagram', 'TikTok', 'Todas las redes')),
  title       text not null,
  views       integer not null default 0 check (views >= 0),
  url         text,
  created_at  timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Tabla: content_opportunities (vínculo muchos-a-muchos)
-- ------------------------------------------------------------
create table if not exists public.content_opportunities (
  content_id     uuid not null references public.contents(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  primary key (content_id, opportunity_id)
);

-- ------------------------------------------------------------
-- Índices
-- ------------------------------------------------------------
create index if not exists idx_opportunities_week on public.opportunities(week_id);
create index if not exists idx_contents_week       on public.contents(week_id);
create index if not exists idx_link_content        on public.content_opportunities(content_id);
create index if not exists idx_link_opportunity    on public.content_opportunities(opportunity_id);
create index if not exists idx_weeks_week_start     on public.weeks(week_start desc);

-- ============================================================
-- Row Level Security: políticas "allow all"
-- (Es una herramienta interna y pública: la anon key puede leer y escribir.)
-- ============================================================
alter table public.weeks                 enable row level security;
alter table public.opportunities         enable row level security;
alter table public.contents              enable row level security;
alter table public.content_opportunities enable row level security;

-- weeks
drop policy if exists "allow all weeks" on public.weeks;
create policy "allow all weeks" on public.weeks
  for all using (true) with check (true);

-- opportunities
drop policy if exists "allow all opportunities" on public.opportunities;
create policy "allow all opportunities" on public.opportunities
  for all using (true) with check (true);

-- contents
drop policy if exists "allow all contents" on public.contents;
create policy "allow all contents" on public.contents
  for all using (true) with check (true);

-- content_opportunities
drop policy if exists "allow all content_opportunities" on public.content_opportunities;
create policy "allow all content_opportunities" on public.content_opportunities
  for all using (true) with check (true);

-- ============================================================
-- (Opcional) Datos de ejemplo para ver el tablero con algo cargado.
-- Descomentá el bloque de abajo si querés sembrar una semana de prueba.
-- ============================================================
-- do $$
-- declare
--   w_id uuid;
--   o_id uuid;
--   c_id uuid;
-- begin
--   insert into public.weeks (week_start, insights)
--   values (date_trunc('week', current_date)::date,
--           'Semana de prueba: buen volumen de postulaciones en Data.')
--   returning id into w_id;
--
--   insert into public.opportunities (week_id, role, company, seniority, applications, presented, confirmed)
--   values (w_id, 'Data Engineer', 'Acme', 'Senior', 40, 6, 2)
--   returning id into o_id;
--
--   insert into public.contents (week_id, channel, title, views, url)
--   values (w_id, 'LinkedIn', 'Reel: skills clave en Data', 5200, null)
--   returning id into c_id;
--
--   insert into public.content_opportunities (content_id, opportunity_id)
--   values (c_id, o_id);
-- end $$;
