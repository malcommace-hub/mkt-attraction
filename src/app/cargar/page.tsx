"use client";

import { useEffect, useMemo, useState } from "react";
import { MobileNav } from "@/components/MobileNav";
import { ConfigWarning } from "@/components/ConfigWarning";
import { WeekEditor } from "@/components/forms/WeekEditor";
import { Button, Label, Select, TextInput } from "@/components/forms/inputs";
import { isSupabaseConfigured } from "@/lib/supabase";
import { fetchAllWeeks, getOrCreateWeek, friendlyError } from "@/lib/data";
import { currentMonday, weekRangeLabel } from "@/lib/week";
import type { WeekFull } from "@/lib/types";

export default function CargarPage() {
  const [weeks, setWeeks] = useState<WeekFull[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [newDate, setNewDate] = useState<string>(currentMonday());
  const [creating, setCreating] = useState(false);

  async function reload(keepId?: string) {
    const data = await fetchAllWeeks();
    setWeeks(data);
    const targetId = keepId ?? selectedId;
    if (targetId && data.some((w) => w.id === targetId)) {
      setSelectedId(targetId);
    } else if (data.length > 0 && !targetId) {
      setSelectedId(data[0].id);
    } else if (targetId && !data.some((w) => w.id === targetId)) {
      setSelectedId(data[0]?.id ?? null);
    }
    return data;
  }

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    fetchAllWeeks()
      .then((data) => {
        setWeeks(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch((e) => {
        console.error("fetchAllWeeks", e);
        setError(friendlyError(e));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = useMemo(
    () => weeks?.find((w) => w.id === selectedId) ?? null,
    [weeks, selectedId]
  );

  async function handleCreateWeek() {
    setCreating(true);
    try {
      const week = await getOrCreateWeek(newDate);
      await reload(week.id);
      setSelectedId(week.id);
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
          El funnel se calcula solo a partir de este detalle. Cargá contenidos y
          oportunidades por semana.
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
        <div className="flex flex-col gap-5">
          {/* Selección / creación de semana */}
          <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Elegir semana existente</Label>
                <Select
                  value={selectedId ?? ""}
                  onChange={(e) => setSelectedId(e.target.value || null)}
                  disabled={weeks.length === 0}
                >
                  {weeks.length === 0 && <option value="">— no hay semanas —</option>}
                  {weeks.map((w) => (
                    <option key={w.id} value={w.id}>
                      Semana del {weekRangeLabel(w.weekStart)}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>…o crear una nueva (elegí cualquier día de esa semana)</Label>
                <div className="flex gap-2">
                  <TextInput
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                  <Button onClick={handleCreateWeek} disabled={creating || !newDate}>
                    {creating ? "Creando…" : "Crear / abrir"}
                  </Button>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  Se agrupa por el lunes de esa semana.
                </p>
              </div>
            </div>
          </section>

          {selected ? (
            <>
              <h2 className="text-lg font-bold text-slate-800">
                Semana del {weekRangeLabel(selected.weekStart)}
              </h2>
              <WeekEditor
                week={selected}
                onChange={async () => {
                  await reload(selected.id);
                }}
                onDeleted={() => {
                  /* reload ya reasignó la selección */
                }}
              />
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
              Creá tu primera semana usando el selector de fecha de arriba.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
