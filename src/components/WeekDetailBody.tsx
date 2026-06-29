import { Fragment } from "react";
import type { WeekFull } from "@/lib/types";
import { fmt } from "@/lib/format";
import { ChannelBadge, SeniorityBadge } from "./Badges";

// Cuerpo con el detalle de una semana (oportunidades con su comentario, contenidos).
// Se reutiliza en el acordeón del funnel y en el panel flotante.
export function WeekDetailBody({ week }: { week: WeekFull }) {
  const oppById = new Map(week.opportunities.map((o) => [o.id, o]));

  return (
    <div className="flex flex-col gap-5">
      {/* Oportunidades */}
      <section>
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-accent-700">
          Oportunidades
        </h4>
        {week.opportunities.length === 0 ? (
          <p className="text-sm italic text-slate-400">Sin oportunidades.</p>
        ) : (
          <div className="overflow-x-auto scroll-x">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-3">Rol</th>
                  <th className="py-2 pr-3">Empresa</th>
                  <th className="py-2 pr-3">Seniority</th>
                  <th className="py-2 pr-3 text-right">Postulac.</th>
                  <th className="py-2 pr-3 text-right">Perf. base</th>
                  <th className="py-2 pr-3 text-right">Present.</th>
                  <th className="py-2 text-right">Confirm.</th>
                </tr>
              </thead>
              <tbody>
                {week.opportunities.map((o) => (
                  <Fragment key={o.id}>
                    <tr className={o.note ? "" : "border-b border-slate-50 last:border-0"}>
                      <td className="py-2.5 pr-3 font-semibold text-slate-800">{o.role}</td>
                      <td className="py-2.5 pr-3 text-slate-500">{o.company}</td>
                      <td className="py-2.5 pr-3">
                        <SeniorityBadge seniority={o.seniority} />
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-slate-700">
                        {fmt(o.applications)}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums text-slate-700">
                        {fmt(o.profiles_for_base)}
                      </td>
                      <td className="py-2.5 pr-3 text-right tabular-nums font-semibold text-accent-700">
                        {fmt(o.presented)}
                      </td>
                      <td className="py-2.5 text-right tabular-nums font-semibold text-violet-600">
                        {fmt(o.confirmed)}
                      </td>
                    </tr>
                    {o.note && (
                      <tr className="border-b border-slate-50 last:border-0">
                        <td colSpan={7} className="pb-2.5 pl-0 pr-3">
                          <span className="text-xs italic text-slate-500">💬 {o.note}</span>
                        </td>
                      </tr>
                    )}
                  </Fragment>
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
  );
}
