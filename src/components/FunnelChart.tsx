"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  confirmedOpps: string[];
  flagNote: string | null;
};

// Punto interno con las coordenadas de los marcadores (círculos sobre la barra).
type PlottedPoint = ChartPoint & {
  confirmedMarkerY: number | null; // y del círculo violeta (medio de la barra)
  flagMarkerY: number | null; // y del puntito ámbar (arriba de la barra)
};

const VISIBLE_WEEKS = 10; // semanas que entran sin scrollear
const MIN_WEEK_PX = 78; // ancho mínimo por semana (para mobile / pocas semanas)
const CHART_HEIGHT = 440;

const COLOR_VIEWS = "#1e293b";
const COLOR_APPLICATIONS = "#2ECC71";
const COLOR_CONFIRMED = "#8b5cf6";
const COLOR_FLAG = "#f59e0b";

// ---- Tooltip a medida ----
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ payload: PlottedPoint }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0].payload;
  return (
    <div className="max-w-[260px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-card">
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
      {p.confirmedOpps.length > 0 && (
        <div className="mt-1.5 border-t border-slate-100 pt-1.5">
          <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Confirmados en
          </p>
          {p.confirmedOpps.map((o, i) => (
            <p key={i} className="leading-snug text-slate-600">
              • {o}
            </p>
          ))}
        </div>
      )}
      {p.flagNote && (
        <div className="mt-1.5 border-t border-slate-100 pt-1.5">
          <p className="mb-0.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide" style={{ color: COLOR_FLAG }}>
            ⚑ Semana marcada
          </p>
          <p className="leading-snug text-slate-600">{p.flagNote}</p>
        </div>
      )}
    </div>
  );
}

// ---- Círculo violeta con el número de confirmados, centrado en la barra ----
function ConfirmedDot(props: {
  cx?: number;
  cy?: number;
  payload?: PlottedPoint;
}) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload || payload.confirmedMarkerY == null) {
    return <g />;
  }
  return (
    <g>
      <circle cx={cx} cy={cy} r={11} fill={COLOR_CONFIRMED} stroke="#fff" strokeWidth={2} />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
        fill="#fff"
      >
        {payload.confirmed}
      </text>
    </g>
  );
}

// ---- Puntito ámbar para semanas marcadas, arriba de la barra ----
function FlagDot(props: { cx?: number; cy?: number; payload?: PlottedPoint }) {
  const { cx, cy, payload } = props;
  if (cx == null || cy == null || !payload || payload.flagMarkerY == null) {
    return <g />;
  }
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={COLOR_FLAG} stroke="#fff" strokeWidth={2} />
    </g>
  );
}

export function FunnelChart({ data }: { data: ChartPoint[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(0);

  // Medimos el ancho disponible para repartir las semanas (10 visibles).
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => setContainerW(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Arrancar mostrando lo más reciente (extremo derecho).
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [data.length, containerW]);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white text-sm text-slate-400">
        Todavía no hay semanas cargadas.
      </div>
    );
  }

  // Coordenadas de los marcadores (en unidades del eje derecho = postulaciones).
  const plotted: PlottedPoint[] = data.map((d) => ({
    ...d,
    confirmedMarkerY: d.confirmed > 0 ? d.applications / 2 : null,
    flagMarkerY: d.flagNote ? d.applications : null,
  }));

  // Ancho por semana: si entran <=10, llenan el contenedor; si hay más, scroll.
  const perWeek =
    containerW > 0 ? Math.max(MIN_WEEK_PX, containerW / VISIBLE_WEEKS) : MIN_WEEK_PX;
  const innerWidth = Math.max(containerW, data.length * perWeek);

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">
          Views vs. postulaciones por semana
        </h3>
        <span className="hidden text-xs text-slate-400 sm:inline">
          ⇽ scrolleá para ver más semanas ⇾
        </span>
      </div>
      <div ref={scrollRef} className="scroll-x overflow-x-auto pb-2">
        <div style={{ width: innerWidth, height: CHART_HEIGHT }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={plotted}
              margin={{ top: 20, right: 16, bottom: 8, left: 0 }}
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
                width={52}
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
              <Tooltip cursor={{ fill: "rgba(46, 204, 113, 0.06)" }} content={<ChartTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                payload={[
                  { value: "Views", type: "line", color: COLOR_VIEWS, id: "views" },
                  { value: "Postulaciones", type: "circle", color: COLOR_APPLICATIONS, id: "apps" },
                  { value: "Confirmados", type: "circle", color: COLOR_CONFIRMED, id: "conf" },
                  { value: "Semana marcada", type: "circle", color: COLOR_FLAG, id: "flag" },
                ]}
              />
              <Bar
                yAxisId="right"
                dataKey="applications"
                name="Postulaciones"
                fill={COLOR_APPLICATIONS}
                radius={[6, 6, 0, 0]}
                maxBarSize={36}
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
              {/* Círculo violeta de confirmados (centro de la barra) */}
              <Line
                yAxisId="right"
                dataKey="confirmedMarkerY"
                name="Confirmados"
                stroke="none"
                isAnimationActive={false}
                legendType="circle"
                dot={<ConfirmedDot />}
                activeDot={false}
                connectNulls={false}
              />
              {/* Puntito ámbar de semana marcada (arriba de la barra) */}
              <Line
                yAxisId="right"
                dataKey="flagMarkerY"
                name="Semana marcada"
                stroke="none"
                isAnimationActive={false}
                legendType="circle"
                dot={<FlagDot />}
                activeDot={false}
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
