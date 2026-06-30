"use client";

import { useState } from "react";
import {
  CHANNELS,
  SENIORITIES,
  type Channel,
  type ContentWithLinks,
  type OpportunityFull,
  type Seniority,
} from "@/lib/types";
import {
  updateOpportunity,
  deleteOpportunity,
  insertContent,
  updateContent,
  deleteContent,
  setContentLinks,
  friendlyError,
  type ContentInput,
  type OpportunityInput,
} from "@/lib/data";
import { fmt } from "@/lib/format";
import { ChannelBadge, SeniorityBadge } from "./Badges";
import { Button, Label, NumberInput, Select, TextArea, TextInput } from "./forms/inputs";

const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
function fmtDate(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function Pill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex min-w-[88px] flex-col items-center rounded-xl bg-slate-50 px-3 py-2">
      <span className={`text-xl font-extrabold tabular-nums ${color}`}>{fmt(value)}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </span>
    </div>
  );
}

export function OpportunityCard({
  opp,
  allOpportunities,
  onChange,
}: {
  opp: OpportunityFull;
  allOpportunities: OpportunityFull[];
  onChange: () => Promise<void> | void;
}) {
  const [editing, setEditing] = useState(false);
  const [contentsOpen, setContentsOpen] = useState(false);

  async function handleDelete() {
    if (!confirm(`¿Eliminar la oportunidad "${opp.role || "sin título"}"? No se puede deshacer.`))
      return;
    await deleteOpportunity(opp.id);
    await onChange();
  }

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-soft transition-shadow hover:shadow-card sm:p-5">
      {editing ? (
        <OppEditForm
          opp={opp}
          onCancel={() => setEditing(false)}
          onSaved={async () => {
            setEditing(false);
            await onChange();
          }}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {/* Identidad + acciones */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                {fmtDate(opp.date)}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="text-base font-bold leading-tight text-slate-900">
                  {opp.role || <span className="italic text-slate-400">Sin título</span>}
                </h3>
                {opp.company && <span className="text-sm text-slate-400">· {opp.company}</span>}
                <SeniorityBadge seniority={opp.seniority} />
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <Button variant="outline" onClick={() => setEditing(true)}>
                Editar
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Eliminar
              </Button>
            </div>
          </div>

          {opp.note && <p className="text-xs italic text-slate-500">💬 {opp.note}</p>}

          {/* Métricas */}
          <div className="flex flex-wrap gap-2">
            <Pill label="Contenidos" value={opp.contentsCount} color="text-slate-800" />
            <Pill label="Views opp" value={opp.views} color="text-slate-800" />
            <Pill label="Postulac." value={opp.applications} color="text-slate-800" />
            <Pill label="Present." value={opp.presented} color="text-accent-700" />
            <Pill label="Confirm." value={opp.confirmed} color="text-violet-600" />
          </div>
        </div>
      )}

      {/* Contenidos */}
      {!editing && (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <button
            onClick={() => setContentsOpen((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-semibold text-accent-700 hover:underline"
          >
            <span className={`transition-transform ${contentsOpen ? "rotate-90" : ""}`}>›</span>
            Contenidos de la oportunidad ({opp.contentsCount}) · {fmt(opp.views)} views
          </button>
          {contentsOpen && (
            <OpportunityContents opp={opp} allOpportunities={allOpportunities} onChange={onChange} />
          )}
        </div>
      )}
    </div>
  );
}

// ---- Edición de los campos de la oportunidad ----

function OppEditForm({
  opp,
  onCancel,
  onSaved,
}: {
  opp: OpportunityFull;
  onCancel: () => void;
  onSaved: () => Promise<void> | void;
}) {
  const [form, setForm] = useState<OpportunityInput>({
    role: opp.role,
    company: opp.company,
    seniority: opp.seniority,
    date: opp.date,
    applications: opp.applications,
    presented: opp.presented,
    confirmed: opp.confirmed,
    note: opp.note,
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await updateOpportunity(opp.id, {
        ...form,
        role: form.role.trim(),
        company: form.company.trim(),
        note: form.note?.trim() || null,
      });
      await onSaved();
    } catch (e) {
      console.error("updateOpportunity", e);
      alert(friendlyError(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
      <div className="sm:col-span-4">
        <Label>Búsqueda / rol</Label>
        <TextInput value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
      </div>
      <div className="sm:col-span-4">
        <Label>Cliente</Label>
        <TextInput value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
      </div>
      <div className="sm:col-span-2">
        <Label>Seniority</Label>
        <Select
          value={form.seniority}
          onChange={(e) => setForm({ ...form, seniority: e.target.value as Seniority })}
        >
          {SENIORITIES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>
      <div className="sm:col-span-2">
        <Label>Fecha de carga</Label>
        <TextInput type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
      </div>

      <div className="sm:col-span-4">
        <Label>Postulaciones</Label>
        <NumberInput value={form.applications} onChange={(e) => setForm({ ...form, applications: Number(e.target.value) || 0 })} />
      </div>
      <div className="sm:col-span-4">
        <Label>Presentados</Label>
        <NumberInput value={form.presented} onChange={(e) => setForm({ ...form, presented: Number(e.target.value) || 0 })} />
      </div>
      <div className="sm:col-span-4">
        <Label>Confirmados</Label>
        <NumberInput value={form.confirmed} onChange={(e) => setForm({ ...form, confirmed: Number(e.target.value) || 0 })} />
      </div>
      <div className="sm:col-span-12">
        <Label>Comentario / insight</Label>
        <TextArea
          value={form.note ?? ""}
          placeholder="Ej: candidatos ok pero requisito excluyente de retail…"
          onChange={(e) => setForm({ ...form, note: e.target.value || null })}
        />
      </div>
      <div className="flex items-center gap-2 sm:col-span-12">
        <Button onClick={save} disabled={saving}>
          {saving ? "Guardando…" : "Guardar"}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}

// ---- Gestión de contenidos de la oportunidad ----

function OpportunityContents({
  opp,
  allOpportunities,
  onChange,
}: {
  opp: OpportunityFull;
  allOpportunities: OpportunityFull[];
  onChange: () => Promise<void> | void;
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function unlink(content: ContentWithLinks) {
    const remaining = content.opportunityIds.filter((id) => id !== opp.id);
    const orphan = remaining.length === 0;
    if (!confirm(orphan ? `Este contenido no quedará en ninguna otra oportunidad, así que se eliminará. ¿Continuar?` : `¿Quitar "${content.title}" de esta oportunidad?`))
      return;
    if (orphan) await deleteContent(content.id);
    else await setContentLinks(content.id, remaining);
    await onChange();
  }

  return (
    <div className="mt-3 flex flex-col gap-2">
      {opp.contents.length === 0 && !adding && (
        <p className="rounded-xl bg-slate-50 px-3 py-3 text-center text-sm text-slate-400">
          Sin contenidos asignados todavía.
        </p>
      )}

      {opp.contents.map((c) =>
        editingId === c.id ? (
          <ContentForm
            key={c.id}
            initial={{ channel: c.channel, title: c.title, views: c.views, url: c.url }}
            initialOppIds={c.opportunityIds}
            currentOppId={opp.id}
            allOpportunities={allOpportunities}
            submitLabel="Guardar"
            onCancel={() => setEditingId(null)}
            onSubmit={async (input, oppIds) => {
              await updateContent(c.id, input, oppIds);
              setEditingId(null);
              await onChange();
            }}
          />
        ) : (
          <div
            key={c.id}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2"
          >
            <ChannelBadge channel={c.channel} />
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
              {c.title || <span className="italic text-slate-400">Sin título</span>}
            </span>
            <span className="text-xs font-semibold tabular-nums text-slate-500">{fmt(c.views)} views</span>
            {c.opportunityIds.length > 1 && (
              <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 ring-1 ring-inset ring-slate-200">
                en {c.opportunityIds.length} opps
              </span>
            )}
            {c.url && (
              <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-accent-700 hover:underline">
                ver ↗
              </a>
            )}
            <button onClick={() => setEditingId(c.id)} className="text-xs font-medium text-slate-500 hover:text-slate-700">
              editar
            </button>
            <button onClick={() => unlink(c)} className="text-xs font-medium text-red-500 hover:text-red-600">
              quitar
            </button>
          </div>
        )
      )}

      {adding ? (
        <ContentForm
          initial={{ channel: "LinkedIn", title: "", views: 0, url: null }}
          initialOppIds={[opp.id]}
          currentOppId={opp.id}
          allOpportunities={allOpportunities}
          submitLabel="Agregar contenido"
          onCancel={() => setAdding(false)}
          onSubmit={async (input, oppIds) => {
            await insertContent(input, oppIds);
            setAdding(false);
            await onChange();
          }}
        />
      ) : (
        <div>
          <Button variant="outline" onClick={() => setAdding(true)}>
            + Agregar contenido
          </Button>
        </div>
      )}
    </div>
  );
}

function ContentForm({
  initial,
  initialOppIds,
  currentOppId,
  allOpportunities,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: ContentInput;
  initialOppIds: string[];
  currentOppId: string;
  allOpportunities: OpportunityFull[];
  submitLabel: string;
  onSubmit: (input: ContentInput, oppIds: string[]) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ContentInput>(initial);
  const [oppIds, setOppIds] = useState<string[]>(
    initialOppIds.length ? initialOppIds : [currentOppId]
  );
  const [saving, setSaving] = useState(false);
  const [showAllOpps, setShowAllOpps] = useState(false);

  function toggle(id: string) {
    setOppIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  // Mostramos pocas por defecto + las tildadas; el resto detrás de "Ver más".
  const LIMIT = 7;
  const visibleOpps = showAllOpps
    ? allOpportunities
    : allOpportunities.filter((o, i) => i < LIMIT || oppIds.includes(o.id));
  const hiddenCount = allOpportunities.length - visibleOpps.length;

  async function submit() {
    if (form.title.trim() === "") return;
    setSaving(true);
    try {
      await onSubmit(
        { ...form, title: form.title.trim(), url: form.url?.trim() || null },
        oppIds.length ? oppIds : [currentOppId]
      );
    } catch (e) {
      console.error("content save", e);
      alert(friendlyError(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-3.5 sm:grid-cols-12">
      <div className="sm:col-span-3">
        <Label>Canal</Label>
        <Select value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value as Channel })}>
          {CHANNELS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </div>
      <div className="sm:col-span-6">
        <Label>Título</Label>
        <TextInput value={form.title} placeholder="Reel: skills en Data…" onChange={(e) => setForm({ ...form, title: e.target.value })} />
      </div>
      <div className="sm:col-span-3">
        <Label>Views</Label>
        <NumberInput value={form.views} onChange={(e) => setForm({ ...form, views: Number(e.target.value) || 0 })} />
      </div>
      <div className="sm:col-span-12">
        <Label>URL (opcional)</Label>
        <TextInput type="url" value={form.url ?? ""} placeholder="https://…" onChange={(e) => setForm({ ...form, url: e.target.value || null })} />
      </div>
      <div className="sm:col-span-12">
        <Label>¿En qué oportunidades aparece este contenido?</Label>
        <div className="flex flex-wrap gap-2">
          {visibleOpps.map((o) => {
            const checked = oppIds.includes(o.id);
            return (
              <button
                type="button"
                key={o.id}
                onClick={() => toggle(o.id)}
                className={[
                  "rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 ring-inset transition-all",
                  checked
                    ? "bg-accent-50 text-accent-700 ring-accent-300"
                    : "bg-white text-slate-500 ring-slate-200 hover:ring-slate-300",
                ].join(" ")}
              >
                {checked ? "✓ " : ""}
                {o.role || "sin título"}{o.company ? ` · ${o.company}` : ""}
              </button>
            );
          })}
          {!showAllOpps && hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setShowAllOpps(true)}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-accent-700 ring-1 ring-inset ring-accent-200 hover:bg-accent-50"
            >
              Ver más ({hiddenCount})
            </button>
          )}
          {showAllOpps && allOpportunities.length > LIMIT && (
            <button
              type="button"
              onClick={() => setShowAllOpps(false)}
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-inset ring-slate-200 hover:bg-slate-50"
            >
              Ver menos
            </button>
          )}
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Las views completas del contenido se suman a cada oportunidad seleccionada.
        </p>
      </div>
      <div className="flex items-center gap-2 sm:col-span-12">
        <Button onClick={submit} disabled={saving || form.title.trim() === ""}>
          {saving ? "Guardando…" : submitLabel}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}
