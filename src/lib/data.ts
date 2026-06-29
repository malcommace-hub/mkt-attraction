"use client";

import { supabase } from "./supabase";
import { mondayOf } from "./week";
import type {
  ContentRow,
  ContentOpportunityRow,
  ContentWithOpps,
  OpportunityRow,
  WeekFull,
  WeekFunnel,
  WeekRow,
} from "./types";

// Convierte cualquier error de Supabase en un mensaje claro en español.
// Detecta los casos típicos de una configuración recién hecha.
export function friendlyError(e: unknown): string {
  const err = e as { message?: string; code?: string; hint?: string } | null;
  const msg = err?.message ?? "";
  const code = err?.code ?? "";

  // Tabla inexistente: falta correr el supabase.sql.
  if (code === "42P01" || /does not exist|schema cache|relation .* does not/i.test(msg)) {
    return 'Parece que las tablas todavía no existen. Andá al SQL Editor de Supabase y ejecutá el archivo "supabase.sql" del repo.';
  }
  // Clave inválida / sin permisos.
  if (code === "401" || /invalid api key|jwt|unauthorized|permission denied/i.test(msg)) {
    return "La conexión a Supabase fue rechazada. Revisá que NEXT_PUBLIC_SUPABASE_ANON_KEY sea la anon/publishable key correcta y que las políticas RLS estén creadas.";
  }
  if (/failed to fetch|networkerror|load failed/i.test(msg)) {
    return "No se pudo conectar con Supabase. Revisá que NEXT_PUBLIC_SUPABASE_URL apunte a tu proyecto.";
  }
  return msg || "Ocurrió un error al cargar los datos. Revisá la configuración de Supabase.";
}

// Calcula el funnel de una semana sumando su detalle.
export function computeFunnel(
  contents: ContentWithOpps[],
  opportunities: OpportunityRow[]
): WeekFunnel {
  return {
    contentsCount: contents.length,
    views: contents.reduce((acc, c) => acc + (c.views || 0), 0),
    applications: opportunities.reduce((acc, o) => acc + (o.applications || 0), 0),
    presented: opportunities.reduce((acc, o) => acc + (o.presented || 0), 0),
    confirmed: opportunities.reduce((acc, o) => acc + (o.confirmed || 0), 0),
  };
}

// Trae TODAS las semanas con su detalle, ordenadas de la más reciente a la más antigua.
export async function fetchAllWeeks(): Promise<WeekFull[]> {
  const [weeksRes, oppsRes, contentsRes, linksRes] = await Promise.all([
    supabase.from("weeks").select("*").order("week_start", { ascending: false }),
    supabase.from("opportunities").select("*").order("created_at", { ascending: true }),
    supabase.from("contents").select("*").order("created_at", { ascending: true }),
    supabase.from("content_opportunities").select("*"),
  ]);

  if (weeksRes.error) throw weeksRes.error;
  if (oppsRes.error) throw oppsRes.error;
  if (contentsRes.error) throw contentsRes.error;
  if (linksRes.error) throw linksRes.error;

  const weeks = (weeksRes.data ?? []) as WeekRow[];
  const opps = (oppsRes.data ?? []) as OpportunityRow[];
  const contents = (contentsRes.data ?? []) as ContentRow[];
  const links = (linksRes.data ?? []) as ContentOpportunityRow[];

  // Mapa content_id -> [opportunity_id]
  const linksByContent = new Map<string, string[]>();
  for (const link of links) {
    const arr = linksByContent.get(link.content_id) ?? [];
    arr.push(link.opportunity_id);
    linksByContent.set(link.content_id, arr);
  }

  const oppsByWeek = new Map<string, OpportunityRow[]>();
  for (const o of opps) {
    const arr = oppsByWeek.get(o.week_id) ?? [];
    arr.push(o);
    oppsByWeek.set(o.week_id, arr);
  }

  const contentsByWeek = new Map<string, ContentWithOpps[]>();
  for (const c of contents) {
    const arr = contentsByWeek.get(c.week_id) ?? [];
    arr.push({ ...c, opportunityIds: linksByContent.get(c.id) ?? [] });
    contentsByWeek.set(c.week_id, arr);
  }

  return weeks.map((w) => {
    const weekOpps = oppsByWeek.get(w.id) ?? [];
    const weekContents = contentsByWeek.get(w.id) ?? [];
    return {
      id: w.id,
      weekStart: w.week_start,
      insights: w.insights,
      flagNote: w.flag_note,
      opportunities: weekOpps,
      contents: weekContents,
      funnel: computeFunnel(weekContents, weekOpps),
    } satisfies WeekFull;
  });
}

// Crea (o devuelve la existente) la semana que contiene la fecha dada.
export async function getOrCreateWeek(dateISO: string): Promise<WeekRow> {
  const weekStart = mondayOf(dateISO);

  const existing = await supabase
    .from("weeks")
    .select("*")
    .eq("week_start", weekStart)
    .maybeSingle();

  if (existing.error) throw existing.error;
  if (existing.data) return existing.data as WeekRow;

  const inserted = await supabase
    .from("weeks")
    .insert({ week_start: weekStart, insights: "" })
    .select()
    .single();

  if (inserted.error) throw inserted.error;
  return inserted.data as WeekRow;
}

// Cambia la fecha de una semana: reubica week_start al lunes de la fecha dada.
export async function updateWeekStart(weekId: string, dateISO: string): Promise<void> {
  const weekStart = mondayOf(dateISO);
  const { error } = await supabase
    .from("weeks")
    .update({ week_start: weekStart })
    .eq("id", weekId);
  if (error) {
    // Choca con otra semana que ya tiene ese lunes (week_start es único).
    if (error.code === "23505" || /duplicate|unique/i.test(error.message ?? "")) {
      throw new Error(
        "Ya existe una semana con esa fecha. Eliminá o elegí otra para evitar duplicados."
      );
    }
    throw error;
  }
}

export async function updateInsights(weekId: string, insights: string): Promise<void> {
  const { error } = await supabase
    .from("weeks")
    .update({ insights })
    .eq("id", weekId);
  if (error) throw error;
}

// Marca/desmarca una semana en el gráfico. Texto vacío = sin marca.
export async function updateFlagNote(weekId: string, flagNote: string): Promise<void> {
  const value = flagNote.trim() === "" ? null : flagNote.trim();
  const { error } = await supabase
    .from("weeks")
    .update({ flag_note: value })
    .eq("id", weekId);
  if (error) throw error;
}

export async function deleteWeek(weekId: string): Promise<void> {
  // Las FK están con ON DELETE CASCADE, así que esto limpia todo el detalle.
  const { error } = await supabase.from("weeks").delete().eq("id", weekId);
  if (error) throw error;
}

// ---- Oportunidades ----

export type OpportunityInput = {
  role: string;
  company: string;
  seniority: OpportunityRow["seniority"];
  applications: number;
  presented: number;
  confirmed: number;
  date: string | null;
  note: string | null;
};

export async function insertOpportunity(
  weekId: string,
  input: OpportunityInput
): Promise<OpportunityRow> {
  const { data, error } = await supabase
    .from("opportunities")
    .insert({ week_id: weekId, ...input })
    .select()
    .single();
  if (error) throw error;
  return data as OpportunityRow;
}

export async function updateOpportunity(
  id: string,
  input: OpportunityInput
): Promise<void> {
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

export async function insertContent(
  weekId: string,
  input: ContentInput,
  opportunityIds: string[]
): Promise<ContentRow> {
  const { data, error } = await supabase
    .from("contents")
    .insert({ week_id: weekId, ...input })
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

  const rows = opportunityIds.map((opportunity_id) => ({
    content_id: contentId,
    opportunity_id,
  }));
  const ins = await supabase.from("content_opportunities").insert(rows);
  if (ins.error) throw ins.error;
}

// Totales acumulados de todas las semanas.
export function computeGlobalTotals(weeks: WeekFull[]): WeekFunnel & {
  conversionRate: number;
} {
  const totals = weeks.reduce<WeekFunnel>(
    (acc, w) => ({
      contentsCount: acc.contentsCount + w.funnel.contentsCount,
      views: acc.views + w.funnel.views,
      applications: acc.applications + w.funnel.applications,
      presented: acc.presented + w.funnel.presented,
      confirmed: acc.confirmed + w.funnel.confirmed,
    }),
    { contentsCount: 0, views: 0, applications: 0, presented: 0, confirmed: 0 }
  );

  const conversionRate =
    totals.applications > 0 ? totals.confirmed / totals.applications : 0;

  return { ...totals, conversionRate };
}
