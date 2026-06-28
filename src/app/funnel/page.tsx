"use client";

import { useEffect, useMemo, useState } from "react";
import { MobileNav } from "@/components/MobileNav";
import { MetricCard } from "@/components/MetricCard";
import { FunnelChart, type ChartPoint } from "@/components/FunnelChart";
import { WeekAccordion } from "@/components/WeekAccordion";
import { ConfigWarning } from "@/components/ConfigWarning";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchAllWeeks, computeGlobalTotals, friendlyError } from "@/lib/data";
import { shortWeekLabel } from "@/lib/week";
import { fmtPct } from "@/lib/format";
import type { WeekFull } from "@/lib/types";

export default function FunnelPage() {
  const [weeks, setWeeks] = useState<WeekFull[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let alive = true;
    fetchAllWeeks()
      .then((w) => alive && setWeeks(w))
      .catch((e) => {
        console.error("fetchAllWeeks", e);
        if (alive) setError(friendlyError(e));
      });
    return () => {
      alive = false;
    };
  }, []);

  const totals = useMemo(
    () => (weeks ? computeGlobalTotals(weeks) : null),
    [weeks]
  );

  // Gráfico: de la más antigua a la más reciente (izq → der).
  const chartData: ChartPoint[] = useMemo(() => {
    if (!weeks) return [];
    return [...weeks]
      .reverse()
      .map((w) => ({
        label: shortWeekLabel(w.weekStart),
        views: w.funnel.views,
        applications: w.funnel.applications,
        confirmed: w.funnel.confirmed,
      }));
  }, [weeks]);

  return (
    <div className="animate-fade-in">
      <MobileNav />

      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Funnel semanal
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Cómo los canales activados generan talento calificado, semana a semana.
        </p>
      </header>

      {!isSupabaseConfigured ? (
        <ConfigWarning />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : !weeks ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Métricas globales */}
          <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <MetricCard label="Contenidos" value={totals!.contentsCount} />
            <MetricCard label="Views" value={totals!.views} />
            <MetricCard label="Postulaciones" value={totals!.applications} />
            <MetricCard label="Presentados" value={totals!.presented} />
            <MetricCard label="Confirmados" value={totals!.confirmed} />
            <MetricCard
              label="Conversión"
              value={fmtPct(totals!.conversionRate)}
              hint="confirmados / postulaciones"
              accent
            />
          </section>

          {/* Gráfico combinado */}
          <section className="mb-8">
            <FunnelChart data={chartData} />
          </section>

          {/* Acordeón de semanas */}
          <section>
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-400">
              Detalle por semana
            </h2>
            {weeks.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
                Todavía no hay semanas cargadas. Andá a{" "}
                <span className="font-semibold text-accent-700">Cargar datos</span>{" "}
                para empezar.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {weeks.map((w, i) => (
                  <WeekAccordion key={w.id} week={w} defaultOpen={i === 0} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-2xl bg-slate-100" />
      <div className="h-20 animate-pulse rounded-2xl bg-slate-100" />
    </div>
  );
}
