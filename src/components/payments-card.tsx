"use client";

import { useState } from "react";
import { Eye, EyeOff, Lock, Pencil } from "lucide-react";
import { Card, CardHeader } from "./ui";
import { mask, usePayments, validatePayments, type Payments } from "@/lib/payments";
import { useStore } from "@/lib/store";

const field = "mt-1 block w-full rounded-xl border border-navy-100 bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-navy focus:outline-none focus:ring-2 focus:ring-sky";

export function PaymentsCard({ className }: { className?: string }) {
  const { role } = useStore();
  const { value, save } = usePayments();
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Payments>(value);
  const [errors, setErrors] = useState<Partial<Record<keyof Payments, string>>>({});
  if (role !== "agent") return null; // never rendered for buyer/seller

  const rows: [string, string][] = [
    ["Titular", value.titular],
    ["Yape", value.yape],
    ["Banco", value.banco],
    [`Cuenta (${value.tipoCuenta})`, value.cuenta],
    ["CCI", value.cci],
  ];
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validatePayments(draft);
    setErrors(err);
    if (Object.keys(err).length) return;
    save(draft);
    setEditing(false);
  };
  const set = (k: keyof Payments) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setDraft({ ...draft, [k]: e.target.value });

  return (
    <Card className={className}>
      <CardHeader
        title="Pagos y cobros"
        subtitle="Yape y datos bancarios"
        icon={<span className="grid h-10 w-10 place-items-center rounded-xl bg-sky text-ink" aria-hidden><Lock className="h-5 w-5" /></span>}
        action={
          !editing && (
            <div className="flex gap-2">
              <button onClick={() => setShow((s) => !s)} aria-pressed={show} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-ink hover:bg-paper">
                {show ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />} {show ? "Ocultar" : "Mostrar"}
              </button>
              <button onClick={() => { setDraft(value); setErrors({}); setEditing(true); }} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-ink hover:bg-paper">
                <Pencil className="h-4 w-4" aria-hidden /> Editar
              </button>
            </div>
          )
        }
      />
      <div className="px-5 py-4 sm:px-6">
        <p className="mb-3 flex items-start gap-2 rounded-xl bg-accent/30 px-3 py-2 text-xs text-ink">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> Solo tú ves esto: no aparece en Actividad, notificaciones ni para nadie más. Demo: no ingreses datos reales.
        </p>
        {editing ? (
          <form onSubmit={submit} className="space-y-3" noValidate>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {([
                ["titular", "Titular", "Maricarmen Fransi"],
                ["yape", "Yape (9 dígitos)", "900000000"],
                ["banco", "Banco", "BCP"],
                ["cuenta", "Número de cuenta", "00000000000"],
                ["cci", "CCI (20 dígitos)", "00000000000000000000"],
              ] as const).map(([k, label, ph]) => (
                <div key={k} className={k === "titular" ? "sm:col-span-2" : undefined}>
                  <label htmlFor={`pay-${k}`} className="text-sm font-medium text-ink">{label}</label>
                  <input id={`pay-${k}`} value={draft[k]} onChange={set(k)} placeholder={ph} inputMode={k === "titular" || k === "banco" ? "text" : "numeric"} aria-invalid={!!errors[k]} className={field} />
                  {errors[k] && <p role="alert" className="mt-1 text-xs text-red-600 dark:text-red-400">{errors[k]}</p>}
                </div>
              ))}
              <div>
                <label htmlFor="pay-tipo" className="text-sm font-medium text-ink">Tipo de cuenta</label>
                <select id="pay-tipo" value={draft.tipoCuenta} onChange={set("tipoCuenta")} className={field}>
                  <option>Ahorros</option>
                  <option>Corriente</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(false)} className="rounded-xl px-4 py-2 text-sm font-medium text-ink hover:bg-paper">Cancelar</button>
              <button type="submit" className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-600">Guardar</button>
            </div>
          </form>
        ) : (
          <dl className="divide-y divide-navy-100 text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="text-ink-muted">{k}</dt>
                <dd className="font-semibold text-ink">{k === "Titular" || k === "Banco" ? v || "—" : show ? v || "—" : mask(v)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </Card>
  );
}
