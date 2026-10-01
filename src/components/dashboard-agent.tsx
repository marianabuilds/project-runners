"use client";

import Link from "next/link";
import clsx from "clsx";
import { Bell, CalendarClock, CalendarDays, ChevronRight, MessageCircle, ListChecks, Target, TrendingUp, TriangleAlert, Wallet } from "lucide-react";
import { Badge, ownerBadge } from "@/components/agenda";
import { TaskCtaButton } from "@/components/task-cta";
import { WhatsAppCard } from "@/components/whatsapp-card";
import { ActivityFeed } from "@/components/activity-feed";
import { WeekStrip } from "@/components/week-strip";
import { BarChart, ProgressRing, Sparkline, StackedBar } from "@/components/charts";
import { Avatar, Card, CardHeader, Donut, StageBadge, stageColor } from "@/components/ui";
import { agent, dealById, STAGES, TODAY } from "@/lib/data";
import { fmtDateTime, useStore } from "@/lib/store";
import { allItems, groupByDate, weekOf, WEEKDAYS_LONG, weekdayIndex } from "@/lib/calendar";
import { daysFromToday, fmtLong, fmtShort, pen, penShort, relativeDue, shortAddress, stageIndex } from "@/lib/format";

const IconBox = ({ children, className }: { children: React.ReactNode; className: string }) => (
  <span className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-xl", className)} aria-hidden>
    {children}
  </span>
);

export function AgentDashboard() {
  const { deals, visibleTasks: tasks, lastSync, role } = useStore();
  const openTasks = tasks.filter((t) => t.status !== "completed").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const overdue = openTasks.filter((t) => daysFromToday(t.dueDate) < 0);
  const dueToday = openTasks.filter((t) => t.dueDate === TODAY);
  const week = weekOf(TODAY);
  const byDate = groupByDate(allItems(tasks));
  const perDay = week.map((d) => (byDate.get(d) ?? []).length);
  const pipelineTotal = deals.reduce((a, d) => a + d.pricePen, 0);
  const byStage = STAGES.map((s) => {
    const ds = deals.filter((d) => d.stage === s.key);
    return { ...s, count: ds.length, value: ds.reduce((a, d) => a + d.pricePen, 0) };
  });
  const closingSoon = deals.filter((d) => daysFromToday(d.targetCloseDate) <= 31).length;
  const done = tasks.filter((t) => t.status === "completed").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const pendingCount = tasks.length - done - inProgress;
  const completion = (done / tasks.length) * 100;
  const closings = [...deals].sort((a, b) => a.targetCloseDate.localeCompare(b.targetCloseDate));

  const kpis = [
    { label: "Para hoy", value: dueToday.length, icon: <CalendarClock className="h-5 w-5" />, tile: "bg-sky text-navy", spark: perDay, hint: "tareas con vencimiento hoy" },
    { label: "Atrasadas", value: overdue.length, icon: <TriangleAlert className="h-5 w-5" />, tile: overdue.length ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600", hint: overdue.length ? "requieren atención" : "todo al día" },
    { label: "Cierres en 30 días", value: closingSoon, icon: <Target className="h-5 w-5" />, tile: "bg-accent text-navy", hint: "negocios por cerrar" },
    { label: "Valor del pipeline", value: penShort(pipelineTotal), icon: <Wallet className="h-5 w-5" />, tile: "bg-navy text-white", spark: byStage.map((s) => s.value), hint: `${deals.length} negocios activos` },
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
          <Card key={k.label} className="p-5 sm:col-span-1 lg:col-span-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm text-navy-200">{k.label}</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums leading-none text-navy">{k.value}</p>
              </div>
              <IconBox className={k.tile}>{k.icon}</IconBox>
            </div>
            <div className="mt-4 flex items-end justify-between gap-3">
              <p className="text-xs text-navy-200">{k.hint}</p>
              {k.spark && <div className="w-24 text-navy"><Sparkline points={k.spark} /></div>}
            </div>
          </Card>
        ))}

        {/* Week strip + selected-day agenda */}
        <Card className="lg:col-span-7">
          <CardHeader
            title="Esta semana"
            subtitle="Toca un día para ver sus pendientes"
            icon={<IconBox className="bg-sky text-navy"><CalendarDays className="h-5 w-5" /></IconBox>}
            action={
              <Link href="/calendar" className="flex items-center gap-0.5 text-sm font-medium text-navy hover:text-navy-200">
                Calendario <ChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            }
          />
          <WeekStrip />
        </Card>

        {/* To do */}
        <Card tone="sky" className="lg:col-span-5">
          <CardHeader
            tone="sky"
            title="Cosas por hacer"
            count={openTasks.length}
            href="/tasks"
            subtitle={overdue.length ? `${overdue.length} atrasadas` : undefined}
            icon={<IconBox className="bg-navy text-white"><ListChecks className="h-5 w-5" /></IconBox>}
          />
          <ul className="space-y-2 p-3 sm:p-4">
            {openTasks.slice(0, 6).map((t) => {
              const deal = dealById(t.dealId)!;
              const late = daysFromToday(t.dueDate) < 0;
              const buyer = t.assignee !== "agent";
              return (
                <li
                  key={t.id}
                  className={clsx(
                    "flex items-center gap-3 rounded-2xl border-l-4 bg-white p-3 shadow-sm ring-1 ring-navy/5",
                    late ? "border-red-500" : buyer ? "border-accent" : "border-navy",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <Link href={`/deals/${deal.id}`} className="block truncate font-medium text-navy hover:underline">
                      {t.title}
                    </Link>
                    <p className="mt-0.5 truncate text-xs text-navy-200">
                      {shortAddress(deal)} · {t.assignee === "buyer" ? deal.buyer.name : t.assignee === "seller" ? deal.sellerName : "Tú"}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      {late && <Badge kind="atrasada" />}
                      <Badge kind={ownerBadge(t.assignee, role)} />
                      <span className={clsx("text-[11px]", late ? "font-medium text-red-600" : "text-navy-200")}>{relativeDue(t.dueDate)}</span>
                    </div>
                  </div>
                  <TaskCtaButton task={t} />
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Active deals */}
        <Card className="lg:col-span-7">
          <CardHeader
            title="Negocios activos"
            count={deals.length}
            href="/deals"
            icon={<IconBox className="bg-sky text-navy"><TrendingUp className="h-5 w-5" /></IconBox>}
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
                        <p className="truncate font-medium text-navy">{shortAddress(d)}</p>
                        <p className="truncate text-sm text-navy-200">
                          {d.address.district} · {d.buyer.name}
                        </p>
                      </div>
                    </div>
                    <p className="mt-3 text-lg font-semibold tabular-nums text-navy">{pen(d.pricePen, 0)}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Avance de etapa">
                        <div className="h-full rounded-full bg-navy" style={{ width: `${pct}%` }} />
                      </div>
                      <StageBadge stage={d.stage} />
                    </div>
                    <p className="mt-2 text-xs text-navy-200">cierra {fmtShort(d.targetCloseDate)}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Pipeline */}
        <Card tone="paper" className="lg:col-span-5">
          <CardHeader tone="paper" title="Tu tubería de ventas" href="/deals" />
          <div className="flex flex-col items-center gap-6 p-5 sm:flex-row sm:p-6">
            <div className="relative shrink-0">
              <Donut segments={byStage.filter((s) => s.value).map((s) => ({ value: s.value, color: stageColor[s.key] }))} />
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <p className="text-xl font-semibold tabular-nums text-navy">{penShort(pipelineTotal)}</p>
                  <p className="text-xs text-navy-200">valor total</p>
                </div>
              </div>
            </div>
            <ul className="w-full flex-1 space-y-2">
              {byStage.map((s) => (
                <li key={s.key} className="flex items-center gap-3 rounded-xl bg-white px-4 py-2.5 ring-1 ring-navy-100">
                  <span className="h-3 w-3 rounded-full ring-1 ring-navy/20" style={{ background: stageColor[s.key] }} aria-hidden />
                  <span className="flex-1 text-navy">{s.label}</span>
                  <span className="text-sm tabular-nums text-navy-200">{s.value ? penShort(s.value) : "—"}</span>
                  <span className="w-5 text-right text-sm font-semibold tabular-nums text-navy">{s.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>

        {/* Task progress */}
        <Card className="lg:col-span-4">
          <CardHeader title="Avance de tareas" subtitle={`${done} de ${tasks.length} completadas`} />
          <div className="flex items-center gap-5 p-5">
            <ProgressRing value={completion} label={`${Math.round(completion)}% de tareas completadas`} />
            <div className="min-w-0 flex-1 space-y-3">
              <StackedBar
                segments={[
                  { label: "Completadas", value: done, color: "#303841" },
                  { label: "En progreso", value: inProgress, color: "#B9D2E5" },
                  { label: "Pendientes", value: pendingCount, color: "#FFF200" },
                ]}
              />
              <ul className="space-y-1 text-xs text-navy-200">
                <li className="flex justify-between"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-navy" />Completadas</span><b className="text-navy">{done}</b></li>
                <li className="flex justify-between"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-sky-300" />En progreso</span><b className="text-navy">{inProgress}</b></li>
                <li className="flex justify-between"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-accent ring-1 ring-navy/30" />Pendientes</span><b className="text-navy">{pendingCount}</b></li>
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
                <li key={d.id} className="flex items-center gap-3 rounded-xl bg-white/80 px-3 py-2 ring-1 ring-navy/5">
                  <span className="grid h-10 w-12 shrink-0 place-items-center rounded-lg bg-navy text-center leading-none text-white">
                    <span className="text-base font-semibold tabular-nums">{n}</span>
                    <span className="text-[9px] uppercase text-white/60">días</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-navy">{shortAddress(d)}</p>
                    <p className="truncate text-xs text-navy-200">{d.buyer.name} · {fmtShort(d.targetCloseDate)}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="lg:col-span-5">
          <WhatsAppCard className="h-full" />
        </div>
        <Card className="lg:col-span-7">
          <CardHeader title="Actividad reciente" subtitle="Lo que ven agente, comprador y vendedor" />
          <ActivityFeed limit={6} />
        </Card>
      </div>
    </div>
  );
}
