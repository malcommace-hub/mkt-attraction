// Formateo de números para la UI (es-AR: punto de miles).
const nf = new Intl.NumberFormat("es-AR");

export function fmt(n: number): string {
  return nf.format(n ?? 0);
}

export function fmtPct(ratio: number): string {
  return `${(ratio * 100).toFixed(1)}%`;
}
