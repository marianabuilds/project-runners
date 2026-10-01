"use client";

import Link from "next/link";
import clsx from "clsx";
import { CalendarDays, ChevronRight, ListChecks, MessageCircle, TrendingUp, Target } from "lucide-react";
import { ActivityFeed } from "@/components/activity-feed";
import { AddTask } from "@/components/add-task";
import { Checklist } from "@/components/checklist";
import { CierreCountdown } from "@/components/charts";
import { DailyDigest } from "@/components/daily-digest";
import { WeekStrip } from "@/components/week-strip";
import { Avatar, Card, CardHeader, StageBadge, StageTracker } from "@/components/ui";
import { agent, STAGES, TODAY } from "@/lib/data";
import { fmtDateTime, useStore } from "@/lib/store";
import { daysFromToday, fmtLong, fmtShort, monthAbbr, pen, shortAddress, stageIndex } from "@/lib/format";

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
  const closings = [...deals].sort((a, b) => a.targetCloseDate.localeCompare(b.targetCloseDate));
  const deal = deals[0];
  const sync = `Se actualiza desde WhatsApp · ${fmtDateTime(lastSync)}`;


  return (
    <div className="mx-auto max-w-7xl pb-10">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Hero */}
        <Card tone="navy" className="p-6 sm:p-8 lg:col-span-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-sky/10 blur-3xl" aria-hidden />
          <div className="relative flex items-center gap-4">
            <span className="rounded-full p-0.5 ring-2 ring-accent">
              <Avatar initials={agent.initials} src={agent.photo} size="lg" />
            </span>
            <div>
              <p className="text-sm text-white/60">{fmtLong(TODAY)}</p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Hola, {agent.name.split(" ")[0]} <span aria-hidden>👋</span>
              </h1>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs text-white/80">
                <MessageCircle className="h-3.5 w-3.5 text-accent" aria-hidden /> WhatsApp actualizado: {fmtDateTime(lastSync)}
              </p>
            </div>
          </div>
        </Card>

        {/* Daily digest */}
        <DailyDigest tasks={tasks} activities={scoped.activity} today={TODAY} />

        {/* Cuenta regresiva (calendar icon) */}
        <Card tone="sun" className="lg:col-span-5">
          <CardHeader tone="sun" title="Próximos cierres" subtitle={isAll ? "Cuenta regresiva por negocio" : "Cuenta regresiva"} icon={<IconBox className="bg-accent text-on-accent ring-1 ring-navy/10"><Target className="h-5 w-5" /></IconBox>} />
          {isAll ? (
            <ul className="space-y-2 p-4">
              {closings.slice(0, 4).map((d) => (
                <li key={d.id} className="flex items-center gap-3 rounded-xl bg-surface/80 px-3 py-2 ring-1 ring-navy/5">
                  <CierreCountdown size="sm" days={daysFromToday(d.targetCloseDate)} month={monthAbbr(d.targetCloseDate)} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-ink">{shortAddress(d)}</p>
                    <p className="truncate text-xs text-ink-muted">{d.buyer.name} · {fmtShort(d.targetCloseDate)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            deal && (
              <div className="flex items-center gap-5 p-5">
                <CierreCountdown days={daysFromToday(deal.targetCloseDate)} month={monthAbbr(deal.targetCloseDate)} />
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-ink">{shortAddress(deal)}</p>
                  <p className="text-sm text-ink-muted">{deal.address.district} · {deal.buyer.name}</p>
                  <p className="mt-2 text-sm font-medium text-ink">Cierre el {fmtLong(deal.targetCloseDate).replace(/^\w+, /, "")}</p>
                </div>
              </div>
            )
          )}
        </Card>

        {/* Resumen del negocio / Negocios activos */}
        {isAll ? (
          <Card className="lg:col-span-7">
            <CardHeader title="Negocios activos" count={deals.length} href="/deals" icon={<IconBox className="bg-sky text-ink"><TrendingUp className="h-5 w-5" /></IconBox>} />
            <ul className="grid grid-cols-1 gap-2 p-3 sm:p-4 xl:grid-cols-2">
              {deals.map((d) => {
                const pct = ((stageIndex(d.stage) + 1) / STAGES.length) * 100;
                return (
                  <li key={d.id}>
                    <Link href={`/deals/${d.id}`} className="block h-full rounded-2xl bg-paper p-3 ring-1 ring-navy-100 transition hover:bg-sky/50 hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <Avatar initials={d.buyer.initials} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-ink">{shortAddress(d)}</p>
                          <p className="truncate text-xs text-ink-muted">{d.address.district} · {d.buyer.name}</p>
                        </div>
                        <p className="text-sm font-semibold tabular-nums text-ink">{pen(d.pricePen, 0)}</p>
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Avance de etapa">
                          <div className="h-full rounded-full bg-navy" style={{ width: `${pct}%` }} />
                        </div>
                        <StageBadge stage={d.stage} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        ) : (
          deal && (
            <Card className="lg:col-span-7">
              <CardHeader title="Resumen del negocio" action={<StageBadge stage={deal.stage} />} />
              <div className="px-3 py-5 sm:px-6">
                <StageTracker stage={deal.stage} />
              </div>
              <dl className="grid grid-cols-2 gap-3 border-t border-navy-100 p-5 text-sm sm:grid-cols-4">
                {[
                  ["Precio", pen(deal.pricePen, 0)],
                  ["Comprador", deal.buyer.name],
                  ["Vendedor", deal.sellerName],
                  ["Cierre", fmtShort(deal.targetCloseDate)],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-xs text-ink-muted">{k}</dt>
                    <dd className="mt-0.5 font-semibold text-ink">{v}</dd>
                  </div>
                ))}
              </dl>
            </Card>
          )
        )}

        {/* Vertical flow: to do, week, activity */}
        <div className="space-y-5 lg:col-span-12">
          <Card tone="sky">
            <CardHeader
              tone="sky"
              title="Cosas por hacer"
              count={openTasks.length}
              href="/tasks"
              subtitle={overdue.length ? `${overdue.length} atrasadas · ${sync}` : sync}
              icon={<IconBox className="bg-navy text-white"><ListChecks className="h-5 w-5" /></IconBox>}
            />
            <div className="bg-surface">
              <Checklist tasks={tasks} grouped={isAll} />
              <AddTask />
            </div>
          </Card>
        </div>
        <div className="space-y-5 lg:col-span-12">
          <Card>
            <CardHeader
              title="Esta semana"
              subtitle="Toca un día para ver sus pendientes"
              icon={<IconBox className="bg-sky text-ink"><CalendarDays className="h-5 w-5" /></IconBox>}
              action={
                <Link href="/calendar" className="flex items-center gap-0.5 text-sm font-semibold text-ink hover:text-ink-muted">
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
      </div>
    </div>
  );
}
