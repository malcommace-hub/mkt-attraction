"use client";

import { useEffect, useState } from "react";
import { MobileNav } from "@/components/MobileNav";
import { ConfigWarning } from "@/components/ConfigWarning";
import { MonthlyGoalSection } from "@/components/MonthlyGoalSection";
import { OpportunityCard } from "@/components/OpportunityCard";
import { Button } from "@/components/forms/inputs";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchDashboard, insertOpportunity, friendlyError, type DashboardData } from "@/lib/data";
import { toISODate } from "@/lib/week";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

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
    } catch (e) {
      console.error("insertOpportunity", e);
      setError(friendlyError(e));
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <MobileNav />

      <header className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Supply Generation
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Talento calificado generado desde los canales del career site, oportunidad por oportunidad.
        </p>
      </header>

      {!isSupabaseConfigured ? (
        <ConfigWarning />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : !data ? (
        <div className="space-y-4">
          <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-28 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Gráfico principal: meta mensual */}
          <MonthlyGoalSection
            opportunities={data.opportunities}
            months={data.months}
            onChange={reload}
          />

          {/* Oportunidades */}
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
              Oportunidades ({data.opportunities.length})
            </h2>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Creando…" : "+ Nueva oportunidad"}
            </Button>
          </div>

          {data.opportunities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
              Todavía no hay oportunidades. Creá la primera con el botón de arriba.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {data.opportunities.map((o) => (
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
