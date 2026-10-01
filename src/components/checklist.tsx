"use client";

import clsx from "clsx";
import { Check } from "lucide-react";
import { TaskCtaButton } from "./task-cta";
import { dealById, type Task } from "@/lib/data";
import { daysFromToday, relativeDue, shortAddress } from "@/lib/format";
import { useStore } from "@/lib/store";

function Row({ t, showDeal, detail }: { t: Task; showDeal: boolean; detail?: boolean }) {
  const { setTaskDone } = useStore();
  const done = t.status === "completed";
  const late = !done && daysFromToday(t.dueDate) < 0;
  const deal = dealById(t.dealId);
  return (
    <li className="flex items-center gap-3 py-3">
      <button
        type="button"
        onClick={() => setTaskDone(t.id, !done)}
        aria-label={done ? `Reabrir “${t.title}”` : `Marcar “${t.title}” como hecha`}
        className={clsx(
          "grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 transition-colors",
          done ? "border-navy bg-navy text-white" : "border-navy-200 hover:border-navy",
        )}
      >
        {done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={clsx("truncate font-medium", done ? "text-ink-muted line-through" : "text-ink")}>{t.title}</p>
        <p className="truncate text-xs text-ink-muted">
          {showDeal && deal && <>{shortAddress(deal)} · </>}
          {t.manual && <span className="mr-1 rounded bg-navy-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink-soft">Manual</span>}
          <span className={clsx(late && "font-medium text-red-600 dark:text-red-400")}>{done ? "Hecho" : relativeDue(t.dueDate)}</span>
        </p>
        {detail && t.description && <p className="mt-0.5 text-sm text-ink-muted">{t.description}</p>}
      </div>
      <TaskCtaButton task={t} />
    </li>
  );
}

/** Plain checklist: open tasks by due date, then a few completed. `grouped` splits by negocio (consolidated view). */
export function Checklist({ tasks, grouped = false, limit = 8, closedLimit = 3, detail = false }: { tasks: Task[]; grouped?: boolean; limit?: number; closedLimit?: number; detail?: boolean }) {
  const open = tasks.filter((t) => t.status !== "completed").sort((a, b) => a.dueDate.localeCompare(b.dueDate)).slice(0, limit);
  const closed = tasks.filter((t) => t.status === "completed").slice(0, closedLimit);
  if (!open.length && !closed.length) return <p className="px-5 py-8 text-center text-sm text-ink-muted">Todo al día. 🎉</p>;

  if (grouped) {
    const ids = Array.from(new Set([...open, ...closed].map((t) => t.dealId)));
    return (
      <div className="px-5 pb-2 sm:px-6">
        {ids.map((id) => {
          const d = dealById(id)!;
          return (
            <section key={id}>
              <h3 className="pb-1 pt-4 text-xs font-semibold uppercase tracking-wide text-ink-muted">{shortAddress(d)}</h3>
              <ul className="divide-y divide-navy-100">
                {[...open, ...closed].filter((t) => t.dealId === id).map((t) => (
                  <Row key={t.id} t={t} showDeal={false} detail={detail} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    );
  }
  return (
    <ul className="divide-y divide-navy-100 px-5 sm:px-6">
      {[...open, ...closed].map((t) => (
        <Row key={t.id} t={t} showDeal={false} detail={detail} />
      ))}
    </ul>
  );
}
