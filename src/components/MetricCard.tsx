import { fmt } from "@/lib/format";

type Props = {
  label: string;
  value: number | string;
  hint?: string;
  accent?: boolean;
};

export function MetricCard({ label, value, hint, accent }: Props) {
  return (
    <div
      className={[
        "rounded-2xl border p-4 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card",
        accent
          ? "border-accent-200 bg-accent-50"
          : "border-slate-200/70 bg-white",
      ].join(" ")}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p
        className={[
          "mt-2 text-2xl font-extrabold tabular-nums sm:text-3xl",
          accent ? "text-accent-700" : "text-slate-900",
        ].join(" ")}
      >
        {typeof value === "number" ? fmt(value) : value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}
