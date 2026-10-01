"use client";

import { useState } from "react";
import clsx from "clsx";
import type { Task } from "@/lib/data";
import { Checklist } from "./checklist";

type Filter = "open" | "all";

/** Plain checklist with an Abiertas / Todas toggle. Tasks are already limited to the viewer's own. */
export function TaskList({ tasks, grouped = false }: { tasks: Task[]; grouped?: boolean }) {
  const [filter, setFilter] = useState<Filter>("open");
  const visible = filter === "open" ? tasks.filter((t) => t.status !== "completed") : tasks;
  return (
    <div>
      <div className="flex items-center gap-1 px-5 py-3 sm:px-6" role="group" aria-label="Filtrar tareas">
        <div className="flex gap-1 rounded-xl bg-navy-100 p-1">
          {([["open", "Abiertas"], ["all", "Todas"]] as const).map(([k, label]) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              aria-pressed={filter === k}
              className={clsx("rounded-lg px-3 py-1.5 text-sm", filter === k ? "bg-surface font-medium text-ink shadow-sm" : "text-ink-muted hover:text-ink")}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="border-t border-navy-100">
        <Checklist tasks={visible} grouped={grouped} limit={999} closedLimit={999} detail />
      </div>
    </div>
  );
}
