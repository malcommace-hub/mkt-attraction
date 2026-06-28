"use client";

import { useEffect, useRef } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fmt } from "@/lib/format";

export type ChartPoint = {
  label: string;
  views: number;
  applications: number;
  confirmed: number;
};

// Punto interno: separamos la barra de postulaciones en "confirmadas" (violeta)
// y "no confirmadas" (verde) para que se apilen y sumen el total.
type StackedPoint = ChartPoint & { notConfirmed: number };

const WEEKS_VISIBLE = 8;
const MIN_WEEK_PX = 92; // ancho por semana para forzar el scroll horizontal

const COLOR_VIEWS = "#1e293b";
const COLOR_APPLICATIONS = "#2ECC71";
const COLOR_CONFIRMED = "#8b5cf6";

// Tooltip a medida: muestra views, postulaciones (total) y confirmados.
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: StackedPoint }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-card">
      <p className="mb-1 font-bold text-slate-700">Semana {label}</p>
      <p className="flex items-center justify-between gap-4">
        <span className="text-slate-500">Views</span>
        <span className="font-semibold tabular-nums text-slate-800">{fmt(p.views)}</span>
      </p>
      <p className="flex items-center justify-between gap-4">
        <span className="text-slate-500">Postulaciones</span>
        <span className="font-semibold tabular-nums text-slate-800">
          {fmt(p.applications)}
        </span>
      </p>
      <p className="flex items-center justify-between gap-4">
        <span style={{ color: COLOR_CONFIRMED }}>Confirmados</span>
        <span className="font-semibold tabular-nums" style={{ color: COLOR_CONFIRMED }}>
          {fmt(p.confirmed)}
        </span>
      </p>
    </div>
  );
}

export function FunnelChart({ data }: { data: ChartPoint[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Confirmados nunca puede superar el total; el resto es "no confirmado".
  const stacked: StackedPoint[] = data.map((d) => {
    const confirmed = Math.min(d.confirmed, d.applications);
    return { ...d, confirmed, notConfirmed: Math.max(0, d.applications - confirmed) };
  });

  // Arrancar mostrando lo más reciente (extremo derecho).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [data.length]);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-400">
        Todavía no hay semanas cargadas.
      </div>
    );
  }

  const innerWidth = Math.max(data.length * MIN_WEEK_PX, WEEKS_VISIBLE * MIN_WEEK_PX);

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">
          Views vs. postulaciones por semana
        </h3>
        <span className="text-xs text-slate-400">
          ⇽ scrolleá para ver más semanas ⇾
        </span>
      </div>
      <div ref={scrollRef} className="scroll-x overflow-x-auto pb-2">
        <div style={{ width: innerWidth, height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={stacked}
              margin={{ top: 12, right: 16, bottom: 8, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#eef1f4" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                interval={0}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(v) => fmt(v as number)}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={false}
                width={40}
              />
              <Tooltip
                cursor={{ fill: "rgba(46, 204, 113, 0.06)" }}
                content={<ChartTooltip />}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                iconType="circle"
              />
              {/* Barra de postulaciones apilada: confirmados (violeta) abajo,
                  resto (verde) arriba. Juntos suman el total. */}
              <Bar
                yAxisId="right"
                stackId="postulaciones"
                dataKey="confirmed"
                name="Confirmados"
                fill={COLOR_CONFIRMED}
                barSize={26}
                animationDuration={500}
              />
              <Bar
                yAxisId="right"
                stackId="postulaciones"
                dataKey="notConfirmed"
                name="Postulaciones"
                fill={COLOR_APPLICATIONS}
                radius={[6, 6, 0, 0]}
                barSize={26}
                animationDuration={500}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="views"
                name="Views"
                stroke={COLOR_VIEWS}
                strokeWidth={2.5}
                dot={{ r: 3, fill: COLOR_VIEWS }}
                activeDot={{ r: 5 }}
                animationDuration={600}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
