"use client";

import { BellRing } from "lucide-react";
import type { Task } from "@/lib/data";
import { useStore } from "@/lib/store";
import { taskCta } from "./ui";

/** Action button matching the task (Subir, Firmar, Programar…). Only the owner (or the agent) can act; the agent can also nudge others. */
export function TaskCtaButton({ task }: { task: Task }) {
  const { role, setTaskDone, remind } = useStore();
  if (task.status === "completed") return null;
  const cta = taskCta[task.action];
  const canAct = role === "agent" || task.assignee === role;
  const canRemind = role === "agent" && task.assignee !== "agent";
  if (!canAct && !canRemind) return null;
  return (
    <div className="flex shrink-0 items-center gap-1.5">
      {canRemind && (
        <button
          type="button"
          onClick={() => remind(task.id)}
          aria-label={`Recordar: ${task.title}`}
          title="Enviar recordatorio"
          className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-navy ring-1 ring-navy/10 hover:brightness-95"
        >
          <BellRing className="h-4 w-4" aria-hidden />
        </button>
      )}
      {canAct && (
        <button
          type="button"
          onClick={() => setTaskDone(task.id, true)}
          aria-label={`${cta.label}: ${task.title}`}
          className="inline-flex items-center gap-1.5 rounded-xl bg-navy px-3 py-2 text-sm font-medium text-white hover:bg-navy-600"
        >
          <cta.Icon className="h-4 w-4" aria-hidden /> {cta.label}
        </button>
      )}
    </div>
  );
}
