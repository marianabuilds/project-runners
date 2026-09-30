import clsx from "clsx";
import { Check } from "lucide-react";
import type { TimelineEvent } from "@/lib/data";
import { daysFromToday, fmtDate, relativeDue } from "@/lib/format";

export function Timeline({ events }: { events: TimelineEvent[] }) {
  const nextIdx = events.findIndex((e) => daysFromToday(e.date) >= 0);
  return (
    <ol className="relative px-5 py-6 sm:px-7">
      {events.map((e, i) => {
        const past = daysFromToday(e.date) < 0;
        const next = i === nextIdx;
        return (
          <li key={e.id} className="relative flex gap-4 pb-7 last:pb-0">
            {i < events.length - 1 && (
              <span className={clsx("absolute left-[15px] top-8 h-full w-1", past ? "bg-cafe-600" : "bg-miel-200")} aria-hidden />
            )}
            <span
              className={clsx(
                "relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full",
                past && "bg-cafe-600 text-white",
                next && "bg-miel-300 ring-4 ring-cafe-600",
                !past && !next && "bg-white ring-2 ring-miel-200",
              )}
              aria-hidden
            >
              {past && <Check className="h-4 w-4" strokeWidth={3} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className={clsx("text-lg font-semibold", past ? "text-cafe-500" : "text-cafe-900")}>
                {e.name}
                {next && (
                  <span className="ml-2 inline-flex rounded-full bg-miel-300 px-3 py-0.5 align-middle text-sm font-semibold text-cafe-900">
                    Siguiente
                  </span>
                )}
              </p>
              <p className="mt-1 text-base text-cafe-700">
                {fmtDate(e.date)} · {past ? "Hecho" : relativeDue(e.date)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
