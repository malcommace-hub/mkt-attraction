"use client";

import { useEffect } from "react";
import type { WeekFull } from "@/lib/types";
import { weekRangeLabel } from "@/lib/week";
import { fmt } from "@/lib/format";
import { WeekDetailBody } from "./WeekDetailBody";

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-1.5 text-center">
      <p className={`text-base font-extrabold tabular-nums ${color}`}>{fmt(value)}</p>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}

export function WeekDetailModal({
  week,
  onClose,
}: {
  week: WeekFull | null;
  onClose: () => void;
}) {
  // Cerrar con Escape y bloquear el scroll del fondo mientras está abierto.
  useEffect(() => {
    if (!week) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [week, onClose]);

  if (!week) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl bg-white shadow-card animate-fade-in sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-700">
              Detalle de la semana
            </p>
            <h3 className="text-lg font-extrabold text-slate-900">
              {weekRangeLabel(week.weekStart)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
            aria-label="Cerrar"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Resumen del funnel */}
        <div className="grid grid-cols-3 gap-2 border-b border-slate-100 px-5 py-3 sm:grid-cols-5">
          <Stat label="Contenidos" value={week.funnel.contentsCount} color="text-slate-800" />
          <Stat label="Views" value={week.funnel.views} color="text-slate-800" />
          <Stat label="Postulac." value={week.funnel.applications} color="text-slate-800" />
          <Stat label="Present." value={week.funnel.presented} color="text-accent-700" />
          <Stat label="Confirm." value={week.funnel.confirmed} color="text-violet-600" />
        </div>

        {/* Detalle (scrollable) */}
        <div className="overflow-y-auto px-5 py-5">
          <WeekDetailBody week={week} />
        </div>
      </div>
    </div>
  );
}
