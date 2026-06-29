// Tipos de dominio del tablero "Supply Generation" (modelo por OPORTUNIDAD).

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
export interface OpportunityRow {
  id: string;
  role: string;
  company: string;
  seniority: Seniority;
  date: string; // fecha de carga de la oportunidad (ISO date)
  applications: number; // postulaciones
  presented: number; // candidatos presentados (career site)
  confirmed: number; // candidatos confirmados
  note: string | null; // comentario / insight
  created_at: string;
}

export interface ContentRow {
  id: string;
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

// Contenido con la lista de oportunidades a las que está vinculado.
export interface ContentWithLinks extends ContentRow {
  opportunityIds: string[];
}

// Total mensual de presentados (todas las fuentes), carga manual.
export interface MonthRow {
  month: string; // 'YYYY-MM'
  total_presented: number;
}

// Oportunidad con sus contenidos asignados y métricas calculadas.
export interface OpportunityFull extends OpportunityRow {
  contents: ContentWithLinks[];
  views: number; // suma de views de los contenidos asignados
  contentsCount: number;
}
