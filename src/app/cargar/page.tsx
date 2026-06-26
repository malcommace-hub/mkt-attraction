"use client";

import { useEffect, useMemo, useState } from "react";
import { MobileNav } from "@/components/MobileNav";
import { ConfigWarning } from "@/components/ConfigWarning";
import { OpportunityEditor } from "@/components/forms/OpportunityEditor";
import { ContentEditor } from "@/components/forms/ContentEditor";
import { Button, Label, Select, TextArea, TextInput } from "@/components/forms/inputs";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  fetchAllWeeks,
  getOrCreateWeek,
  updateInsights,
  deleteWeek,
} from "@/lib/data";
import { currentMonday, weekRangeLabel } from "@/lib/week";
import type { WeekFull } from "@/lib/types";

export default function CargarPage() {
  const [weeks, setWeeks] = useState<WeekFull[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [newDate, setNewDate] = useState<string>(currentMonday());
  const [creating, setCreating] = useState(false);

  const [insightsDraft, setInsightsDraft] = useState("");
  const [insightsSaving, setInsightsSaving] = useState(false);
  const [insightsSaved, setInsightsSaved] = useState(false);

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
      .catch((e) => setError(e.message ?? "Error al cargar datos"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = useMemo(
    () => weeks?.find((w) => w.id === selectedId) ?? null,
    [weeks, selectedId]
  );

  // Sincronizar el borrador de insights cuando cambia la semana seleccionada.
  useEffect(() => {
    setInsightsDraft(selected?.insights ?? "");
    setInsightsSaved(false);
  }, [selectedId, selected?.insights]);

  async function handleCreateWeek() {
    setCreating(true);
    try {
      const week = await getOrCreateWeek(newDate);
      await reload(week.id);
      setSelectedId(week.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al crear la semana");
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveInsights() {
    if (!selected) return;
    setInsightsSaving(true);
    setInsightsSaved(false);
    try {
      await updateInsights(selected.id, insightsDraft);
      await reload(selected.id);
      setInsightsSaved(true);
    } finally {
      setInsightsSaving(false);
    }
  }

  async function handleDeleteWeek() {
    if (!selected) return;
    if (
      !confirm(
        `¿Eliminar la semana del ${weekRangeLabel(
          selected.weekStart
        )} con TODO su detalle? Esta acción no se puede deshacer.`
      )
    )
      return;
    await deleteWeek(selected.id);
    await reload();
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
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-slate-800">
                  Semana del {weekRangeLabel(selected.weekStart)}
                </h2>
                <Button variant="danger" onClick={handleDeleteWeek}>
                  Eliminar semana
                </Button>
              </div>

              {/* Insights */}
              <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft">
                <Label>Insights de la semana</Label>
                <TextArea
                  value={insightsDraft}
                  onChange={(e) => {
                    setInsightsDraft(e.target.value);
                    setInsightsSaved(false);
                  }}
                  placeholder="Ej: esta semana no hubo oportunidades buenas, por eso menos postulaciones…"
                />
                <div className="mt-2 flex items-center gap-3">
                  <Button onClick={handleSaveInsights} disabled={insightsSaving}>
                    {insightsSaving ? "Guardando…" : "Guardar insights"}
                  </Button>
                  {insightsSaved && (
                    <span className="text-xs font-medium text-accent-700">
                      ✓ Guardado
                    </span>
                  )}
                </div>
              </section>

              <OpportunityEditor
                weekId={selected.id}
                opportunities={selected.opportunities}
                onChange={async () => {
                  await reload(selected.id);
                }}
              />

              <ContentEditor
                weekId={selected.id}
                contents={selected.contents}
                opportunities={selected.opportunities}
                onChange={async () => {
                  await reload(selected.id);
                }}
              />

              {/* Resumen del funnel calculado */}
              <section className="rounded-2xl border border-accent-200 bg-accent-50 p-5">
                <h3 className="mb-2 text-sm font-bold text-accent-800">
                  Funnel calculado de esta semana
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-5">
                  <FunnelStat label="Contenidos" value={selected.funnel.contentsCount} />
                  <FunnelStat label="Views" value={selected.funnel.views} />
                  <FunnelStat label="Postulaciones" value={selected.funnel.applications} />
                  <FunnelStat label="Presentados" value={selected.funnel.presented} />
                  <FunnelStat label="Confirmados" value={selected.funnel.confirmed} />
                </div>
              </section>
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

function FunnelStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/70 px-3 py-2">
      <p className="text-lg font-extrabold tabular-nums text-accent-800">{value}</p>
      <p className="text-xs font-semibold text-accent-700/70">{label}</p>
    </div>
  );
}
