"use client";

import { useEffect, useMemo, useState } from "react";
import { ConfigWarning } from "@/components/ConfigWarning";
import { MonthlyGoalSection } from "@/components/MonthlyGoalSection";
import { OpportunityCard } from "@/components/OpportunityCard";
import { Button } from "@/components/forms/inputs";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchDashboard, insertOpportunity, friendlyError, type DashboardData } from "@/lib/data";
import { toISODate } from "@/lib/week";
import { monthKey, monthLabel } from "@/lib/goals";
import { fmt } from "@/lib/format";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [query, setQuery] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");

  async function reload() {
    const d = await fetchDashboard();
    setData(d);
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchDashboard()
      .then(setData)
      .catch((e) => {
        console.error("fetchDashboard", e);
        setError(friendlyError(e));
      });
  }, []);

  async function handleCreate() {
    setCreating(true);
    try {
      await insertOpportunity({
        role: "",
        company: "",
        seniority: "Semi-Senior",
        date: toISODate(new Date()),
        applications: 0,
        presented: 0,
        confirmed: 0,
        note: null,
      });
      await reload();
      setQuery("");
      setMonthFilter("all");
    } catch (e) {
      console.error("insertOpportunity", e);
      setError(friendlyError(e));
    } finally {
      setCreating(false);
    }
  }

  const totals = useMemo(() => {
    if (!data) return null;
    return {
      videos: data.allContents.length,
      views: data.allContents.reduce((a, c) => a + (c.views || 0), 0),
      applications: data.opportunities.reduce((a, o) => a + (o.applications || 0), 0),
      presented: data.opportunities.reduce((a, o) => a + (o.presented || 0), 0),
      confirmed: data.opportunities.reduce((a, o) => a + (o.confirmed || 0), 0),
    };
  }, [data]);

  // Opciones de mes (de las oportunidades existentes), más reciente primero.
  const monthOptions = useMemo(() => {
    if (!data) return [];
    const keys = Array.from(new Set(data.opportunities.map((o) => monthKey(o.date))));
    return keys.sort().reverse();
  }, [data]);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.opportunities.filter((o) => {
      const matchesText =
        q === "" ||
        o.role.toLowerCase().includes(q) ||
        o.company.toLowerCase().includes(q);
      const matchesMonth = monthFilter === "all" || monthKey(o.date) === monthFilter;
      return matchesText && matchesMonth;
    });
  }, [data, query, monthFilter]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="mb-6 flex items-center gap-3">
        <BrandLogo />
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Supply Generation
          </h1>
          <p className="text-sm text-slate-500">
            Talento calificado generado desde el career site · Seeds
          </p>
        </div>
      </header>

      {!isSupabaseConfigured ? (
        <ConfigWarning />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : !data || !totals ? (
        <div className="space-y-4">
          <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
          <div className="grid gap-3 md:grid-cols-2">
            <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Totales acumulados */}
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatCard label="Contenidos" value={totals.videos} />
            <StatCard label="Views" value={totals.views} />
            <StatCard label="Postulaciones" value={totals.applications} />
            <StatCard label="Presentados" value={totals.presented} accent="green" />
            <StatCard label="Confirmados" value={totals.confirmed} accent="violet" />
          </section>

          {/* Gráfico de meta mensual */}
          <MonthlyGoalSection
            opportunities={data.opportunities}
            months={data.months}
            onChange={reload}
          />

          {/* Oportunidades: barra de control */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
                Oportunidades ({filtered.length}
                {filtered.length !== data.opportunities.length ? ` de ${data.opportunities.length}` : ""})
              </h2>
              <Button onClick={handleCreate} disabled={creating}>
                {creating ? "Creando…" : "+ Nueva oportunidad"}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[220px]">
                <svg viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400">
                  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                  <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por rol o empresa…"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent-200"
                />
              </div>
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-200"
              >
                <option value="all">Todos los meses</option>
                {monthOptions.map((k) => (
                  <option key={k} value={k}>
                    {monthLabel(k)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grilla de cards (2 columnas) */}
          {data.opportunities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
              Todavía no hay oportunidades. Creá la primera con el botón de arriba.
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
              No hay oportunidades que coincidan con la búsqueda.
            </div>
          ) : (
            <div className="grid items-start gap-3 md:grid-cols-2">
              {filtered.map((o) => (
                <OpportunityCard
                  key={o.id}
                  opp={o}
                  allOpportunities={data.opportunities}
                  onChange={reload}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Logo del header: muestra public/logo.png si existe; si no, el ícono verde.
function BrandLogo() {
  const [hasImage, setHasImage] = useState(true);
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-accent text-white shadow-soft">
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src="/logo.png"
          alt="Logo"
          className="h-full w-full object-cover"
          onError={() => setHasImage(false)}
        />
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden
        >
          <path d="m6 15-4-4 6.75-6.77a7.79 7.79 0 0 1 11 11L13 22l-4-4 6.39-6.36a2.14 2.14 0 0 0-3-3L6 15" />
          <path d="m5 8 4 4" />
          <path d="m12 15 4 4" />
        </svg>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "green" | "violet";
}) {
  const styles =
    accent === "green"
      ? "border-accent-200 bg-accent-50 text-accent-700"
      : accent === "violet"
      ? "border-violet-200 bg-violet-50 text-violet-700"
      : "border-slate-200/70 bg-white text-slate-900";
  return (
    <div className={`rounded-2xl border p-4 shadow-soft ${styles}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1.5 text-2xl font-extrabold tabular-nums sm:text-3xl">{fmt(value)}</p>
    </div>
  );
}
