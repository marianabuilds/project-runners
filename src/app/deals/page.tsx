"use client";

import Link from "next/link";
import clsx from "clsx";
import { CalendarClock, ChevronRight, ListChecks, Plus } from "lucide-react";
import { Avatar, Card, StageBadge } from "@/components/ui";
import { STAGES } from "@/lib/data";
import { useStore } from "@/lib/store";
import { daysFromToday, fmtShort, pen, shortAddress, stageIndex } from "@/lib/format";

export default function DealsPage() {
  const { role, deals, visibleTasks } = useStore();
  return (
    <div className="mx-auto max-w-7xl pb-10">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <header className="flex items-end justify-between gap-4 lg:col-span-12">
          <div>
            <p className="text-sm text-ink-muted">{deals.length} {deals.length === 1 ? "negocio activo" : "negocios activos"}</p>
            <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{role === "agent" ? "Negocios" : role === "buyer" ? "Mi compra" : "Mi propiedad"}</h1>
          </div>
          {role === "agent" && (
            <Link href="/deals/new" className="flex items-center gap-1.5 rounded-xl bg-navy px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-navy/20 hover:bg-navy-600">
              <Plus className="h-4 w-4" aria-hidden /> Nuevo negocio
            </Link>
          )}
        </header>

        {deals.map((d, n) => {
          const open = visibleTasks.filter((t) => t.dealId === d.id && t.status !== "completed");
          const late = open.filter((t) => daysFromToday(t.dueDate) < 0).length;
          const idx = stageIndex(d.stage);
          const tone = n % 2 === 0 ? "white" : "sky";
          return (
            <Link key={d.id} href={`/deals/${d.id}`} className="group block lg:col-span-6">
              <Card tone={tone} className="h-full p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-xl sm:p-6">
                <div className="flex items-start gap-4">
                  <Avatar initials={d.buyer.initials} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h2 className="truncate text-lg font-semibold text-ink">{shortAddress(d)}</h2>
                      <StageBadge stage={d.stage} />
                    </div>
                    <p className="truncate text-sm text-ink-soft">
                      {d.address.district}, {d.address.province} · {role === "seller" ? "Comprador interesado" : d.buyer.name}
                    </p>
                  </div>
                  <ChevronRight className="mt-1 hidden h-5 w-5 shrink-0 text-ink-muted transition group-hover:translate-x-0.5 sm:block" aria-hidden />
                </div>

                <ol className="mt-5 grid grid-cols-5 gap-1.5" aria-label="Etapas">
                  {STAGES.map((s, i) => (
                    <li key={s.key} className="min-w-0">
                      <div className={clsx("h-1.5 rounded-full", i <= idx ? "bg-navy" : tone === "sky" ? "bg-surface/70" : "bg-navy-100")} />
                      <p className={clsx("mt-1.5 truncate text-[10px] sm:text-xs", i === idx ? "font-semibold text-ink" : "text-ink-muted")}>{s.label}</p>
                    </li>
                  ))}
                </ol>

                <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-2xl bg-navy p-3 text-white">
                    <p className="text-xs text-white/60">Precio</p>
                    <p className="mt-0.5 font-semibold tabular-nums">{pen(d.pricePen, 0)}</p>
                  </div>
                  <div className={clsx("rounded-2xl p-3", late ? "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300" : "bg-accent/40 text-ink")}>
                    <p className={clsx("flex items-center gap-1 text-xs", late ? "text-red-600 dark:text-red-400" : "text-ink-soft")}>
                      <ListChecks className="h-3.5 w-3.5" aria-hidden /> Tareas
                    </p>
                    <p className="mt-0.5 font-semibold tabular-nums">
                      {open.length} abiertas{late > 0 && ` · ${late} atrasadas`}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-surface/80 p-3 ring-1 ring-navy/5">
                    <p className="flex items-center gap-1 text-xs text-ink-muted">
                      <CalendarClock className="h-3.5 w-3.5" aria-hidden /> Cierre
                    </p>
                    <p className="mt-0.5 font-semibold text-ink">{fmtShort(d.targetCloseDate)}</p>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
