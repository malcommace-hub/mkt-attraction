"use client";

import { useEffect, useState } from "react";
import {
  SENIORITIES,
  type OpportunityRow,
  type Seniority,
  type WeekFull,
} from "@/lib/types";
import {
  insertOpportunity,
  updateOpportunity,
  deleteOpportunity,
  updateWeekStart,
  deleteWeek,
  friendlyError,
  type OpportunityInput,
} from "@/lib/data";
import { weekRangeLabel } from "@/lib/week";
import { fmt } from "@/lib/format";
import { ContentEditor } from "./ContentEditor";
import { Button } from "./inputs";

function toInput(o: OpportunityRow): OpportunityInput {
  return {
    role: o.role,
    company: o.company,
    seniority: o.seniority,
    applications: o.applications,
    profiles_for_base: o.profiles_for_base,
    presented: o.presented,
    confirmed: o.confirmed,
    date: o.date,
    note: o.note,
  };
}

const cell =
  "w-full rounded bg-transparent px-2 py-1.5 text-sm text-slate-800 outline-none transition-colors focus:bg-accent-50 placeholder:text-slate-300";
const numCell = `${cell} text-right tabular-nums`;

export function WeekSpreadsheet({
  week,
  onStructuralChange,
}: {
  week: WeekFull;
  onStructuralChange: () => Promise<void> | void;
}) {
  // Las filas locales son la fuente de verdad mientras se edita; se persisten al
  // salir de cada celda (blur). Se siembran cuando cambia la semana.
  const [rows, setRows] = useState<OpportunityRow[]>(week.opportunities);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [showContents, setShowContents] = useState(false);

  const [editingDate, setEditingDate] = useState(false);
  const [dateDraft, setDateDraft] = useState(week.weekStart);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    setRows(week.opportunities);
  }, [week.id, week.opportunities]);

  function setField<K extends keyof OpportunityRow>(
    id: string,
    field: K,
    value: OpportunityRow[K]
  ) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

  async function saveRow(id: string) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    setSavingId(id);
    try {
      await updateOpportunity(id, toInput(row));
    } catch (e) {
      console.error("updateOpportunity", e);
      alert(friendlyError(e));
    } finally {
      setSavingId(null);
    }
  }

  async function addRow() {
    try {
      const created = await insertOpportunity(week.id, {
        role: "",
        company: "",
        seniority: "Semi-Senior",
        applications: 0,
        profiles_for_base: 0,
        presented: 0,
        confirmed: 0,
        date: null,
        note: null,
      });
      setRows((prev) => [...prev, created]);
    } catch (e) {
      console.error("insertOpportunity", e);
      alert(friendlyError(e));
    }
  }

  async function removeRow(id: string) {
    const row = rows.find((r) => r.id === id);
    if (row && (row.role || row.company) && !confirm(`¿Eliminar la búsqueda "${row.role || row.company}"?`)) {
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteOpportunity(id);
    } catch (e) {
      console.error("deleteOpportunity", e);
      alert(friendlyError(e));
    }
  }

  async function handleSaveDate() {
    if (!dateDraft) return;
    setDateError(null);
    try {
      await updateWeekStart(week.id, dateDraft);
      setEditingDate(false);
      await onStructuralChange();
    } catch (e) {
      console.error("updateWeekStart", e);
      setDateError(friendlyError(e));
    }
  }

  async function handleDeleteWeek() {
    if (
      !confirm(
        `¿Eliminar la semana del ${weekRangeLabel(week.weekStart)} con TODO su detalle? No se puede deshacer.`
      )
    )
      return;
    await deleteWeek(week.id);
    await onStructuralChange();
  }

  // Totales en vivo (de las filas locales).
  const totals = rows.reduce(
    (acc, r) => ({
      applications: acc.applications + (r.applications || 0),
      profiles: acc.profiles + (r.profiles_for_base || 0),
      presented: acc.presented + (r.presented || 0),
      confirmed: acc.confirmed + (r.confirmed || 0),
    }),
    { applications: 0, profiles: 0, presented: 0, confirmed: 0 }
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-soft">
      {/* Encabezado de la semana */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-slate-800">
            Semana del {weekRangeLabel(week.weekStart)}
          </span>
          {!editingDate ? (
            <button
              onClick={() => {
                setDateDraft(week.weekStart);
                setEditingDate(true);
              }}
              className="text-xs font-medium text-slate-400 hover:text-accent-700"
            >
              ✎ fecha
            </button>
          ) : (
            <span className="flex items-center gap-1">
              <input
                type="date"
                value={dateDraft}
                onChange={(e) => setDateDraft(e.target.value)}
                className="rounded-lg border border-slate-200 px-2 py-1 text-xs"
              />
              <button onClick={handleSaveDate} className="text-xs font-semibold text-accent-700">
                ok
              </button>
              <button onClick={() => setEditingDate(false)} className="text-xs text-slate-400">
                ✕
              </button>
            </span>
          )}
        </div>
        <button
          onClick={handleDeleteWeek}
          className="text-xs font-medium text-red-500 hover:text-red-600"
        >
          Eliminar semana
        </button>
      </div>
      {dateError && <p className="px-4 pt-2 text-xs text-red-600">{dateError}</p>}

      {/* Planilla de búsquedas */}
      <div className="scroll-x overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <th className="px-2 py-2">Búsqueda</th>
              <th className="px-2 py-2">Cliente</th>
              <th className="px-2 py-2">Seniority</th>
              <th className="px-2 py-2 text-right">Postulac.</th>
              <th className="px-2 py-2 text-right">Perf. base</th>
              <th className="px-2 py-2 text-right">Present.</th>
              <th className="px-2 py-2 text-right">Confirm.</th>
              <th className="px-2 py-2">Comentario / insight</th>
              <th className="px-2 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="px-2 py-4 text-center text-sm italic text-slate-400">
                  Sin búsquedas. Agregá la primera abajo.
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 hover:bg-slate-50/40">
                <td className="px-1 py-0.5">
                  <input
                    className={`${cell} min-w-[160px] font-semibold`}
                    value={r.role}
                    placeholder="Rol…"
                    onChange={(e) => setField(r.id, "role", e.target.value)}
                    onBlur={() => saveRow(r.id)}
                  />
                </td>
                <td className="px-1 py-0.5">
                  <input
                    className={`${cell} min-w-[120px]`}
                    value={r.company}
                    placeholder="Empresa…"
                    onChange={(e) => setField(r.id, "company", e.target.value)}
                    onBlur={() => saveRow(r.id)}
                  />
                </td>
                <td className="px-1 py-0.5">
                  <select
                    className={`${cell} cursor-pointer`}
                    value={r.seniority}
                    onChange={(e) => {
                      setField(r.id, "seniority", e.target.value as Seniority);
                      // guardar inmediatamente el cambio de select
                      setTimeout(() => saveRow(r.id), 0);
                    }}
                  >
                    {SENIORITIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                {(["applications", "profiles_for_base", "presented", "confirmed"] as const).map(
                  (f) => (
                    <td key={f} className="px-1 py-0.5">
                      <input
                        type="number"
                        min={0}
                        className={`${numCell} w-[72px]`}
                        value={r[f]}
                        onChange={(e) => setField(r.id, f, Number(e.target.value) || 0)}
                        onBlur={() => saveRow(r.id)}
                      />
                    </td>
                  )
                )}
                <td className="px-1 py-0.5">
                  <input
                    className={`${cell} min-w-[200px]`}
                    value={r.note ?? ""}
                    placeholder="Comentario…"
                    onChange={(e) => setField(r.id, "note", e.target.value || null)}
                    onBlur={() => saveRow(r.id)}
                  />
                </td>
                <td className="px-1 py-0.5 text-center">
                  <button
                    onClick={() => removeRow(r.id)}
                    className="rounded p-1 text-slate-300 hover:bg-red-50 hover:text-red-500"
                    aria-label="Eliminar fila"
                    title="Eliminar fila"
                  >
                    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                      <path d="M5 7h14M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-slate-200 text-sm font-bold text-slate-700">
                <td className="px-2 py-2" colSpan={3}>
                  Totales ({rows.length})
                </td>
                <td className="px-2 py-2 text-right tabular-nums">{fmt(totals.applications)}</td>
                <td className="px-2 py-2 text-right tabular-nums">{fmt(totals.profiles)}</td>
                <td className="px-2 py-2 text-right tabular-nums text-accent-700">{fmt(totals.presented)}</td>
                <td className="px-2 py-2 text-right tabular-nums text-violet-600">{fmt(totals.confirmed)}</td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Pie: agregar fila + estado + contenidos */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={addRow}>
            + Agregar búsqueda
          </Button>
          <span className="text-xs text-slate-400">
            {savingId ? "Guardando…" : "Se guarda solo al salir de cada celda"}
          </span>
        </div>
        <button
          onClick={() => setShowContents((v) => !v)}
          className="text-xs font-semibold text-accent-700 hover:underline"
        >
          {showContents ? "Ocultar contenidos" : `Contenidos de la semana (${week.contents.length})`}
        </button>
      </div>

      {showContents && (
        <div className="border-t border-slate-100 p-4">
          <ContentEditor
            weekId={week.id}
            contents={week.contents}
            opportunities={week.opportunities}
            onChange={onStructuralChange}
          />
        </div>
      )}
    </section>
  );
}
