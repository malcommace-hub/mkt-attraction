"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { MonthRow, OpportunityFull } from "@/lib/types";
import { MONTHLY_GOALS, goalFor, monthKey, monthLabel } from "@/lib/goals";
import { upsertMonthTotal, friendlyError } from "@/lib/data";
import { fmt } from "@/lib/format";

const COLOR_GOAL = "#94a3b8";
const COLOR_REAL = "#2ECC71";

type MonthData = {
  key: string;
  label: string;
  goal: number | null;
  career: number; // presentados career site (suma de opps del mes)
  total: number; // total presentados manual
  real: number | null; // %
};

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: MonthData }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-card">
      <p className="mb-1 font-bold text-slate-700">{p.label}</p>
      <p className="flex justify-between gap-4">
        <span className="text-slate-500">Meta</span>
        <span className="font-semibold tabular-nums text-slate-700">
          {p.goal != null ? `${p.goal}%` : "—"}
        </span>
      </p>
      <p className="flex justify-between gap-4">
        <span style={{ color: COLOR_REAL }}>Share real</span>
        <span className="font-semibold tabular-nums" style={{ color: COLOR_REAL }}>
          {p.real != null ? `${p.real.toFixed(1)}%` : "s/d"}
        </span>
      </p>
      <p className="mt-1 border-t border-slate-100 pt-1 text-[11px] text-slate-400">
        {fmt(p.career)} presentados career site / {fmt(p.total)} total
      </p>
    </div>
  );
}

export function MonthlyGoalSection({
  opportunities,
  months,
  onChange,
}: {
  opportunities: OpportunityFull[];
  months: MonthRow[];
  onChange: () => Promise<void> | void;
}) {
  const totalsByMonth = useMemo(() => {
    const m = new Map<string, number>();
    for (const row of months) m.set(row.month, row.total_presented);
    return m;
  }, [months]);

  const monthData: MonthData[] = useMemo(() => {
    const career = new Map<string, number>();
    for (const o of opportunities) {
      const k = monthKey(o.date);
      career.set(k, (career.get(k) ?? 0) + (o.presented || 0));
    }
    const keys = new Set<string>([
      ...Object.keys(MONTHLY_GOALS),
      ...career.keys(),
      ...totalsByMonth.keys(),
    ]);
    return [...keys]
      .sort()
      .map((key) => {
        const careerN = career.get(key) ?? 0;
        const total = totalsByMonth.get(key) ?? 0;
        return {
          key,
          label: monthLabel(key),
          goal: goalFor(key),
          career: careerN,
          total,
          real: total > 0 ? (careerN / total) * 100 : null,
        };
      });
  }, [opportunities, totalsByMonth]);

  // El gráfico muestra solo los meses con meta definida (Q3).
  const chartData = useMemo(
    () => monthData.filter((d) => d.goal != null),
    [monthData]
  );

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-bold text-slate-800">
          Meta mensual · share de presentados desde career site
        </h2>
        <span className="text-xs text-slate-400">meta vs. real (Q3)</span>
      </div>

      {chartData.length === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-slate-400">
          Cargá oportunidades y el total mensual para ver el avance.
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 16, bottom: 4, left: -8 }}
              barGap={3}
              barCategoryGap="35%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f4" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                width={44}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip cursor={{ fill: "rgba(46,204,113,0.06)" }} content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="rect" />
              <Bar dataKey="goal" name="Meta" fill={COLOR_GOAL} radius={[6, 6, 0, 0]} maxBarSize={54}>
                <LabelList dataKey="goal" position="top" formatter={(v: number) => `${v}%`} fontSize={11} fill={COLOR_GOAL} />
              </Bar>
              <Bar dataKey="real" name="Real (share)" fill={COLOR_REAL} radius={[6, 6, 0, 0]} maxBarSize={54}>
                <LabelList
                  dataKey="real"
                  position="top"
                  formatter={(v: number | null) => (v != null ? `${v.toFixed(1)}%` : "")}
                  fontSize={11}
                  fontWeight={700}
                  fill="#15803d"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Editor del total mensual manual */}
      <MonthlyTotalsEditor data={monthData} onChange={onChange} />
    </section>
  );
}

function MonthlyTotalsEditor({
  data,
  onChange,
}: {
  data: MonthData[];
  onChange: () => Promise<void> | void;
}) {
  // Solo mostramos meses con meta o con datos cargados.
  const rows = data.filter((d) => d.goal != null || d.career > 0 || d.total > 0);
  if (rows.length === 0) return null;

  return (
    <div className="mt-4 border-t border-slate-100 pt-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-400">
        Total de presentados por mes (todas las fuentes · carga manual)
      </p>
      <div className="scroll-x overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <th className="py-1.5 pr-3">Mes</th>
              <th className="py-1.5 pr-3 text-right">Meta</th>
              <th className="py-1.5 pr-3 text-right">Share</th>
              <th className="py-1.5 pr-3 text-right">Career site</th>
              <th className="py-1.5 text-right">Total (manual)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((d) => (
              <MonthRowEditor key={d.key} d={d} onChange={onChange} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MonthRowEditor({
  d,
  onChange,
}: {
  d: MonthData;
  onChange: () => Promise<void> | void;
}) {
  const [value, setValue] = useState(String(d.total));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValue(String(d.total));
  }, [d.total]);

  async function save() {
    const n = Number(value) || 0;
    if (n === d.total) return;
    setSaving(true);
    try {
      await upsertMonthTotal(d.key, n);
      await onChange();
    } catch (e) {
      console.error("upsertMonthTotal", e);
      alert(friendlyError(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="border-t border-slate-50">
      <td className="py-1.5 pr-3 font-semibold text-slate-700">{d.label}</td>
      <td className="py-1.5 pr-3 text-right tabular-nums text-slate-500">
        {d.goal != null ? `${d.goal}%` : "—"}
      </td>
      <td className="py-1.5 pr-3 text-right tabular-nums font-bold text-accent-700">
        {saving ? "…" : d.real != null ? `${d.real.toFixed(1)}%` : "s/d"}
      </td>
      <td className="py-1.5 pr-3 text-right tabular-nums text-slate-500">{fmt(d.career)}</td>
      <td className="py-1.5 text-right">
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-right text-sm tabular-nums outline-none focus:border-accent focus:ring-2 focus:ring-accent-200"
        />
      </td>
    </tr>
  );
}
