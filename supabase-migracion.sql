-- ============================================================
-- MIGRACIÓN: del modelo por semana al modelo por OPORTUNIDAD.
-- Corré esto UNA vez en el SQL Editor de Supabase si ya tenías datos cargados.
-- No borra nada: solo ajusta columnas y crea la tabla 'months'.
-- ============================================================

-- 1) Fecha de la oportunidad: que tenga default y se complete desde su semana.
alter table public.opportunities alter column date set default current_date;

update public.opportunities o
  set date = w.week_start
  from public.weeks w
  where o.week_id = w.id and o.date is null;

update public.opportunities set date = current_date where date is null;
alter table public.opportunities alter column date set not null;

-- 2) Las semanas ya no son obligatorias (dejamos de usarlas).
alter table public.opportunities alter column week_id drop not null;
alter table public.contents       alter column week_id drop not null;

-- 3) role / company pueden quedar vacíos al crear una oportunidad nueva.
alter table public.opportunities alter column role    set default '';
alter table public.opportunities alter column company set default '';
alter table public.contents      alter column title   set default '';

-- 4) Índice por fecha (para listar las más recientes primero).
create index if not exists idx_opportunities_date on public.opportunities(date desc);

-- 5) Tabla de totales mensuales de presentados (carga manual).
create table if not exists public.months (
  month           text primary key,        -- 'YYYY-MM'
  total_presented integer not null default 0 check (total_presented >= 0),
  created_at      timestamptz not null default now()
);
alter table public.months enable row level security;
drop policy if exists "allow all months" on public.months;
create policy "allow all months" on public.months for all using (true) with check (true);

-- Nota: las columnas viejas (weeks, profiles_for_base, week_id) quedan sin uso.
-- No hace falta borrarlas; el tablero ya no las lee.
