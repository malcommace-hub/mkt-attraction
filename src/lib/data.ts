"use client";

import { supabase } from "./supabase";
import type {
  ContentRow,
  ContentOpportunityRow,
  ContentWithLinks,
  MonthRow,
  OpportunityFull,
  OpportunityRow,
  Seniority,
} from "./types";

// Convierte cualquier error de Supabase en un mensaje claro en español.
export function friendlyError(e: unknown): string {
  const err = e as { message?: string; code?: string } | null;
  const msg = err?.message ?? "";
  const code = err?.code ?? "";
  if (code === "42P01" || /does not exist|schema cache|relation .* does not/i.test(msg)) {
    return 'Parece que falta una tabla/columna. Andá al SQL Editor de Supabase y ejecutá el SQL más reciente que te pasé.';
  }
  if (code === "401" || /invalid api key|jwt|unauthorized|permission denied/i.test(msg)) {
    return "La conexión a Supabase fue rechazada. Revisá la anon key y las políticas RLS.";
  }
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return "No se pudo conectar con Supabase. Revisá NEXT_PUBLIC_SUPABASE_URL.";
  }
  return msg || "Ocurrió un error. Revisá la configuración de Supabase.";
}

// ---- Carga global ----

export type DashboardData = {
  opportunities: OpportunityFull[]; // más recientes primero
  allContents: ContentWithLinks[];
  months: MonthRow[];
};

export async function fetchDashboard(): Promise<DashboardData> {
  const [oppsRes, contentsRes, linksRes, monthsRes] = await Promise.all([
    supabase.from("opportunities").select("*").order("date", { ascending: false }),
    supabase.from("contents").select("*").order("created_at", { ascending: true }),
    supabase.from("content_opportunities").select("*"),
    supabase.from("months").select("*"),
  ]);

  if (oppsRes.error) throw oppsRes.error;
  if (contentsRes.error) throw contentsRes.error;
  if (linksRes.error) throw linksRes.error;
  if (monthsRes.error) throw monthsRes.error;

  const opps = (oppsRes.data ?? []) as OpportunityRow[];
  const contents = (contentsRes.data ?? []) as ContentRow[];
  const links = (linksRes.data ?? []) as ContentOpportunityRow[];
  const months = (monthsRes.data ?? []) as MonthRow[];

  // Mapa content_id -> [opportunity_id]
  const oppIdsByContent = new Map<string, string[]>();
  for (const link of links) {
    const arr = oppIdsByContent.get(link.content_id) ?? [];
    arr.push(link.opportunity_id);
    oppIdsByContent.set(link.content_id, arr);
  }

  const allContents: ContentWithLinks[] = contents.map((c) => ({
    ...c,
    opportunityIds: oppIdsByContent.get(c.id) ?? [],
  }));
  const contentById = new Map(allContents.map((c) => [c.id, c]));

  // Mapa opportunity_id -> contenidos asignados.
  const contentsByOpp = new Map<string, ContentWithLinks[]>();
  for (const link of links) {
    const c = contentById.get(link.content_id);
    if (!c) continue;
    const arr = contentsByOpp.get(link.opportunity_id) ?? [];
    arr.push(c);
    contentsByOpp.set(link.opportunity_id, arr);
  }

  const opportunities: OpportunityFull[] = opps.map((o) => {
    const oppContents = contentsByOpp.get(o.id) ?? [];
    return {
      ...o,
      contents: oppContents,
      views: oppContents.reduce((acc, c) => acc + (c.views || 0), 0),
      contentsCount: oppContents.length,
    };
  });

  // Ordenar por fecha desc (la query ya ordena, pero aseguramos por las dudas).
  opportunities.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return { opportunities, allContents, months };
}

// ---- Oportunidades ----

export type OpportunityInput = {
  role: string;
  company: string;
  seniority: Seniority;
  date: string;
  applications: number;
  presented: number;
  confirmed: number;
  note: string | null;
};

export async function insertOpportunity(input: OpportunityInput): Promise<OpportunityRow> {
  const { data, error } = await supabase
    .from("opportunities")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data as OpportunityRow;
}

export async function updateOpportunity(id: string, input: OpportunityInput): Promise<void> {
  const { error } = await supabase.from("opportunities").update(input).eq("id", id);
  if (error) throw error;
}

export async function deleteOpportunity(id: string): Promise<void> {
  const { error } = await supabase.from("opportunities").delete().eq("id", id);
  if (error) throw error;
}

// ---- Contenidos ----

export type ContentInput = {
  channel: ContentRow["channel"];
  title: string;
  views: number;
  url: string | null;
};

// Crea un contenido y lo vincula a las oportunidades indicadas.
export async function insertContent(
  input: ContentInput,
  opportunityIds: string[]
): Promise<ContentRow> {
  const { data, error } = await supabase
    .from("contents")
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  const content = data as ContentRow;
  await setContentLinks(content.id, opportunityIds);
  return content;
}

export async function updateContent(
  id: string,
  input: ContentInput,
  opportunityIds: string[]
): Promise<void> {
  const { error } = await supabase.from("contents").update(input).eq("id", id);
  if (error) throw error;
  await setContentLinks(id, opportunityIds);
}

export async function deleteContent(id: string): Promise<void> {
  const { error } = await supabase.from("contents").delete().eq("id", id);
  if (error) throw error;
}

// Reemplaza por completo los vínculos contenido<->oportunidades.
export async function setContentLinks(
  contentId: string,
  opportunityIds: string[]
): Promise<void> {
  const del = await supabase
    .from("content_opportunities")
    .delete()
    .eq("content_id", contentId);
  if (del.error) throw del.error;
  if (opportunityIds.length === 0) return;
  const rows = opportunityIds.map((opportunity_id) => ({ content_id: contentId, opportunity_id }));
  const ins = await supabase.from("content_opportunities").insert(rows);
  if (ins.error) throw ins.error;
}

// ---- Totales mensuales (manual) ----

export async function upsertMonthTotal(month: string, totalPresented: number): Promise<void> {
  const { error } = await supabase
    .from("months")
    .upsert(
      { month, total_presented: Math.max(0, Math.round(totalPresented || 0)) },
      { onConflict: "month" }
    );
  if (error) throw error;
}
