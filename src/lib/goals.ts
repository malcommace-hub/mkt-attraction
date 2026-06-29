// Metas mensuales (fijas): % de presentados que tiene que venir del career site.
export const MONTHLY_GOALS: Record<string, number> = {
  "2026-07": 15,
  "2026-08": 18,
  "2026-09": 20,
};

const MONTH_NAMES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

// 'YYYY-MM' a partir de una fecha ISO (YYYY-MM-DD).
export function monthKey(dateISO: string): string {
  return dateISO.slice(0, 7);
}

// Etiqueta corta para el eje: "Jul '26".
export function monthLabel(key: string): string {
  const [y, m] = key.split("-");
  const idx = Number(m) - 1;
  return `${MONTH_NAMES[idx] ?? m} '${y.slice(2)}`;
}

export function goalFor(key: string): number | null {
  return MONTHLY_GOALS[key] ?? null;
}
