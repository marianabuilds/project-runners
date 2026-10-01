"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { taskCta } from "./ui";
import { TODAY, type TaskAction } from "@/lib/data";
import { shortAddress } from "@/lib/format";
import { useStore } from "@/lib/store";

const field = "mt-1 block w-full rounded-xl border border-navy-100 bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-navy focus:outline-none focus:ring-2 focus:ring-sky";

/** Manual override: add your own task. Most updates arrive from WhatsApp; this is the escape hatch. */
export function AddTask() {
  const { scoped, addTask } = useStore();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState(TODAY);
  const [action, setAction] = useState<TaskAction>("review");
  const [dealId, setDealId] = useState("");
  const [error, setError] = useState("");

  const targetDeal = scoped.isAll ? dealId || scoped.deals[0]?.id : scoped.deals[0]?.id;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError("Escribe un título.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(due)) return setError("Elige una fecha válida.");
    if (!targetDeal) return;
    addTask({ dealId: targetDeal, title: title.trim(), dueDate: due, action });
    setTitle("");
    setError("");
    setOpen(false);
  };

  if (!open) {
    return (
      <div className="border-t border-navy-100 px-5 py-3 sm:px-6">
        <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-ink-muted">
          <Plus className="h-4 w-4" aria-hidden /> Agregar tarea
        </button>
      </div>
    );
  }
  return (
    <form onSubmit={submit} className="space-y-3 border-t border-navy-100 px-5 py-4 sm:px-6" noValidate>
      <div>
        <label htmlFor="nt-title" className="text-sm font-medium text-ink">Tarea</label>
        <input id="nt-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Enviar planos al notario" className={field} autoFocus />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div>
          <label htmlFor="nt-due" className="text-sm font-medium text-ink">Fecha</label>
          <input id="nt-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="nt-action" className="text-sm font-medium text-ink">Acción</label>
          <select id="nt-action" value={action} onChange={(e) => setAction(e.target.value as TaskAction)} className={field}>
            {(Object.keys(taskCta) as TaskAction[]).map((k) => (
              <option key={k} value={k}>{taskCta[k].label}</option>
            ))}
          </select>
        </div>
        {scoped.isAll && (
          <div>
            <label htmlFor="nt-deal" className="text-sm font-medium text-ink">Negocio</label>
            <select id="nt-deal" value={targetDeal} onChange={(e) => setDealId(e.target.value)} className={field}>
              {scoped.deals.map((d) => (
                <option key={d.id} value={d.id}>{shortAddress(d)}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      {error && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={() => { setOpen(false); setError(""); }} className="rounded-xl px-4 py-2 text-sm font-medium text-ink hover:bg-paper">Cancelar</button>
        <button type="submit" className="rounded-xl bg-navy px-4 py-2 text-sm font-semibold text-white hover:bg-navy-600">Agregar</button>
      </div>
    </form>
  );
}
