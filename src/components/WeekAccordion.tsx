"use client";

import { useState } from "react";
import type { WeekFull } from "@/lib/types";
import { weekRangeLabel } from "@/lib/week";
import { fmt } from "@/lib/format";
import { ChannelBadge, SeniorityBadge } from "./Badges";

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

  const oppById = new Map(week.opportunities.map((o) => [o.id, o]));

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
          {/* Insights */}
          <section className="mb-5">
            <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-accent-700">
              Insights de la semana
            </h4>
            {week.insights && week.insights.trim() ? (
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {week.insights}
              </p>
            ) : (
              <p className="text-sm italic text-slate-400">Sin insights cargados.</p>
            )}
          </section>

          {/* Oportunidades */}
          <section className="mb-5">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-accent-700">
              Oportunidades
            </h4>
            {week.opportunities.length === 0 ? (
              <p className="text-sm italic text-slate-400">Sin oportunidades.</p>
            ) : (
              <div className="overflow-x-auto scroll-x">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <th className="py-2 pr-3">Rol</th>
                      <th className="py-2 pr-3">Empresa</th>
                      <th className="py-2 pr-3">Seniority</th>
                      <th className="py-2 pr-3 text-right">Postulac.</th>
                      <th className="py-2 pr-3 text-right">Present.</th>
                      <th className="py-2 text-right">Confirm.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {week.opportunities.map((o) => (
                      <tr key={o.id} className="border-b border-slate-50 last:border-0">
                        <td className="py-2.5 pr-3 font-semibold text-slate-800">{o.role}</td>
                        <td className="py-2.5 pr-3 text-slate-500">{o.company}</td>
                        <td className="py-2.5 pr-3">
                          <SeniorityBadge seniority={o.seniority} />
                        </td>
                        <td className="py-2.5 pr-3 text-right tabular-nums text-slate-700">{fmt(o.applications)}</td>
                        <td className="py-2.5 pr-3 text-right tabular-nums text-slate-700">{fmt(o.presented)}</td>
                        <td className="py-2.5 text-right tabular-nums font-semibold text-accent-700">{fmt(o.confirmed)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Contenidos */}
          <section>
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-accent-700">
              Contenidos
            </h4>
            {week.contents.length === 0 ? (
              <p className="text-sm italic text-slate-400">Sin contenidos.</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {week.contents.map((c) => {
                  const linkedOpps = c.opportunityIds
                    .map((id) => oppById.get(id))
                    .filter(Boolean);
                  return (
                    <div
                      key={c.id}
                      className="flex flex-col rounded-xl border border-slate-100 bg-slate-50/60 p-3.5"
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <ChannelBadge channel={c.channel} />
                        <span className="text-xs font-semibold tabular-nums text-slate-500">
                          {fmt(c.views)} views
                        </span>
                      </div>
                      <p className="text-sm font-semibold leading-snug text-slate-800">
                        {c.title}
                      </p>
                      {c.url ? (
                        <a
                          href={c.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-accent-700 hover:underline"
                        >
                          Ver pieza ↗
                        </a>
                      ) : null}
                      {linkedOpps.length > 0 && (
                        <div className="mt-3 border-t border-slate-200/70 pt-2">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                            Oportunidades en esta pieza
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {linkedOpps.map((o) => (
                              <span
                                key={o!.id}
                                className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-slate-600 ring-1 ring-inset ring-slate-200"
                              >
                                {o!.role}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
