"use client";

import { useState } from "react";
import {
  CHANNELS,
  type Channel,
  type ContentWithOpps,
  type OpportunityRow,
} from "@/lib/types";
import {
  insertContent,
  updateContent,
  deleteContent,
  type ContentInput,
} from "@/lib/data";
import { ChannelBadge } from "@/components/Badges";
import { fmt } from "@/lib/format";
import { Button, Label, NumberInput, Select, TextInput } from "./inputs";

const EMPTY: ContentInput = {
  channel: "LinkedIn",
  title: "",
  views: 0,
  url: null,
};

function ContentForm({
  initial,
  initialOppIds,
  opportunities,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: ContentInput;
  initialOppIds: string[];
  opportunities: OpportunityRow[];
  submitLabel: string;
  onSubmit: (input: ContentInput, oppIds: string[]) => Promise<void>;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<ContentInput>(initial);
  const [oppIds, setOppIds] = useState<string[]>(initialOppIds);
  const [saving, setSaving] = useState(false);

  const valid = form.title.trim() !== "";

  function toggleOpp(id: string) {
    setOppIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit() {
    if (!valid) return;
    setSaving(true);
    try {
      await onSubmit(
        { ...form, title: form.title.trim(), url: form.url?.trim() || null },
        oppIds
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 sm:grid-cols-12">
      <div className="sm:col-span-3">
        <Label>Canal</Label>
        <Select
          value={form.channel}
          onChange={(e) => setForm({ ...form, channel: e.target.value as Channel })}
        >
          {CHANNELS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>
      <div className="sm:col-span-6">
        <Label>Título</Label>
        <TextInput
          value={form.title}
          placeholder="Reel: 3 skills que buscan en Data"
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
      </div>
      <div className="sm:col-span-3">
        <Label>Views</Label>
        <NumberInput
          value={form.views}
          onChange={(e) => setForm({ ...form, views: Number(e.target.value) || 0 })}
        />
      </div>
      <div className="sm:col-span-12">
        <Label>URL (opcional)</Label>
        <TextInput
          type="url"
          value={form.url ?? ""}
          placeholder="https://…"
          onChange={(e) => setForm({ ...form, url: e.target.value || null })}
        />
      </div>

      <div className="sm:col-span-12">
        <Label>¿Qué oportunidades aparecieron en esta pieza?</Label>
        {opportunities.length === 0 ? (
          <p className="text-xs italic text-slate-400">
            Primero agregá oportunidades para poder vincularlas.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {opportunities.map((o) => {
              const checked = oppIds.includes(o.id);
              return (
                <button
                  type="button"
                  key={o.id}
                  onClick={() => toggleOpp(o.id)}
                  className={[
                    "rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 ring-inset transition-all duration-150",
                    checked
                      ? "bg-accent-50 text-accent-700 ring-accent-300"
                      : "bg-white text-slate-500 ring-slate-200 hover:ring-slate-300",
                  ].join(" ")}
                >
                  {checked ? "✓ " : ""}
                  {o.role} · {o.company}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 sm:col-span-12">
        <Button onClick={handleSubmit} disabled={!valid || saving}>
          {saving ? "Guardando…" : submitLabel}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={saving}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}

export function ContentEditor({
  weekId,
  contents,
  opportunities,
  onChange,
}: {
  weekId: string;
  contents: ContentWithOpps[];
  opportunities: OpportunityRow[];
  onChange: () => Promise<void> | void;
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const oppById = new Map(opportunities.map((o) => [o.id, o]));

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Contenidos</h3>
          <p className="text-xs text-slate-400">
            Piezas publicadas. Tildá qué oportunidades aparecieron en cada una.
          </p>
        </div>
        {!adding && (
          <Button variant="outline" onClick={() => setAdding(true)}>
            + Agregar
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {contents.length === 0 && !adding && (
          <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-sm text-slate-400">
            Sin contenidos todavía.
          </p>
        )}

        {contents.map((c) =>
          editingId === c.id ? (
            <ContentForm
              key={c.id}
              initial={{ channel: c.channel, title: c.title, views: c.views, url: c.url }}
              initialOppIds={c.opportunityIds}
              opportunities={opportunities}
              submitLabel="Guardar cambios"
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
              className="flex flex-wrap items-start gap-3 rounded-xl border border-slate-100 bg-white px-3.5 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <ChannelBadge channel={c.channel} />
                  <span className="text-xs font-semibold tabular-nums text-slate-500">
                    {fmt(c.views)} views
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-800">{c.title}</p>
                {c.opportunityIds.length > 0 && (
                  <p className="mt-1 text-xs text-slate-400">
                    En:{" "}
                    {c.opportunityIds
                      .map((id) => oppById.get(id)?.role)
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" onClick={() => setEditingId(c.id)}>
                  Editar
                </Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    if (!confirm(`¿Eliminar el contenido "${c.title}"?`)) return;
                    await deleteContent(c.id);
                    await onChange();
                  }}
                >
                  Eliminar
                </Button>
              </div>
            </div>
          )
        )}

        {adding && (
          <ContentForm
            initial={EMPTY}
            initialOppIds={[]}
            opportunities={opportunities}
            submitLabel="Agregar contenido"
            onCancel={() => setAdding(false)}
            onSubmit={async (input, oppIds) => {
              await insertContent(weekId, input, oppIds);
              setAdding(false);
              await onChange();
            }}
          />
        )}
      </div>
    </section>
  );
}
