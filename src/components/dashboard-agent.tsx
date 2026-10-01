"use client";

import Link from "next/link";
import clsx from "clsx";
import { Bell, CalendarClock, CalendarDays, ChevronRight, MessageCircle, ListChecks, Target, TrendingUp, TriangleAlert } from "lucide-react";
import { Checklist } from "@/components/checklist";
import { ActivityFeed } from "@/components/activity-feed";
import { WeekStrip } from "@/components/week-strip";
import { BarChart, ProgressRing, Sparkline, StackedBar } from "@/components/charts";
import { Avatar, Card, CardHeader, StageBadge, StageTracker } from "@/components/ui";
import { agent, STAGES, TODAY } from "@/lib/data";
import { fmtDateTime, useStore } from "@/lib/store";
import { allItems, groupByDate, weekOf, WEEKDAYS_LONG, weekdayIndex } from "@/lib/calendar";
import { daysFromToday, fmtLong, fmtShort, pen, shortAddress, stageIndex } from "@/lib/format";

const IconBox = ({ children, className }: { children: React.ReactNode; className: string }) => (
  <span className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-xl", className)} aria-hidden>
    {children}
  </span>
);

export function AgentDashboard() {
  const { scoped, lastSync } = useStore();
  const deals = scoped.deals;
  const tasks = scoped.tasks;
  const isAll = scoped.isAll;
  const openTasks = tasks.filter((t) => t.status !== "completed").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const overdue = openTasks.filter((t) => daysFromToday(t.dueDate) < 0);
  const dueToday = openTasks.filter((t) => t.dueDate === TODAY);
  const week = weekOf(TODAY);
  const byDate = groupByDate(allItems(tasks));
  const perDay = week.map((d) => (byDate.get(d) ?? []).length);
  const closingSoon = deals.filter((d) => daysFromToday(d.targetCloseDate) <= 31).length;
  const done = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const pendingCount = tasks.length - done - inProgress;
  const completion = tasks.length ? (done / tasks.length) * 100 : 0;
  const closings = [...deals].sort((a, b) => a.targetCloseDate.localeCompare(b.targetCloseDate));

  const kpis = [
    { label: "Para hoy", value: dueToday.length, icon: <CalendarClock className="h-5 w-5" />, tile: "bg-sky text-ink", spark: perDay, hint: "tareas con vencimiento hoy" },
    { label: "Atrasadas", value: overdue.length, icon: <TriangleAlert className="h-5 w-5" />, tile: overdue.length ? "bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400" : "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400", hint: overdue.length ? "requieren atención" : "todo al día" },
    { label: "Cierres en 30 días", value: closingSoon, icon: <Target className="h-5 w-5" />, tile: "bg-accent text-on-accent", hint: "negocios por cerrar" },
  ];

  return (
    <div className="mx-auto max-w-7xl pb-10">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Hero */}
        <Card tone="navy" className="p-6 sm:p-8 lg:col-span-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-sky/10 blur-3xl" aria-hidden />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="rounded-full p-0.5 ring-2 ring-accent">
                <Avatar initials={agent.initials} src={agent.photo} size="lg" />
              </span>
              <div>
                <p className="text-sm text-white/60">{fmtLong(TODAY)}</p>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Hola, {agent.name.split(" ")[0]} <span aria-hidden>👋</span>
                </h1>
                <p className="mt-1 text-sm text-white/70">
                  {dueToday.length} para hoy · {overdue.length} atrasadas · {closingSoon} cierres cerca
                </p>
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                  <MessageCircle className="h-3.5 w-3.5 text-accent" aria-hidden /> WhatsApp actualizado: {fmtDateTime(lastSync)}
                </p>
              </div>
            </div>
            <button className="relative rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20" aria-label="Notificaciones, 3 sin leer">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-navy" />
            </button>
          </div>
        </Card>

        {/* KPI tiles */}
        {kpis.map((k) => (
          <Card key={k.label} className="p-5 lg:col-span-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-ink-muted">{k.label}</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums leading-none text-ink">{k.value}</p>
              </div>
              <IconBox className={k.tile}>{k.icon}</IconBox>
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <p className="text-xs text-ink-muted">{k.hint}</p>
              {k.spark && <div className="w-24 text-ink"><Sparkline points={k.spark} /></div>}
            </div>
          </Card>
        ))}

        {/* Left: to do + deals · Right: week + recent activity */}
        <div className="space-y-5 lg:col-span-7">
        {/* To do: plain checklist, own tasks only */}
        <Card tone="sky">
          <CardHeader
            tone="sky"
            title="Cosas por hacer"
            count={openTasks.length}
            href="/tasks"
            subtitle={overdue.length ? `${overdue.length} atrasadas` : undefined}
            icon={<IconBox className="bg-navy text-white"><ListChecks className="h-5 w-5" /></IconBox>}
          />
          <div className="bg-surface">
            <Checklist tasks={tasks} grouped={isAll} />
          </div>
        </Card>

        {isAll && (
        <Card>
          <CardHeader
            title="Negocios activos"
            count={deals.length}
            href="/deals"
            icon={<IconBox className="bg-sky text-ink"><TrendingUp className="h-5 w-5" /></IconBox>}
          />
          <ul className="grid grid-cols-1 gap-2 p-3 sm:p-4 xl:grid-cols-2">
            {deals.map((d) => {
              const pct = ((stageIndex(d.stage) + 1) / STAGES.length) * 100;
              return (
                <li key={d.id}>
                  <Link href={`/deals/${d.id}`} className="block h-full rounded-2xl bg-paper p-4 ring-1 ring-navy-100 transition hover:bg-sky/50 hover:shadow-md">
                    <div className="flex items-center gap-3">
                      <Avatar initials={d.buyer.initials} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-ink">{shortAddress(d)}</p>
                        <p className="truncate text-sm text-ink-muted">
                          {d.address.district} · {d.buyer.name}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-lg font-semibold tabular-nums text-ink">{pen(d.pricePen, 0)}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Avance de etapa">
                        <div className="h-full rounded-full bg-navy" style={{ width: `${pct}%` }} />
                      </div>
                      <StageBadge stage={d.stage} />
                    </div>
                    <p className="mt-2 text-xs text-ink-muted">cierra {fmtShort(d.targetCloseDate)}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
        )}
        {!isAll && deals[0] && (
          <Card>
            <CardHeader title="Resumen del negocio" action={<StageBadge stage={deals[0].stage} />} />
            <div className="px-3 py-6 sm:px-6">
              <StageTracker stage={deals[0].stage} />
            </div>
            <dl className="grid grid-cols-2 gap-3 border-t border-navy-100 p-5 text-sm sm:grid-cols-4">
              {[
                ["Precio", pen(deals[0].pricePen, 0)],
                ["Comprador", deals[0].buyer.name],
                ["Vendedor", deals[0].sellerName],
                ["Cierre", fmtShort(deals[0].targetCloseDate)],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs text-ink-muted">{k}</dt>
                  <dd className="mt-0.5 font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </Card>
        )}
        </div>
        <div className="space-y-5 lg:col-span-5">
        {/* Week strip + selected-day agenda */}
        <Card>
          <CardHeader
            title="Esta semana"
            subtitle="Toca un día para ver sus pendientes"
            icon={<IconBox className="bg-sky text-ink"><CalendarDays className="h-5 w-5" /></IconBox>}
            action={
              <Link href="/calendar" className="flex items-center gap-0.5 text-sm font-medium text-ink hover:text-ink-muted">
                Calendario <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            }
          />
          <WeekStrip />
        </Card>

        <Card>
          <CardHeader title="Actividad reciente" subtitle="Lo que ven agente, comprador y vendedor" />
          <ActivityFeed limit={5} />
        </Card>
        </div>
        {/* Task progress */}
        <Card className="lg:col-span-4">
          <CardHeader title="Avance de tareas" subtitle={`${done} de ${tasks.length} completadas`} />
          <div className="flex items-center gap-5 p-5">
            <ProgressRing value={completion} label={`${Math.round(completion)}% de tareas completadas`} />
            <div className="min-w-0 flex-1 space-y-3">
              <StackedBar
                segments={[
                  { label: "Completadas", value: done, color: "rgb(var(--ink))" },
                  { label: "En progreso", value: inProgress, color: "#B9D2E5" },
                  { label: "Pendientes", value: pendingCount, color: "#FFF200" },
                ]}
              />
              <ul className="space-y-1 text-xs text-ink-muted">
                <li className="flex justify-between"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-navy" />Completadas</span><b className="text-ink">{done}</b></li>
                <li className="flex justify-between"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-sky-300" />En progreso</span><b className="text-ink">{inProgress}</b></li>
                <li className="flex justify-between"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-accent ring-1 ring-navy/30" />Pendientes</span><b className="text-on-accent">{pendingCount}</b></li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Weekly load */}
        <Card className="lg:col-span-4">
          <CardHeader title="Carga de la semana" subtitle="Tareas e hitos por día" />
          <div className="p-5">
            <BarChart
              ariaLabel="Tareas e hitos por día de esta semana"
              data={week.map((d, i) => ({ label: WEEKDAYS_LONG[weekdayIndex(d)], value: perDay[i], highlight: d === TODAY }))}
            />
          </div>
        </Card>

        {/* Closings countdown */}
        <Card tone="sun" className="lg:col-span-4">
          <CardHeader tone="sun" title="Próximos cierres" subtitle="Cuenta regresiva por negocio" />
          <ul className="space-y-2 p-4">
            {closings.slice(0, 4).map((d) => {
              const n = daysFromToday(d.targetCloseDate);
              return (
                <li key={d.id} className="flex items-center gap-3 rounded-xl bg-surface/80 px-3 py-2 ring-1 ring-navy/5">
                  <span className="grid h-10 w-12 shrink-0 place-items-center rounded-lg bg-navy text-center leading-none text-white">
                    <span className="text-base font-semibold tabular-nums">{n}</span>
                    <span className="text-[9px] uppercase text-white/60">días</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{shortAddress(d)}</p>
                    <p className="truncate text-xs text-ink-muted">{d.buyer.name} · {fmtShort(d.targetCloseDate)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
