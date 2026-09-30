"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import clsx from "clsx";
import { Check, Plus } from "lucide-react";
import type { Task, TaskStatus } from "@/lib/data";
import { api } from "@/lib/client";
import { daysFromToday, relativeDue } from "@/lib/format";
import { StatusPill } from "./ui";

type Filter = "all" | "buyer" | "agent" | "open";
type Sort = "due" | "status";

const statusOrder: Record<TaskStatus, number> = { in_progress: 0, pending: 1, completed: 2 };

export function TaskList({
  initial,
  buyerName,
  dealId,
  mode = "agent",
}: {
  initial: Task[];
  buyerName: string;
  dealId?: string;
  mode?: "agent" | "buyer";
}) {
  const router = useRouter();
  const [, start] = useTransition();
  const items = initial;
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newAssignee, setNewAssignee] = useState<"agent" | "buyer">("agent");
  const [filter, setFilter] = useState<Filter>(mode === "buyer" ? "open" : "all");
  const [sort, setSort] = useState<Sort>("due");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    const f = items.filter((t) =>
      filter === "all" ? true : filter === "open" ? t.status !== "completed" : t.assignee === filter,
    );
    return f.sort((a, b) =>
      sort === "due" ? a.dueDate.localeCompare(b.dueDate) : statusOrder[a.status] - statusOrder[b.status],
    );
  }, [items, filter, sort]);

  const setStatus = (ids: string[], status: TaskStatus) =>
    start(async () => {
      await Promise.all(ids.map((id) => api({ type: "task-status", id, status })));
      router.refresh();
    });

  const toggleDone = (t: Task) => setStatus([t.id], t.status === "completed" ? "pending" : "completed");

  const submitTask = () => {
    if (!newTitle.trim() || !dealId) return;
    start(async () => {
      await api({ type: "task-add", dealId, title: newTitle.trim(), assignee: newAssignee, dueDate: newDate || "2026-10-15" });
      setNewTitle("");
      setNewDate("");
      setAdding(false);
      router.refresh();
    });
  };

  const toggleSelect = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const bulkComplete = () => {
    setStatus(Array.from(selected), "completed");
    setSelected(new Set());
  };

  const filters: { key: Filter; label: string }[] =
    mode === "buyer"
      ? [
          { key: "open", label: "Por hacer" },
          { key: "all", label: "Todas" },
        ]
      : [
          { key: "all", label: "Todas" },
          { key: "open", label: "Abiertas" },
          { key: "buyer", label: "Comprador" },
          { key: "agent", label: "Agente" },
        ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-6">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1" role="group" aria-label="Filtrar tareas">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={clsx(
                "rounded-lg px-3 py-1.5 text-sm",
                filter === f.key ? "bg-white font-medium text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {mode === "agent" && selected.size > 0 && (
            <button onClick={bulkComplete} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">
              Completar {selected.size}
            </button>
          )}
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <span className="sr-only sm:not-sr-only">Orden</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm"
            >
              <option value="due">Fecha</option>
              <option value="status">Estado</option>
            </select>
          </label>
        </div>
      </div>

      <ul className="divide-y divide-slate-100 border-t border-slate-100">
        {visible.map((t) => {
          const done = t.status === "completed";
          const overdue = !done && daysFromToday(t.dueDate) < 0;
          const canComplete = mode === "agent" || t.assignee === "buyer";
          return (
            <li key={t.id} className="flex items-start gap-3 px-5 py-4 sm:px-6">
              {mode === "agent" && (
                <input
                  type="checkbox"
                  checked={selected.has(t.id)}
                  onChange={() => toggleSelect(t.id)}
                  disabled={done}
                  aria-label={`Seleccionar “${t.title}”`}
                  className="mt-2.5 h-4 w-4 rounded border-slate-300 text-blue-600 disabled:opacity-30"
                />
              )}
              <button
                onClick={() => canComplete && toggleDone(t)}
                disabled={!canComplete}
                aria-label={done ? `Reabrir “${t.title}”` : `Completar “${t.title}”`}
                className={clsx(
                  "mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
                  done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 hover:border-emerald-500",
                  !canComplete && "cursor-not-allowed opacity-40",
                )}
              >
                {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={clsx("font-medium", done ? "text-slate-400 line-through" : "text-slate-900")}>{t.title}</p>
                {t.description && <p className="mt-0.5 text-sm text-slate-500">{t.description}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                  <StatusPill status={t.status} />
                  <span className="text-slate-500">
                    {t.assignee === "buyer" ? (mode === "buyer" ? "Tú" : buyerName) : mode === "buyer" ? "Tu agente" : "Tú"}
                  </span>
                </div>
              </div>
              <span className={clsx("shrink-0 pt-0.5 text-sm", overdue ? "font-medium text-red-600" : "text-slate-500")}>
                {done ? "Hecha" : relativeDue(t.dueDate)}
              </span>
            </li>
          );
        })}
        {visible.length === 0 && <li className="px-6 py-10 text-center text-sm text-slate-500">Nada por aquí. 🎉</li>}
      </ul>

      {mode === "agent" && dealId && (
        <div className="border-t border-slate-100 px-5 py-3 sm:px-6">
          {adding ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitTask();
              }}
              className="flex flex-wrap items-center gap-2"
            >
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Nueva tarea…"
                aria-label="Título de la tarea"
                className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm"
              />
              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} aria-label="Fecha límite" className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm" />
              <select value={newAssignee} onChange={(e) => setNewAssignee(e.target.value as "agent" | "buyer")} aria-label="Responsable" className="rounded-lg border border-slate-200 px-2 py-1.5 text-sm">
                <option value="agent">Agente</option>
                <option value="buyer">Comprador</option>
              </select>
              <button type="submit" className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">Agregar</button>
              <button type="button" onClick={() => setAdding(false)} className="rounded-lg px-2 py-1.5 text-sm text-slate-600 hover:bg-slate-100">Cancelar</button>
            </form>
          ) : (
            <button onClick={() => setAdding(true)} className="flex items-center gap-1.5 text-sm font-medium text-blue-700 hover:text-blue-800">
              <Plus className="h-4 w-4" aria-hidden /> Agregar tarea
            </button>
          )}
        </div>
      )}
    </div>
  );
}
