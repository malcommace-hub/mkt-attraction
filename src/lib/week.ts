// Helpers para trabajar con semanas (agrupadas por el lunes correspondiente).

// Dado un date ISO (YYYY-MM-DD) o Date, devuelve el lunes de esa semana como YYYY-MM-DD.
export function mondayOf(dateInput: string | Date): string {
  const d =
    typeof dateInput === "string"
      ? new Date(dateInput + "T00:00:00")
      : new Date(dateInput);
  const day = d.getDay(); // 0=domingo, 1=lunes, ... 6=sábado
  // Cuántos días retroceder hasta el lunes.
  const diff = (day + 6) % 7;
  d.setDate(d.getDate() - diff);
  return toISODate(d);
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Domingo (fin) de la semana cuyo lunes es weekStart.
export function sundayOf(weekStart: string): string {
  const d = new Date(weekStart + "T00:00:00");
  d.setDate(d.getDate() + 6);
  return toISODate(d);
}

// Etiqueta corta para ejes/listas: "Sem 12 May" (lunes).
const MONTHS = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

export function shortWeekLabel(weekStart: string): string {
  const d = new Date(weekStart + "T00:00:00");
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

// Rango legible: "12 – 18 May 2025".
export function weekRangeLabel(weekStart: string): string {
  const start = new Date(weekStart + "T00:00:00");
  const end = new Date(sundayOf(weekStart) + "T00:00:00");
  const sameMonth = start.getMonth() === end.getMonth();
  const startStr = sameMonth
    ? `${start.getDate()}`
    : `${start.getDate()} ${MONTHS[start.getMonth()]}`;
  const endStr = `${end.getDate()} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`;
  return `${startStr} – ${endStr}`;
}

// El lunes de la semana actual.
export function currentMonday(): string {
  return mondayOf(new Date());
}
