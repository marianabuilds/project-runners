"use client";

import Link from "next/link";
import clsx from "clsx";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { AgendaRow, Dots, Legend } from "./agenda";
import { Card, CardHeader } from "./ui";
import { TODAY } from "@/lib/data";
import { allItems, groupByDate, monthGrid, monthKey, monthLabel, shiftMonth, WEEKDAYS_LONG } from "@/lib/calendar";
import { fmtLong } from "@/lib/format";
import { useStore } from "@/lib/store";

export function CalendarView({ ym, selected }: { ym: string; selected: string }) {
  const { visibleTasks, deals } = useStore();
  const grid = monthGrid(ym);
  const by = groupByDate(allItems(visibleTasks, deals.map((d) => d.id)));
  const sel = by.get(selected) ?? [];
  const monthItems = grid.filter((d) => monthKey(d) === ym).flatMap((d) => by.get(d) ?? []);
  const nav = (m: string) => `/calendar?m=${m}`;

  return (
    <div className="mx-auto max-w-7xl pb-10">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <header className="flex items-end justify-between gap-4 lg:col-span-12">
          <div>
            <p className="text-sm text-navy-200">Calendario · {monthItems.length} {monthItems.length === 1 ? "elemento" : "elementos"}</p>
            <h1 className="text-2xl font-semibold tracking-tight text-navy sm:text-3xl">{monthLabel(ym)}</h1>
          </div>
          <div className="flex items-center gap-1.5">
            <Link href={nav(monthKey(TODAY))} className="rounded-xl bg-white px-3 py-2 text-sm font-medium text-navy shadow-sm ring-1 ring-navy-100 hover:bg-sky">
              Hoy
            </Link>
            <Link href={nav(shiftMonth(ym, -1))} aria-label="Mes anterior" className="rounded-xl bg-white p-2 text-navy shadow-sm ring-1 ring-navy-100 hover:bg-sky">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <Link href={nav(shiftMonth(ym, 1))} aria-label="Mes siguiente" className="rounded-xl bg-navy p-2 text-white shadow-sm hover:bg-navy-600">
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </header>

        <Card className="lg:col-span-8">
          <div className="grid grid-cols-7 border-b border-navy-100 bg-paper text-center text-[11px] font-semibold uppercase tracking-wide text-navy-200">
            {WEEKDAYS_LONG.map((w) => (
              <div key={w} className="py-2.5">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-navy-100/60 p-px">
            {grid.map((d) => {
              const items = by.get(d) ?? [];
              const inMonth = monthKey(d) === ym;
              const isToday = d === TODAY;
              const isSel = d === selected;
              return (
                <Link
                  key={d}
                  href={`/calendar?m=${ym}&d=${d}`}
                  aria-label={`${Number(d.slice(8))}, ${items.length} elementos`}
                  aria-current={isToday ? "date" : undefined}
                  className={clsx(
                    "flex min-h-[3.75rem] flex-col items-center gap-1 p-1.5 transition sm:min-h-[5.5rem] sm:items-stretch",
                    inMonth ? "bg-white hover:bg-sky/60" : "bg-paper/80 text-navy-200",
                    isSel && "relative z-10 bg-sky ring-2 ring-navy",
                  )}
                >
                  <span className={clsx("grid h-7 w-7 place-items-center rounded-full text-sm font-medium tabular-nums", isToday ? "bg-navy text-accent" : inMonth ? "text-navy" : "text-navy-200")}>
                    {Number(d.slice(8))}
                  </span>
                  <span className="sm:hidden">{items.length > 0 && <Dots items={items} max={3} />}</span>
                  <span className="hidden flex-col gap-0.5 sm:flex">
                    {items.slice(0, 2).map((i) => (
                      <span
                        key={i.id}
                        className={clsx(
                          "truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium leading-tight",
                          i.overdue ? "bg-red-50 text-red-700" : i.kind === "event" ? "bg-navy text-white" : i.assignee === "buyer" ? "bg-accent text-navy" : i.assignee === "seller" ? "bg-emerald-50 text-emerald-700" : "bg-sky text-navy",
                          i.done && "opacity-50",
                        )}
                      >
                        {i.title}
                      </span>
                    ))}
                    {items.length > 2 && <span className="px-1 text-[10px] text-navy-200">+{items.length - 2} más</span>}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="border-t border-navy-100 bg-paper p-4">
            <Legend />
          </div>
        </Card>

        {/* Selected-day details: to the right on desktop, below on mobile */}
        <Card tone="sky" className="lg:sticky lg:top-6 lg:col-span-4 lg:self-start">
          <CardHeader
            tone="sky"
            title={selected === TODAY ? "Hoy" : fmtLong(selected)}
            subtitle={sel.length ? `${fmtLong(selected)} · ${sel.length} ${sel.length === 1 ? "elemento" : "elementos"}` : "Sin pendientes este día"}
            icon={<span className="grid h-10 w-10 place-items-center rounded-xl bg-navy text-white" aria-hidden><CalendarDays className="h-5 w-5" /></span>}
          />
          <div className="space-y-2 p-3 sm:p-4">
            {sel.length === 0 && <p className="rounded-2xl bg-white/70 p-4 text-sm text-navy-600">Día libre. Elige otro día en el calendario.</p>}
            {sel.map((i) => (
              <AgendaRow key={i.id} item={i} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
