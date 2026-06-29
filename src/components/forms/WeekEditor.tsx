"use client";

import { useEffect, useState } from "react";
import type { WeekFull } from "@/lib/types";
import { updateWeekStart, deleteWeek, friendlyError } from "@/lib/data";
import { weekRangeLabel } from "@/lib/week";
import { OpportunityEditor } from "./OpportunityEditor";
import { ContentEditor } from "./ContentEditor";
import { Button, TextInput } from "./inputs";

// Editor completo de una semana (fecha, perfiles para base, oportunidades, contenidos).
// Se usa en la pestaña "Cargar datos" y en el panel flotante del funnel.
export function WeekEditor({
  week,
  onChange,
  onDeleted,
  showFunnelSummary = true,
}: {
  week: WeekFull;
  onChange: () => Promise<void> | void;
  onDeleted?: () => void;
  showFunnelSummary?: boolean;
}) {
  const [editingDate, setEditingDate] = useState(false);
  const [dateDraft, setDateDraft] = useState(week.weekStart);
  const [dateSaving, setDateSaving] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    setEditingDate(false);
    setDateError(null);
  }, [week.id]);

  async function handleSaveDate() {
    if (!dateDraft) return;
    setDateSaving(true);
    setDateError(null);
    try {
      await updateWeekStart(week.id, dateDraft);
      await onChange();
      setEditingDate(false);
    } catch (e: unknown) {
      console.error("updateWeekStart", e);
      setDateError(friendlyError(e));
    } finally {
      setDateSaving(false);
    }
  }

  async function handleDeleteWeek() {
    if (
      !confirm(
        `¿Eliminar la semana del ${weekRangeLabel(
          week.weekStart
        )} con TODO su detalle? Esta acción no se puede deshacer.`
      )
    )
      return;
    await deleteWeek(week.id);
    await onChange();
    onDeleted?.();
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Fecha + eliminar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {!editingDate ? (
            <Button
              variant="outline"
              onClick={() => {
                setDateDraft(week.weekStart);
                setEditingDate(true);
              }}
            >
              ✎ Cambiar fecha
            </Button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <TextInput
                type="date"
                value={dateDraft}
                onChange={(e) => setDateDraft(e.target.value)}
                className="max-w-[180px]"
              />
              <Button onClick={handleSaveDate} disabled={dateSaving || !dateDraft}>
                {dateSaving ? "Guardando…" : "Guardar fecha"}
              </Button>
              <Button variant="ghost" onClick={() => setEditingDate(false)} disabled={dateSaving}>
                Cancelar
              </Button>
            </div>
          )}
        </div>
        <Button variant="danger" onClick={handleDeleteWeek}>
          Eliminar semana
        </Button>
      </div>
      {dateError && <p className="-mt-3 text-xs text-red-600">{dateError}</p>}

      <OpportunityEditor
        weekId={week.id}
        opportunities={week.opportunities}
        onChange={onChange}
      />

      <ContentEditor
        weekId={week.id}
        contents={week.contents}
        opportunities={week.opportunities}
        onChange={onChange}
      />

      {showFunnelSummary && (
        <section className="rounded-2xl border border-accent-200 bg-accent-50 p-5">
          <h3 className="mb-2 text-sm font-bold text-accent-800">
            Funnel calculado de esta semana
          </h3>
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-6">
            <FunnelStat label="Contenidos" value={week.funnel.contentsCount} />
            <FunnelStat label="Views" value={week.funnel.views} />
            <FunnelStat label="Postulaciones" value={week.funnel.applications} />
            <FunnelStat label="Perfiles base" value={week.funnel.profilesForBase} />
            <FunnelStat label="Presentados" value={week.funnel.presented} />
            <FunnelStat label="Confirmados" value={week.funnel.confirmed} />
          </div>
        </section>
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
