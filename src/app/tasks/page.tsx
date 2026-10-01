"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import clsx from "clsx";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ProgressRing, StackedBar } from "@/components/charts";
import { TaskList } from "@/components/task-list";
import { Card, CardHeader, StageBadge } from "@/components/ui";
import { useStore } from "@/lib/store";
import { daysFromToday, pen, relativeDue, shortAddress } from "@/lib/format";

export default function TasksPage() {
  const { role, deals, visibleTasks } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const active = deals.find((d) => d.id === activeId) ?? deals[0];
  const tasksOf = (id: string) => visibleTasks.filter((t) => t.dealId === id);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const n = (i + (e.key === "ArrowRight" ? 1 : -1) + deals.length) % deals.length;
    setActiveId(deals[n].id);
    tabRefs.current[n]?.focus();
  };

  if (!active) return null;
  const ts = tasksOf(active.id);
  const done = ts.filter((t) => t.status === "completed").length;
  const inProgress = ts.filter((t) => t.status === "in_progress").length;
  const open = ts.filter((t) => t.status !== "completed").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const late = open.filter((t) => daysFromToday(t.dueDate) < 0).length;
  const next = open[0];

  return (
    <div className="mx-auto max-w-7xl pb-10">
      <PageHeader title="Tareas" subtitle={role === "agent" ? "Un negocio a la vez, cada tarea con su acción" : "Tus tareas y las de tu agente en este negocio"} />

      {/* One tab per negocio */}
      <div className="-mx-1 mb-5 overflow-x-auto px-1 pb-1">
        <div role="tablist" aria-label="Negocios" className="flex w-max gap-2">
          {deals.map((d, i) => {
            const isActive = d.id === active.id;
            const dOpen = tasksOf(d.id).filter((t) => t.status !== "completed");
            const dLate = dOpen.some((t) => daysFromToday(t.dueDate) < 0);
            return (
              <button
                key={d.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`tab-${d.id}`}
                aria-selected={isActive}
                aria-controls={`panel-${d.id}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveId(d.id)}
                onKeyDown={(e) => onKey(e, i)}
                className={clsx(
                  "flex items-center gap-2 whitespace-nowrap rounded-2xl px-4 py-2.5 text-sm font-medium transition",
                  isActive ? "bg-navy text-white shadow-lg shadow-navy/20" : "bg-white text-navy ring-1 ring-navy-100 hover:bg-sky",
                )}
              >
                {dLate && <span className="h-2 w-2 rounded-full bg-red-500" aria-label="Tiene tareas atrasadas" />}
                {shortAddress(d)}
                <span className={clsx("rounded-full px-2 py-0.5 text-xs tabular-nums", isActive ? "bg-white/20 text-white" : "bg-paper text-navy-600")}>{dOpen.length}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div role="tabpanel" id={`panel-${active.id}`} aria-labelledby={`tab-${active.id}`} className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHeader title={shortAddress(active)} subtitle={`${active.address.district}, ${active.address.province}`} count={ts.length} />
          <TaskList tasks={ts} />
        </Card>

        <div className="space-y-5 lg:col-span-4 lg:sticky lg:top-6 lg:self-start">
          <Card tone="sky">
            <CardHeader tone="sky" title="Resumen del negocio" action={<StageBadge stage={active.stage} />} />
            <div className="space-y-4 p-5">
              <p className="text-2xl font-semibold tabular-nums text-navy">{pen(active.pricePen, 0)}</p>
              <div className="flex items-center gap-4">
                <ProgressRing value={ts.length ? (done / ts.length) * 100 : 0} size={88} label={`${done} de ${ts.length} tareas completadas`} />
                <div className="min-w-0 flex-1 space-y-2">
                  <StackedBar
                    segments={[
                      { label: "Completadas", value: done, color: "#303841" },
                      { label: "En progreso", value: inProgress, color: "#FFFFFF" },
                      { label: "Pendientes", value: ts.length - done - inProgress, color: "#FFF200" },
                    ]}
                  />
                  <p className="text-xs text-navy-600">{done} de {ts.length} completadas</p>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-white p-3 ring-1 ring-navy/5">
                  <dt className="text-xs text-navy-200">Abiertas</dt>
                  <dd className="text-lg font-semibold tabular-nums text-navy">{open.length}</dd>
                </div>
                <div className={clsx("rounded-xl p-3 ring-1", late ? "bg-red-50 ring-red-200" : "bg-white ring-navy/5")}>
                  <dt className={clsx("text-xs", late ? "text-red-600" : "text-navy-200")}>Atrasadas</dt>
                  <dd className={clsx("text-lg font-semibold tabular-nums", late ? "text-red-700" : "text-navy")}>{late}</dd>
                </div>
              </dl>
              {next && (
                <p className="rounded-xl bg-white p-3 text-sm ring-1 ring-navy/5">
                  <span className="text-xs text-navy-200">Siguiente</span>
                  <span className="block truncate font-medium text-navy">{next.title}</span>
                  <span className="text-xs text-navy-600">{relativeDue(next.dueDate)}</span>
                </p>
              )}
              <Link href={`/deals/${active.id}`} className="flex items-center justify-between rounded-xl bg-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-600">
                Ver el negocio <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
