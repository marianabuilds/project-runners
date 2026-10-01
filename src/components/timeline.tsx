import clsx from "clsx";
import type { TimelineEvent } from "@/lib/data";
import { daysFromToday, fmtDate, relativeDue } from "@/lib/format";

export function Timeline({ events }: { events: TimelineEvent[] }) {
  const nextIdx = events.findIndex((e) => daysFromToday(e.date) >= 0);
  return (
    <ol className="relative px-5 py-5 sm:px-6">
      {events.map((e, i) => {
        const past = daysFromToday(e.date) < 0;
        const next = i === nextIdx;
        return (
          <li key={e.id} className="relative flex gap-4 pb-6 last:pb-0">
            {i < events.length - 1 && (
              <span className={clsx("absolute left-[9px] top-6 h-full w-0.5", past ? "bg-navy" : "bg-navy-100")} aria-hidden />
            )}
            <span
              className={clsx(
                "relative z-10 mt-1 h-5 w-5 shrink-0 rounded-full border-2",
                past && "border-navy bg-navy",
                next && "border-navy bg-white ring-4 ring-sky",
                !past && !next && "border-navy-100 bg-white",
              )}
              aria-hidden
            />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
              <div>
                <p className={clsx("font-medium", past ? "text-navy-200" : "text-navy")}>
                  {e.name}
                  {next && <span className="ml-2 rounded-full bg-sky px-2 py-0.5 text-xs font-medium text-navy">Próxima</span>}
                </p>
                <p className="text-sm text-navy-200">{fmtDate(e.date)}</p>
              </div>
              <span className="text-sm text-navy-200">{past ? "Completada" : relativeDue(e.date)}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
