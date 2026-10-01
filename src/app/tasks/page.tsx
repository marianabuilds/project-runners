"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ProgressRing, StackedBar } from "@/components/charts";
import { TaskList } from "@/components/task-list";
import { Card, CardHeader, StageBadge } from "@/components/ui";
import { useStore } from "@/lib/store";
import { daysFromToday, pen, relativeDue, shortAddress } from "@/lib/format";

export default function TasksPage() {
  const { scoped } = useStore();
  const { tasks: ts, deals, isAll } = scoped;
  const deal = deals[0];
  const done = ts.filter((t) => t.status === "completed").length;
  const inProgress = ts.filter((t) => t.status === "in_progress").length;
  const open = ts.filter((t) => t.status !== "completed").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const late = open.filter((t) => daysFromToday(t.dueDate) < 0).length;
  const next = open[0];

  return (
    <div className="mx-auto max-w-7xl pb-10">
      <PageHeader title="Tareas" subtitle={isAll ? "Tus tareas en todos los negocios" : deal ? `Tus tareas en ${shortAddress(deal)}` : undefined} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHeader title={isAll ? "Todos los negocios" : deal ? shortAddress(deal) : "Tareas"} subtitle={deal && !isAll ? `${deal.address.district}, ${deal.address.province}` : `${deals.length} negocios`} count={ts.length} />
          <TaskList tasks={ts} grouped={isAll} />
        </Card>

        <div className="space-y-5 lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
          <Card tone="sky">
            <CardHeader tone="sky" title="Resumen" action={!isAll && deal ? <StageBadge stage={deal.stage} /> : undefined} />
            <div className="space-y-4 p-5">
              {!isAll && deal && <p className="text-2xl font-semibold tabular-nums text-ink">{pen(deal.pricePen, 0)}</p>}
              <div className="flex items-center gap-4">
                <ProgressRing value={ts.length ? (done / ts.length) * 100 : 0} size={88} label={`${done} de ${ts.length} tareas completadas`} />
                <div className="min-w-0 flex-1 space-y-2">
                  <StackedBar
                    segments={[
                      { label: "Completadas", value: done, color: "rgb(var(--ink))" },
                      { label: "En progreso", value: inProgress, color: "#FFFFFF" },
                      { label: "Pendientes", value: ts.length - done - inProgress, color: "#FFF200" },
                    ]}
                  />
                  <p className="text-xs text-ink-soft">{done} de {ts.length} completadas</p>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-xl bg-surface p-3 ring-1 ring-navy/5">
                  <dt className="text-xs text-ink-muted">Abiertas</dt>
                  <dd className="text-lg font-semibold tabular-nums text-ink">{open.length}</dd>
                </div>
                <div className="rounded-xl bg-surface p-3 ring-1 ring-navy/5">
                  <dt className="text-xs text-ink-muted">Atrasadas</dt>
                  <dd className={late ? "text-lg font-semibold tabular-nums text-red-600 dark:text-red-400" : "text-lg font-semibold tabular-nums text-ink"}>{late}</dd>
                </div>
              </dl>
              {next && (
                <p className="rounded-xl bg-surface p-3 text-sm ring-1 ring-navy/5">
                  <span className="text-xs text-ink-muted">Siguiente</span>
                  <span className="block truncate font-medium text-ink">{next.title}</span>
                  <span className="text-xs text-ink-soft">{relativeDue(next.dueDate)}</span>
                </p>
              )}
              {!isAll && deal && (
                <Link href={`/deals/${deal.id}`} className="flex items-center justify-between rounded-xl bg-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-600">
                  Ver el negocio <ChevronRight className="h-4 w-4" aria-hidden />
                </Link>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
