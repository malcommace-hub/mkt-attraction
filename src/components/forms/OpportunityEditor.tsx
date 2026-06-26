"use client";

import { useState } from "react";
import { SENIORITIES, type OpportunityRow, type Seniority } from "@/lib/types";
import {
  insertOpportunity,
  updateOpportunity,
  deleteOpportunity,
  type OpportunityInput,
} from "@/lib/data";
import { SeniorityBadge } from "@/components/Badges";
import { fmt } from "@/lib/format";
import { Button, Label, NumberInput, Select, TextInput } from "./inputs";

const EMPTY: OpportunityInput = {
  role: "",
  company: "",
  seniority: "Semi-Senior",
  applications: 0,
  presented: 0,
  confirmed: 0,
  date: null,
};

function toInput(o: OpportunityRow): OpportunityInput {
  return {
    role: o.role,
    company: o.company,
    seniority: o.seniority,
    applications: o.applications,
    presented: o.presented,
    confirmed: o.confirmed,
    date: o.date,
  };
}

function OpportunityForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: OpportunityInput;
  submitLabel: string;
  onSubmit: (input: OpportunityInput) => Promise<void>;
  onCancel?: () => void;
}) {
  const [form, setForm] = useState<OpportunityInput>(initial);
  const [saving, setSaving] = useState(false);

  const valid = form.role.trim() !== "" && form.company.trim() !== "";

  async function handleSubmit() {
    if (!valid) return;
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        role: form.role.trim(),
        company: form.company.trim(),
        date: form.date || null,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 sm:grid-cols-12">
      <div className="sm:col-span-4">
        <Label>Rol</Label>
        <TextInput
          value={form.role}
          placeholder="Data Engineer"
          onChange={(e) => setForm({ ...form, role: e.target.value })}
        />
      </div>
      <div className="sm:col-span-4">
        <Label>Empresa</Label>
        <TextInput
          value={form.company}
          placeholder="Empresa S.A."
          onChange={(e) => setForm({ ...form, company: e.target.value })}
        />
      </div>
      <div className="sm:col-span-4">
        <Label>Seniority</Label>
        <Select
          value={form.seniority}
          onChange={(e) =>
            setForm({ ...form, seniority: e.target.value as Seniority })
          }
        >
          {SENIORITIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <div className="sm:col-span-3">
        <Label>Postulaciones</Label>
        <NumberInput
          value={form.applications}
          onChange={(e) =>
            setForm({ ...form, applications: Number(e.target.value) || 0 })
          }
        />
      </div>
      <div className="sm:col-span-3">
        <Label>Presentados</Label>
        <NumberInput
          value={form.presented}
          onChange={(e) =>
            setForm({ ...form, presented: Number(e.target.value) || 0 })
          }
        />
      </div>
      <div className="sm:col-span-3">
        <Label>Confirmados</Label>
        <NumberInput
          value={form.confirmed}
          onChange={(e) =>
            setForm({ ...form, confirmed: Number(e.target.value) || 0 })
          }
        />
      </div>
      <div className="sm:col-span-3">
        <Label>Fecha (opcional)</Label>
        <TextInput
          type="date"
          value={form.date ?? ""}
          onChange={(e) => setForm({ ...form, date: e.target.value || null })}
        />
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

export function OpportunityEditor({
  weekId,
  opportunities,
  onChange,
}: {
  weekId: string;
  opportunities: OpportunityRow[];
  onChange: () => Promise<void> | void;
}) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-soft">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">Oportunidades</h3>
          <p className="text-xs text-slate-400">
            Búsquedas mostradas esta semana (suelen ser 2 a 4).
          </p>
        </div>
        {!adding && (
          <Button variant="outline" onClick={() => setAdding(true)}>
            + Agregar
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        {opportunities.length === 0 && !adding && (
          <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-sm text-slate-400">
            Sin oportunidades todavía.
          </p>
        )}

        {opportunities.map((o) =>
          editingId === o.id ? (
            <OpportunityForm
              key={o.id}
              initial={toInput(o)}
              submitLabel="Guardar cambios"
              onCancel={() => setEditingId(null)}
              onSubmit={async (input) => {
                await updateOpportunity(o.id, input);
                setEditingId(null);
                await onChange();
              }}
            />
          ) : (
            <div
              key={o.id}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 bg-white px-3.5 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800">
                  {o.role}{" "}
                  <span className="font-normal text-slate-400">· {o.company}</span>
                </p>
                <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                  <SeniorityBadge seniority={o.seniority} />
                  <span className="tabular-nums">
                    {fmt(o.applications)} post · {fmt(o.presented)} pres ·{" "}
                    {fmt(o.confirmed)} conf
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" onClick={() => setEditingId(o.id)}>
                  Editar
                </Button>
                <Button
                  variant="danger"
                  onClick={async () => {
                    if (!confirm(`¿Eliminar la oportunidad "${o.role}"?`)) return;
                    await deleteOpportunity(o.id);
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
          <OpportunityForm
            initial={EMPTY}
            submitLabel="Agregar oportunidad"
            onCancel={() => setAdding(false)}
            onSubmit={async (input) => {
              await insertOpportunity(weekId, input);
              setAdding(false);
              await onChange();
            }}
          />
        )}
      </div>
    </section>
  );
}
