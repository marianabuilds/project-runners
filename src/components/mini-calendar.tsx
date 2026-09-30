"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import clsx from "clsx";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, ListChecks } from "lucide-react";
import { EVENT_TYPES, TODAY } from "@/lib/data";
import { eventChip } from "@/lib/calendar-styles";
import type { CalDeal, CalEvent, CalTask } from "./calendar";
import { KindBadge } from "./ui";

const weekdays = ["L", "M", "M", "J", "V", "S", "D"];
const key = (d: Date) => format(d, "yyyy-MM-dd");
const dot: Record<string, string> = { offer: "bg-violet-500", inspection: "bg-amber-500", appraisal: "bg-sky-500", closing: "bg-emerald-600", custom: "bg-cafe-500" };

export function MiniCalendar({ events, tasks, deals }: { events: CalEvent[]; tasks: CalTask[]; deals: CalDeal[] }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date(TODAY + "T12:00:00")));
  const [selected, setSelected] = useState(TODAY);
  const dealMap = useMemo(() => new Map(deals.map((d) => [d.id, d])), [deals]);
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });
  const evOn = (d: string) => events.filter((e) => e.date === d);
  const tkOn = (d: string) => tasks.filter((t) => t.dueDate === d && !t.done);
  const selEvents = evOn(selected);
  const selTasks = tkOn(selected);

  return (
    <div>
      <div className="flex items-center justify-between gap-2 px-5 pt-5 sm:px-7">
        <button type="button" onClick={() => setMonth(addMonths(month, -1))} className="grid h-12 w-12 place-items-center rounded-2xl bg-miel-100 hover:bg-miel-200" aria-label="Mes anterior">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <p className="font-heading text-xl text-cafe-900 first-letter:uppercase">{format(month, "MMMM yyyy", { locale: es })}</p>
        <button type="button" onClick={() => setMonth(addMonths(month, 1))} className="grid h-12 w-12 place-items-center rounded-2xl bg-miel-100 hover:bg-miel-200" aria-label="Mes siguiente">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div className="px-3 pb-2 pt-4 sm:px-6">
        <div className="grid grid-cols-7 text-center text-sm font-semibold text-cafe-700" aria-hidden>
          {weekdays.map((w, i) => <div key={i} className="py-1">{w}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const k = key(d);
            const evs = evOn(k);
            const tks = tkOn(k).length;
            const inMonth = isSameMonth(d, month);
            const isSel = k === selected;
            const isToday = k === TODAY;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setSelected(k)}
                aria-pressed={isSel}
                aria-label={`${format(d, "d 'de' MMMM", { locale: es })}: ${evs.length} ${evs.length === 1 ? "evento" : "eventos"}`}
                className={clsx(
                  "flex min-h-[52px] flex-col items-center justify-start gap-1 rounded-2xl py-1.5 text-base transition-colors",
                  isSel ? "bg-cafe-600 text-white" : evs.length ? "bg-miel-100 hover:bg-miel-200" : "hover:bg-miel-50",
                  !inMonth && !isSel && "text-cafe-300",
                  inMonth && !isSel && "text-cafe-900",
                )}
              >
                <span className={clsx("grid h-7 w-7 place-items-center rounded-full font-semibold", isToday && !isSel && "bg-miel-300 text-cafe-900 ring-2 ring-cafe-600")}>{format(d, "d")}</span>
                <span className="flex h-2 items-center gap-0.5" aria-hidden>
                  {evs.slice(0, 3).map((e) => <span key={e.id} className={clsx("h-2 w-2 rounded-full", isSel ? "bg-white" : dot[e.type])} />)}
                  {evs.length === 0 && tks > 0 && <span className={clsx("h-1.5 w-1.5 rounded-full", isSel ? "bg-white/70" : "bg-cafe-300")} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-1 px-5 pb-3 text-sm text-cafe-700 sm:px-7" aria-label="Leyenda">
        {EVENT_TYPES.map((t) => <span key={t.key} className="flex items-center gap-1.5"><span className={clsx("h-2.5 w-2.5 rounded-full", dot[t.key])} />{t.label}</span>)}
      </div>

      <div className="border-t border-miel-100 px-5 py-5 sm:px-7" aria-live="polite">
        <h3 className="text-xl text-cafe-900 first-letter:uppercase">{format(new Date(selected + "T12:00:00"), "EEEE d 'de' MMMM", { locale: es })}</h3>
        {selEvents.length + selTasks.length === 0 && <p className="mt-2 text-lg text-cafe-700">No hay nada este día.</p>}
        <ul className="mt-3 space-y-3">
          {selEvents.map((e) => {
            const d = dealMap.get(e.dealId);
            return (
              <li key={e.id}>
                <Link href={`/ventas/${e.dealId}`} className="flex flex-wrap items-center gap-3 rounded-2xl bg-miel-50 px-4 py-3 hover:bg-miel-100">
                  <span className={clsx("rounded-full px-3 py-1 text-sm font-semibold", eventChip[e.type])}>{EVENT_TYPES.find((x) => x.key === e.type)?.label}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-semibold text-cafe-900">{e.name}</span>
                    <span className="block truncate text-base text-cafe-700">{d?.label}</span>
                  </span>
                  {d && <KindBadge kind={d.kind} />}
                </Link>
              </li>
            );
          })}
          {selTasks.map((t) => (
            <li key={t.id} className="flex items-center gap-3 rounded-2xl px-4 py-3 ring-1 ring-miel-200">
              <ListChecks className="h-5 w-5 shrink-0 text-cafe-600" aria-hidden />
              <span className="min-w-0 flex-1">
                <span className="block text-lg text-cafe-900">{t.title}</span>
                <span className="block truncate text-base text-cafe-700">Tarea · {dealMap.get(t.dealId)?.label}</span>
              </span>
            </li>
          ))}
        </ul>
        <Link href="/calendario" className="mt-4 inline-flex min-h-[48px] items-center gap-1 rounded-2xl px-3 text-lg font-semibold text-cafe-600 hover:bg-miel-100">
          Ver calendario completo <ChevronRight className="h-5 w-5" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
