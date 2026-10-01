"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { AgendaRow, Dots, Legend } from "./agenda";
import { allItems, groupByDate, weekOf, WEEKDAYS_LONG, weekdayIndex } from "@/lib/calendar";
import { TODAY } from "@/lib/data";
import { useStore } from "@/lib/store";
import { fmtLong } from "@/lib/format";

export function WeekStrip() {
  const days = weekOf(TODAY);
  const { scoped } = useStore();
  const by = useMemo(() => groupByDate(allItems(scoped.tasks, scoped.deals.map((d) => d.id))), [scoped.tasks, scoped.deals]);
  const [selected, setSelected] = useState(TODAY);
  const items = by.get(selected) ?? [];

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5 p-3 sm:gap-2 sm:p-4" role="group" aria-label="Semana actual">
        {days.map((d) => {
          const dayItems = by.get(d) ?? [];
          const isToday = d === TODAY;
          const isSelected = d === selected;
          const pending = dayItems.filter((i) => !i.done).length;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setSelected(d)}
              aria-pressed={isSelected}
              aria-current={isToday ? "date" : undefined}
              aria-label={`${WEEKDAYS_LONG[weekdayIndex(d)]} ${Number(d.slice(8))}, ${pending} pendientes`}
              className={clsx(
                "flex flex-col items-center gap-1.5 rounded-2xl px-1 py-3 text-center transition",
                isSelected ? "bg-navy text-white shadow-lg shadow-navy/30 ring-2 ring-accent" : "bg-paper text-ink hover:bg-sky",
                d < TODAY && !isSelected && "opacity-60",
              )}
            >
              <span className={clsx("text-[11px] font-medium uppercase tracking-wide", isSelected ? "text-accent" : "text-ink-muted")}>
                {WEEKDAYS_LONG[weekdayIndex(d)]}
              </span>
              <span className="text-xl font-semibold tabular-nums leading-none sm:text-2xl">{Number(d.slice(8))}</span>
              {dayItems.length ? <Dots items={dayItems} max={3} /> : <span className="h-2" />}
            </button>
          );
        })}
      </div>
      <div className="space-y-2 border-t border-navy-100 bg-paper/70 p-3 sm:p-4" aria-live="polite">
        <p className="mb-2 mt-1 px-1 text-xs font-semibold uppercase tracking-wide text-ink-muted">
          {selected === TODAY ? "Hoy" : fmtLong(selected)} · {items.length} {items.length === 1 ? "elemento" : "elementos"}
        </p>
        {items.length === 0 && <p className="p-3 text-sm text-ink-muted">Nada programado este día.</p>}
        {items.map((i) => (
          <AgendaRow key={i.id} item={i} />
        ))}
        <div className="px-1 pt-2">
          <Legend />
        </div>
      </div>
    </div>
  );
}
