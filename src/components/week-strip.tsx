import Link from "next/link";
import clsx from "clsx";
import { Dots } from "./agenda";
import { allItems, groupByDate, monthKey, weekOf, WEEKDAYS_LONG, weekdayIndex } from "@/lib/calendar";
import { TODAY } from "@/lib/data";

export function WeekStrip() {
  const days = weekOf(TODAY);
  const by = groupByDate(allItems());
  return (
    <div className="grid grid-cols-7 gap-1.5 p-3 sm:gap-2 sm:p-4" role="list" aria-label="Semana actual">
      {days.map((d) => {
        const items = by.get(d) ?? [];
        const isToday = d === TODAY;
        const pending = items.filter((i) => !i.done).length;
        return (
          <Link
            key={d}
            role="listitem"
            href={`/calendar?m=${monthKey(d)}&d=${d}`}
            className={clsx(
              "flex flex-col items-center gap-1.5 rounded-2xl px-1 py-3 text-center transition",
              isToday
                ? "bg-navy text-white shadow-lg shadow-navy/30"
                : "bg-paper text-navy hover:bg-sky",
              d < TODAY && !isToday && "opacity-60",
            )}
            aria-label={`${WEEKDAYS_LONG[weekdayIndex(d)]} ${Number(d.slice(8))}, ${pending} pendientes`}
            aria-current={isToday ? "date" : undefined}
          >
            <span className={clsx("text-[11px] font-medium uppercase tracking-wide", isToday ? "text-accent" : "text-navy-200")}>
              {WEEKDAYS_LONG[weekdayIndex(d)]}
            </span>
            <span className="text-xl font-semibold tabular-nums leading-none sm:text-2xl">{Number(d.slice(8))}</span>
            {items.length ? <Dots items={items} max={3} /> : <span className="h-2" />}
          </Link>
        );
      })}
    </div>
  );
}
