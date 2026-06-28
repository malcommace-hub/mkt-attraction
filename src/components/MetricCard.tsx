import { fmt } from "@/lib/format";

type CardColor = "neutral" | "green" | "violet";

type Props = {
  label: string;
  value: number | string;
  hint?: string;
  color?: CardColor;
};

const STYLES: Record<CardColor, { card: string; value: string }> = {
  neutral: { card: "border-slate-200/70 bg-white", value: "text-slate-900" },
  green: { card: "border-accent-200 bg-accent-50", value: "text-accent-700" },
  violet: { card: "border-violet-200 bg-violet-50", value: "text-violet-700" },
};

export function MetricCard({ label, value, hint, color = "neutral" }: Props) {
  const s = STYLES[color];
  return (
    <div
      className={[
        "rounded-2xl border p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card",
        s.card,
      ].join(" ")}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={["mt-2 text-2xl font-extrabold tabular-nums sm:text-3xl", s.value].join(" ")}>
        {typeof value === "number" ? fmt(value) : value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}
