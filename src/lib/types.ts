// Tipos de dominio del tablero "Supply Generation".

export type Channel = "LinkedIn" | "Instagram" | "TikTok" | "Todas las redes";
export const CHANNELS: Channel[] = [
  "LinkedIn",
  "Instagram",
  "TikTok",
  "Todas las redes",
];

export type Seniority = "Junior" | "Semi-Senior" | "Senior";
export const SENIORITIES: Seniority[] = ["Junior", "Semi-Senior", "Senior"];

// Filas tal cual vienen de la base de datos.
export interface WeekRow {
  id: string;
  week_start: string; // ISO date (lunes de la semana)
  profiles_for_base: number; // métrica manual: perfiles útiles para la base a futuro
  created_at: string;
}

export interface OpportunityRow {
  id: string;
  week_id: string;
  role: string;
  company: string;
  seniority: Seniority;
  applications: number;
  presented: number;
  confirmed: number;
  date: string | null;
  note: string | null; // comentario / insight de esta oportunidad
  created_at: string;
}

export interface ContentRow {
  id: string;
  week_id: string;
  channel: Channel;
  title: string;
  views: number;
  url: string | null;
  created_at: string;
}

export interface ContentOpportunityRow {
  content_id: string;
  opportunity_id: string;
}

// Contenido con las oportunidades que aparecieron en él (resuelto en el cliente).
export interface ContentWithOpps extends ContentRow {
  opportunityIds: string[];
}

// Funnel de una semana (la mayoría calculado; profilesForBase es manual).
export interface WeekFunnel {
  contentsCount: number;
  views: number;
  applications: number;
  profilesForBase: number;
  presented: number;
  confirmed: number;
}

// Semana completa con su detalle y funnel.
export interface WeekFull {
  id: string;
  weekStart: string;
  profilesForBase: number;
  opportunities: OpportunityRow[];
  contents: ContentWithOpps[];
  funnel: WeekFunnel;
}
