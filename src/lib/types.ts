// Tipos de dominio del tablero "Supply Generation".

export type Channel = "LinkedIn" | "Instagram" | "TikTok";
export const CHANNELS: Channel[] = ["LinkedIn", "Instagram", "TikTok"];

export type Seniority = "Junior" | "Semi-Senior" | "Senior";
export const SENIORITIES: Seniority[] = ["Junior", "Semi-Senior", "Senior"];

// Filas tal cual vienen de la base de datos.
export interface WeekRow {
  id: string;
  week_start: string; // ISO date (lunes de la semana)
  insights: string | null;
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

// Funnel calculado de una semana.
export interface WeekFunnel {
  contentsCount: number;
  views: number;
  applications: number;
  presented: number;
  confirmed: number;
}

// Semana completa con su detalle y funnel calculado.
export interface WeekFull {
  id: string;
  weekStart: string;
  insights: string | null;
  opportunities: OpportunityRow[];
  contents: ContentWithOpps[];
  funnel: WeekFunnel;
}
