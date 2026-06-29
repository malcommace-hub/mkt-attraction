"use client";

import { useEffect, useState } from "react";
import { MobileNav } from "@/components/MobileNav";
import { ConfigWarning } from "@/components/ConfigWarning";
import { WeekSpreadsheet } from "@/components/forms/WeekSpreadsheet";
import { Button, Label, TextInput } from "@/components/forms/inputs";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchAllWeeks, getOrCreateWeek, friendlyError } from "@/lib/data";
import { currentMonday } from "@/lib/week";
import type { WeekFull } from "@/lib/types";

export default function CargarPage() {
  const [weeks, setWeeks] = useState<WeekFull[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [newDate, setNewDate] = useState<string>(currentMonday());
  const [creating, setCreating] = useState(false);

  async function reload() {
    const data = await fetchAllWeeks();
    setWeeks(data);
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchAllWeeks()
      .then(setWeeks)
      .catch((e) => {
        console.error("fetchAllWeeks", e);
        setError(friendlyError(e));
      });
  }, []);

  async function handleCreateWeek() {
    setCreating(true);
    try {
      await getOrCreateWeek(newDate);
      await reload();
    } catch (e: unknown) {
      console.error("getOrCreateWeek", e);
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
          Cargar / modificar datos
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Una planilla por semana. Completá cada búsqueda en su fila — se guarda solo
          al salir de cada celda y el funnel se actualiza con estos datos.
        </p>
      </header>

      {!isSupabaseConfigured ? (
        <ConfigWarning />
      ) : error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error}
        </div>
      ) : !weeks ? (
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Crear nueva semana */}
          <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft">
            <Label>Crear / abrir una semana (elegí cualquier día de esa semana)</Label>
            <div className="flex flex-wrap items-center gap-2">
              <TextInput
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="max-w-[200px]"
              />
              <Button onClick={handleCreateWeek} disabled={creating || !newDate}>
                {creating ? "Creando…" : "Crear / abrir semana"}
              </Button>
              <span className="text-xs text-slate-400">
                Se agrupa por el lunes de esa semana.
              </span>
            </div>
          </section>

          {weeks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
              Todavía no hay semanas. Creá la primera con el selector de arriba.
            </div>
          ) : (
            weeks.map((w) => (
              <WeekSpreadsheet key={w.id} week={w} onStructuralChange={reload} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
