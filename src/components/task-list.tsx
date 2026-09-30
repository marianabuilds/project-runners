"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import clsx from "clsx";
import { Check, Plus } from "lucide-react";
import type { Task } from "@/lib/data";
import { api } from "@/lib/client";
import { daysFromToday, relativeDue } from "@/lib/format";

type Tab = "open" | "done";

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
  const [tab, setTab] = useState<Tab>("open");
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [assignee, setAssignee] = useState<"agent" | "buyer">("agent");

  const open = items.filter((t) => t.status !== "completed");
  const done = items.filter((t) => t.status === "completed");
  const visible = (tab === "open" ? open : done).slice().sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const toggleDone = (t: Task) =>
    start(async () => {
      await api({ type: "task-status", id: t.id, status: t.status === "completed" ? "pending" : "completed" });
      router.refresh();
    });

  const addTask = () => {
    if (!title.trim() || !dealId) return;
    start(async () => {
      await api({ type: "task-add", dealId, title: title.trim(), assignee, dueDate: date || "2026-10-15" });
      setTitle("");
      setDate("");
      setAdding(false);
      router.refresh();
    });
  };

  const who = (t: Task) =>
    mode === "buyer"
      ? t.assignee === "buyer"
        ? "Lo haces tú"
        : "Lo hace tu agente"
      : t.assignee === "buyer"
        ? `Lo hace ${buyerName}`
        : "Lo haces tú";

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "open", label: "Por hacer", count: open.length },
    { key: "done", label: "Hechas", count: done.length },
  ];

  return (
    <div>
      <div className="flex gap-2 px-5 py-4 sm:px-7" role="group" aria-label="Mostrar pendientes">
        {tabs.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setTab(f.key)}
            aria-pressed={tab === f.key}
            className={clsx(
              "min-h-[48px] flex-1 whitespace-nowrap rounded-2xl px-4 text-lg font-semibold transition-colors sm:flex-none",
              tab === f.key ? "bg-cafe-600 text-white" : "bg-miel-100 text-cafe-800 hover:bg-miel-200",
            )}
          >
            {f.label} <span className={clsx("font-body", tab === f.key ? "text-miel-200" : "text-cafe-500")}>({f.count})</span>
          </button>
        ))}
      </div>

      <ul className="divide-y divide-miel-100 border-t border-miel-100">
        {visible.map((t) => {
          const isDone = t.status === "completed";
          const overdue = !isDone && daysFromToday(t.dueDate) < 0;
          const canComplete = mode === "agent" || t.assignee === "buyer";
          return (
            <li key={t.id} className="flex items-start gap-4 px-5 py-5 sm:px-7">
              <button
                type="button"
                onClick={() => canComplete && toggleDone(t)}
                disabled={!canComplete}
                aria-pressed={isDone}
                aria-label={isDone ? `Marcar “${t.title}” como no hecha` : `Marcar “${t.title}” como hecha`}
                title={isDone ? "Marcar como no hecha" : "Marcar como hecha"}
                className={clsx(
                  "grid h-12 w-12 shrink-0 place-items-center rounded-full border-[3px] transition-colors",
                  isDone
                    ? "border-green-700 bg-green-700 text-white hover:bg-green-800"
                    : "border-cafe-300 bg-white text-transparent hover:border-cafe-600 hover:bg-miel-50 hover:text-cafe-300",
                  !canComplete && "cursor-not-allowed opacity-40",
                )}
              >
                <Check className="h-6 w-6" strokeWidth={3} aria-hidden />
              </button>
              <div className="min-w-0 flex-1">
                <p className={clsx("text-lg font-semibold", isDone ? "text-cafe-500 line-through" : "text-cafe-900")}>{t.title}</p>
                {t.description && <p className="mt-1 text-base text-cafe-700">{t.description}</p>}
                <p className="mt-2 text-base text-cafe-700">
                  {who(t)} ·{" "}
                  <span className={clsx(overdue ? "font-bold text-red-700" : isDone ? "font-semibold text-green-800" : "text-cafe-700")}>
                    {isDone ? "Hecha" : relativeDue(t.dueDate)}
                  </span>
                </p>
              </div>
            </li>
          );
        })}
        {visible.length === 0 && (
          <li className="px-5 py-10 text-center text-lg text-cafe-700 sm:px-7">
            {tab === "open" ? (
              <>
                ¡Todo listo! No tienes pendientes. <span aria-hidden>🎉</span>
              </>
            ) : (
              "Todavía no hay nada hecho."
            )}
          </li>
        )}
      </ul>

      {mode === "agent" && dealId && (
        <div className="border-t border-miel-100 px-5 py-5 sm:px-7">
          {adding ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addTask();
              }}
              className="grid gap-3"
            >
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="¿Qué hay que hacer?"
                aria-label="Nueva tarea"
                className="min-h-[52px] rounded-2xl bg-white px-4 text-lg text-cafe-900 ring-2 ring-miel-200 placeholder:text-cafe-300 focus:outline-none focus:ring-4 focus:ring-cafe-600"
              />
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} aria-label="Fecha límite" className="min-h-[52px] rounded-2xl bg-white px-3 text-lg ring-2 ring-miel-200 focus:outline-none focus:ring-4 focus:ring-cafe-600" />
                <select value={assignee} onChange={(e) => setAssignee(e.target.value as "agent" | "buyer")} aria-label="¿Quién lo hace?" className="min-h-[52px] rounded-2xl bg-white px-3 text-lg ring-2 ring-miel-200 focus:outline-none focus:ring-4 focus:ring-cafe-600">
                  <option value="agent">Lo hago yo</option>
                  <option value="buyer">Lo hace el cliente</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="min-h-[52px] rounded-2xl bg-cafe-600 px-6 text-lg font-semibold text-white hover:bg-cafe-700">Agregar</button>
                <button type="button" onClick={() => setAdding(false)} className="min-h-[52px] rounded-2xl bg-miel-100 px-6 text-lg font-semibold text-cafe-900 hover:bg-miel-200">Cancelar</button>
              </div>
            </form>
          ) : (
            <button type="button" onClick={() => setAdding(true)} className="inline-flex min-h-[52px] items-center gap-2 rounded-2xl bg-miel-300 px-5 text-lg font-semibold text-cafe-900 hover:bg-miel-400">
              <Plus className="h-5 w-5" aria-hidden /> Agregar tarea
            </button>
          )}
        </div>
      )}
    </div>
  );
}
