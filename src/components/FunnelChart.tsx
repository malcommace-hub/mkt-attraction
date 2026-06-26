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
};

const WEEKS_VISIBLE = 8;
const MIN_WEEK_PX = 92; // ancho por semana para forzar el scroll horizontal

export function FunnelChart({ data }: { data: ChartPoint[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

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
              data={data}
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
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 8px 24px rgba(16,24,40,0.08)",
                  fontSize: 12,
                }}
                formatter={(value, name) => [fmt(value as number), name as string]}
              />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                iconType="circle"
              />
              <Bar
                yAxisId="right"
                dataKey="applications"
                name="Postulaciones"
                fill="#2ECC71"
                radius={[6, 6, 0, 0]}
                barSize={26}
                animationDuration={500}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="views"
                name="Views"
                stroke="#1e293b"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#1e293b" }}
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
