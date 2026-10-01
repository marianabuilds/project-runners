"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { Check, Plus } from "lucide-react";
import type { Task, TaskStatus } from "@/lib/data";
import { dealById } from "@/lib/data";
import { daysFromToday, relativeDue } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Badge, ownerBadge } from "./agenda";
import { TaskCtaButton } from "./task-cta";
import { StatusPill } from "./ui";

type Filter = "all" | "buyer" | "seller" | "agent" | "open";
type Sort = "due" | "status";

const statusOrder: Record<TaskStatus, number> = { in_progress: 0, pending: 1, completed: 2 };

/** Tasks come from the shared store (already scoped to the viewer's role); pass `tasks` to render a subset (e.g. one deal). */
export function TaskList({ tasks }: { tasks: Task[] }) {
  const { role, setTaskDone, completeMany } = useStore();
  const [filter, setFilter] = useState<Filter>(role === "agent" ? "all" : "open");
  const [sort, setSort] = useState<Sort>("due");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visible = useMemo(() => {
    const f = tasks.filter((t) => (filter === "all" ? true : filter === "open" ? t.status !== "completed" : t.assignee === filter));
    return [...f].sort((a, b) => (sort === "due" ? a.dueDate.localeCompare(b.dueDate) : statusOrder[a.status] - statusOrder[b.status]));
  }, [tasks, filter, sort]);

  const toggleSelect = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });

  const bulkComplete = () => {
    completeMany(Array.from(selected));
    setSelected(new Set());
  };

  const filters: { key: Filter; label: string }[] =
    role === "agent"
      ? [
          { key: "all", label: "Todos" },
          { key: "open", label: "Abiertos" },
          { key: "buyer", label: "Comprador" },
          { key: "seller", label: "Vendedor" },
          { key: "agent", label: "Agente" },
        ]
      : [
          { key: "open", label: "Por hacer" },
          { key: "all", label: "Todos" },
        ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 sm:px-6">
        <div className="flex flex-wrap gap-1 rounded-xl bg-navy-100 p-1" role="group" aria-label="Filtrar tareas">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={clsx("rounded-lg px-3 py-1.5 text-sm", filter === f.key ? "bg-white font-medium text-navy shadow-sm" : "text-navy-200 hover:text-navy")}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {role === "agent" && selected.size > 0 && (
            <button onClick={bulkComplete} className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700">
              Marcar {selected.size} completadas
            </button>
          )}
          <label className="flex items-center gap-2 text-sm text-navy-200">
            <span className="sr-only sm:not-sr-only">Ordenar</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-lg border border-navy-100 bg-white px-2 py-1.5 text-sm text-navy">
              <option value="due">Fecha de vencimiento</option>
              <option value="status">Estado</option>
            </select>
          </label>
        </div>
      </div>

      <ul className="divide-y divide-navy-100 border-t border-navy-100">
        {visible.map((t) => {
          const done = t.status === "completed";
          const overdue = !done && daysFromToday(t.dueDate) < 0;
          const canToggle = role === "agent" || t.assignee === role;
          const deal = dealById(t.dealId);
          return (
            <li key={t.id} className="flex flex-wrap items-start gap-3 px-5 py-4 sm:flex-nowrap sm:px-6">
              {role === "agent" && (
                <input
                  type="checkbox"
                  checked={selected.has(t.id)}
                  onChange={() => toggleSelect(t.id)}
                  disabled={done}
                  aria-label={`Seleccionar “${t.title}”`}
                  className="mt-2.5 h-4 w-4 rounded border-navy-100 text-navy disabled:opacity-30"
                />
              )}
              <button
                onClick={() => canToggle && setTaskDone(t.id, !done)}
                disabled={!canToggle}
                aria-label={done ? `Reabrir “${t.title}”` : `Marcar “${t.title}” como hecha`}
                className={clsx(
                  "mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
                  done ? "border-emerald-500 bg-emerald-500 text-white" : "border-navy-100 hover:border-emerald-500",
                  !canToggle && "cursor-not-allowed opacity-40",
                )}
              >
                {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </button>
              <div className="min-w-0 flex-1">
                <p className={clsx("font-medium", done ? "text-navy-200 line-through" : "text-navy")}>{t.title}</p>
                {t.description && <p className="mt-0.5 text-sm text-navy-200">{t.description}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
                  <StatusPill status={t.status} />
                  {overdue && <Badge kind="atrasada" />}
                  <Badge kind={ownerBadge(t.assignee, role)} />
                  {deal && role === "agent" && <span className="text-navy-200">{deal.address.street} {deal.address.number}</span>}
                </div>
              </div>
              <span className={clsx("shrink-0 pt-0.5 text-sm", overdue ? "font-medium text-red-600" : "text-navy-200")}>
                {done ? "Hecho" : relativeDue(t.dueDate)}
              </span>
              <TaskCtaButton task={t} />
            </li>
          );
        })}
        {visible.length === 0 && <li className="px-6 py-10 text-center text-sm text-navy-200">Nada aquí. 🎉</li>}
      </ul>

      {role === "agent" && (
        <div className="border-t border-navy-100 px-5 py-3 sm:px-6">
          <button className="flex items-center gap-1.5 text-sm font-medium text-navy hover:text-navy">
            <Plus className="h-4 w-4" aria-hidden /> Agregar tarea
          </button>
        </div>
      )}
    </div>
  );
}
