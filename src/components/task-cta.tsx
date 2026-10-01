"use client";

import type { Task } from "@/lib/data";
import { useStore } from "@/lib/store";
import { taskCta } from "./ui";

/** Action button matching the task (Subir, Firmar, Programar…). Only the owner sees and uses it. */
export function TaskCtaButton({ task }: { task: Task }) {
  const { role, setTaskDone } = useStore();
  if (task.status === "completed" || task.assignee !== role) return null;
  const cta = taskCta[task.action];
  return (
    <button
      type="button"
      onClick={() => setTaskDone(task.id, true)}
      aria-label={`${cta.label}: ${task.title}`}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-navy px-3 py-2 text-sm font-medium text-white hover:bg-navy-600"
    >
      <cta.Icon className="h-4 w-4" aria-hidden /> {cta.label}
    </button>
  );
}
