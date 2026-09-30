"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import clsx from "clsx";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, startOfMonth, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, ListChecks, Plus } from "lucide-react";
import { EVENT_TYPES, TODAY, type DealKind, type EventType } from "@/lib/data";
import { api } from "@/lib/client";
import { KindBadge } from "./ui";

export type CalEvent = { id: string; name: string; date: string; type: EventType; dealId: string };
export type CalTask = { id: string; title: string; dueDate: string; dealId: string; done: boolean };
export type CalDeal = { id: string; label: string; kind: DealKind };

const chip: Record<EventType, string> = {
  offer: "bg-violet-100 text-violet-800",
  inspection: "bg-amber-100 text-amber-800",
  appraisal: "bg-sky-100 text-sky-800",
  closing: "bg-emerald-100 text-emerald-800",
  custom: "bg-miel-100 text-cafe-800",
};
const weekdays = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];
const key = (d: Date) => format(d, "yyyy-MM-dd");

export function Calendar({ events, tasks, deals }: { events: CalEvent[]; tasks: CalTask[]; deals: CalDeal[] }) {
  const router = useRouter();
  const [, start] = useTransition();
  const [month, setMonth] = useState(() => startOfMonth(new Date(TODAY + "T12:00:00")));
  const [selected, setSelected] = useState(TODAY);
  const [filter, setFilter] = useState<"all" | DealKind>("all");
  const [dealFilter, setDealFilter] = useState("all");
  const [form, setForm] = useState({ name: "", type: "custom" as EventType, dealId: deals[0]?.id ?? "" });

  const dealMap = useMemo(() => new Map(deals.map((d) => [d.id, d])), [deals]);
  const visible = (dealId: string) =>
    (filter === "all" || dealMap.get(dealId)?.kind === filter) && (dealFilter === "all" || dealId === dealFilter);

  const evs = useMemo(() => events.filter((e) => visible(e.dealId)), [events, filter, dealFilter]); // eslint-disable-line react-hooks/exhaustive-deps
  const tks = useMemo(() => tasks.filter((t) => visible(t.dealId)), [tasks, filter, dealFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });
  const byDay = (d: string) => ({ e: evs.filter((x) => x.date === d), t: tks.filter((x) => x.dueDate === d && !x.done) });
  const sel = byDay(selected);

  const monthEvents = evs.filter((e) => e.date.startsWith(format(month, "yyyy-MM"))).sort((a, b) => a.date.localeCompare(b.date));

  const add = () => {
    if (!form.name.trim() || !form.dealId) return;
    start(async () => {
      await api({ type: "event-add", dealId: form.dealId, name: form.name.trim(), date: selected, eventType: form.type });
      setForm((f) => ({ ...f, name: "" }));
      router.refresh();
    });
  };

  const Chips = ({ items }: { items: CalEvent[] }) => (
    <>
      {items.map((e) => (
        <li key={e.id} className={clsx("truncate rounded px-1.5 py-0.5 text-xs font-medium leading-tight", chip[e.type])}>{e.name}</li>
      ))}
    </>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <button onClick={() => setMonth(addMonths(month, -1))} className="rounded-xl p-2 hover:bg-white" aria-label="Mes anterior"><ChevronLeft className="h-5 w-5" /></button>
          <h2 className="min-w-40 text-center text-lg font-semibold capitalize text-cafe-900">{format(month, "MMMM yyyy", { locale: es })}</h2>
          <button onClick={() => setMonth(addMonths(month, 1))} className="rounded-xl p-2 hover:bg-white" aria-label="Mes siguiente"><ChevronRight className="h-5 w-5" /></button>
          <button onClick={() => { setMonth(startOfMonth(new Date(TODAY + "T12:00:00"))); setSelected(TODAY); }} className="ml-2 rounded-xl bg-white px-3 py-1.5 text-base font-medium ring-1 ring-miel-200 hover:bg-miel-50">Hoy</button>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-base">
          <div className="flex gap-1 rounded-xl bg-miel-100 p-1" role="group" aria-label="Tipo de operación">
            {(["all", "venta", "alquiler"] as const).map((k) => (
              <button key={k} aria-pressed={filter === k} onClick={() => setFilter(k)} className={clsx("rounded-xl px-3 py-1.5", filter === k ? "bg-white font-medium shadow-sm" : "text-cafe-800")}>
                {k === "all" ? "Todas" : k === "venta" ? "Ventas" : "Alquileres"}
              </button>
            ))}
          </div>
          <select value={dealFilter} onChange={(e) => setDealFilter(e.target.value)} aria-label="Filtrar por venta" className="rounded-xl border border-miel-200 bg-white px-2 py-2">
            <option value="all">Todas las propiedades</option>
            {deals.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-sm text-cafe-800" aria-label="Leyenda">
        {EVENT_TYPES.map((t) => <span key={t.key} className="flex items-center gap-1.5"><span className={clsx("h-2.5 w-2.5 rounded-sm", chip[t.key])} />{t.label}</span>)}
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-miel-1000" />Tarea con vencimiento</span>
      </div>

      {/* Grid (sm+) */}
      <div className="hidden overflow-hidden rounded-2xl bg-white ring-1 ring-miel-200 sm:block">
        <div className="grid grid-cols-7 border-b border-miel-100 bg-miel-50 text-center text-sm font-medium uppercase tracking-wide text-cafe-700">
          {weekdays.map((w) => <div key={w} className="py-2">{w}</div>)}
        </div>
        <div className="grid grid-cols-7">
          {days.map((d) => {
            const k = key(d);
            const { e, t } = byDay(k);
            const inMonth = isSameMonth(d, month);
            const isSel = k === selected;
            return (
              <button
                key={k}
                onClick={() => setSelected(k)}
                aria-label={`${format(d, "d 'de' MMMM", { locale: es })}: ${e.length} eventos, ${t.length} tareas`}
                aria-pressed={isSel}
                className={clsx("min-h-24 border-b border-r border-miel-100 p-1.5 text-left align-top hover:bg-miel-50", !inMonth && "bg-miel-50 text-cafe-500", isSel && "bg-miel-100 ring-2 ring-inset ring-cafe-600")}
              >
                <span className={clsx("mb-1 grid h-6 w-6 place-items-center rounded-full text-sm font-medium", k === TODAY && "bg-cafe-600 text-white")}>{format(d, "d")}</span>
                <ul className="space-y-0.5">
                  <Chips items={e.slice(0, 2)} />
                </ul>
                <div className="mt-0.5 flex items-center gap-1 text-[10px] text-cafe-700">
                  {e.length > 2 && <span>+{e.length - 2}</span>}
                  {t.length > 0 && <><span className="h-2 w-2 rounded-full bg-miel-1000" />{t.length}</>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Agenda (mobile) */}
      <ul className="space-y-2 sm:hidden">
        {monthEvents.length === 0 && <li className="rounded-xl bg-white p-4 text-base text-cafe-700 ring-1 ring-miel-200">Sin eventos este mes.</li>}
        {monthEvents.map((e) => (
          <li key={e.id}>
            <button onClick={() => setSelected(e.date)} className={clsx("flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left ring-1", selected === e.date ? "ring-cafe-600" : "ring-miel-200")}>
              <span className="w-10 text-center leading-none"><span className="block text-lg font-semibold">{e.date.slice(8)}</span><span className="text-[10px] uppercase text-cafe-700">{format(new Date(e.date + "T12:00:00"), "MMM", { locale: es })}</span></span>
              <span className="min-w-0 flex-1"><span className="block truncate font-medium text-cafe-900">{e.name}</span><span className="block truncate text-sm text-cafe-700">{dealMap.get(e.dealId)?.label}</span></span>
              <span className={clsx("rounded px-1.5 py-0.5 text-xs font-medium", chip[e.type])}>{EVENT_TYPES.find((x) => x.key === e.type)?.label}</span>
            </button>
          </li>
        ))}
      </ul>

      {/* Day panel */}
      <section className="rounded-2xl bg-white p-5 ring-1 ring-miel-200" aria-label="Detalle del día">
        <h3 className="text-base font-semibold text-cafe-900 first-letter:uppercase">{format(new Date(selected + "T12:00:00"), "EEEE d 'de' MMMM", { locale: es })}</h3>
        {sel.e.length + sel.t.length === 0 && <p className="mt-2 text-base text-cafe-700">Nada agendado este día.</p>}
        <ul className="mt-3 divide-y divide-miel-100">
          {sel.e.map((e) => (
            <li key={e.id} className="flex items-center gap-3 py-2.5">
              <span className={clsx("rounded px-1.5 py-0.5 text-xs font-medium", chip[e.type])}>{EVENT_TYPES.find((x) => x.key === e.type)?.label}</span>
              <span className="min-w-0 flex-1"><span className="block font-medium text-cafe-900">{e.name}</span><span className="block truncate text-sm text-cafe-700">{dealMap.get(e.dealId)?.label}</span></span>
              {dealMap.get(e.dealId) && <KindBadge kind={dealMap.get(e.dealId)!.kind} />}
            </li>
          ))}
          {sel.t.map((t) => (
            <li key={t.id} className="flex items-center gap-3 py-2.5">
              <ListChecks className="h-4 w-4 text-cafe-600" aria-hidden />
              <span className="min-w-0 flex-1"><span className="block text-cafe-900">{t.title}</span><span className="block truncate text-sm text-cafe-700">Tarea · {dealMap.get(t.dealId)?.label}</span></span>
            </li>
          ))}
        </ul>
        <form onSubmit={(ev) => { ev.preventDefault(); add(); }} className="mt-4 flex flex-wrap items-center gap-2 border-t border-miel-100 pt-4">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nuevo evento para este día…" aria-label="Nombre del evento" className="min-w-0 flex-1 rounded-xl border border-miel-200 px-3 py-2 text-base" />
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as EventType })} aria-label="Tipo de evento" className="rounded-xl border border-miel-200 px-2 py-2 text-base">
            {EVENT_TYPES.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
          </select>
          <select value={form.dealId} onChange={(e) => setForm({ ...form, dealId: e.target.value })} aria-label="Propiedad" className="rounded-xl border border-miel-200 px-2 py-2 text-base">
            {deals.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
          </select>
          <button type="submit" className="flex items-center gap-1.5 rounded-xl bg-cafe-600 px-3 py-2 text-base font-medium text-white hover:bg-cafe-700"><Plus className="h-4 w-4" aria-hidden /> Evento</button>
        </form>
      </section>
    </div>
  );
}
