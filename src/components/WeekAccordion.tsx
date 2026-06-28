"use client";

import { useState } from "react";
import type { WeekFull } from "@/lib/types";
import { weekRangeLabel } from "@/lib/week";
import { fmt } from "@/lib/format";
import { WeekDetailBody } from "./WeekDetailBody";

function FunnelPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-slate-50 px-3 py-1.5">
      <span className="text-sm font-extrabold tabular-nums text-slate-800">
        {fmt(value)}
      </span>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
    </div>
  );
}

export function WeekAccordion({
  week,
  defaultOpen = false,
}: {
  week: WeekFull;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-soft transition-shadow hover:shadow-card">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-4 px-4 py-4 text-left sm:px-5"
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-50 text-accent-700 transition-transform duration-300 ${
            open ? "rotate-90" : ""
          }`}
          aria-hidden
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-900">
            Semana del {weekRangeLabel(week.weekStart)}
          </p>
          <p className="truncate text-xs text-slate-400">
            {week.contents.length} contenidos · {week.opportunities.length} oportunidades
          </p>
        </div>

        <div className="hidden flex-wrap items-center gap-2 md:flex">
          <FunnelPill label="Contenidos" value={week.funnel.contentsCount} />
          <FunnelPill label="Views" value={week.funnel.views} />
          <FunnelPill label="Postulac." value={week.funnel.applications} />
          <FunnelPill label="Present." value={week.funnel.presented} />
          <FunnelPill label="Confirm." value={week.funnel.confirmed} />
        </div>
      </button>

      {/* Resumen compacto en mobile */}
      <div className="flex flex-wrap gap-2 px-4 pb-3 md:hidden">
        <FunnelPill label="Cont." value={week.funnel.contentsCount} />
        <FunnelPill label="Views" value={week.funnel.views} />
        <FunnelPill label="Postul." value={week.funnel.applications} />
        <FunnelPill label="Pres." value={week.funnel.presented} />
        <FunnelPill label="Conf." value={week.funnel.confirmed} />
      </div>

      {open && (
        <div className="animate-accordion-down border-t border-slate-100 px-4 py-5 sm:px-5">
          <WeekDetailBody week={week} />
        </div>
      )}
    </div>
  );
}
