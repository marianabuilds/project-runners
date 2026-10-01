import Link from "next/link";
import clsx from "clsx";
import { Bell, CalendarDays, ChevronRight, Flag, ListChecks, TrendingUp, Users } from "lucide-react";
import { AgendaRow, Legend } from "@/components/agenda";
import { WeekStrip } from "@/components/week-strip";
import { Avatar, Card, CardHeader, Donut, StageBadge, stageColor } from "@/components/ui";
import { agent, deals, dealById, STAGES, tasks, timeline, TODAY } from "@/lib/data";
import { allItems, weekOf } from "@/lib/calendar";
import { daysFromToday, fmtLong, fmtShort, pen, penShort, relativeDue, shortAddress, stageIndex } from "@/lib/format";

const IconBox = ({ children, className }: { children: React.ReactNode; className: string }) => (
  <span className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-xl", className)} aria-hidden>
    {children}
  </span>
);

export default function Dashboard() {
  const openTasks = tasks.filter((t) => t.status !== "completed").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const overdue = openTasks.filter((t) => daysFromToday(t.dueDate) < 0);
  const dueToday = openTasks.filter((t) => t.dueDate === TODAY);
  const week = weekOf(TODAY);
  const weekItems = allItems()
    .filter((i) => i.date >= TODAY && i.date <= week[6])
    .sort((a, b) => a.date.localeCompare(b.date) || Number(a.kind === "task") - Number(b.kind === "task"));
  const upcoming = timeline.filter((e) => e.date >= TODAY).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const pipelineTotal = deals.reduce((a, d) => a + d.pricePen, 0);
  const byStage = STAGES.map((s) => {
    const ds = deals.filter((d) => d.stage === s.key);
    return { ...s, count: ds.length, value: ds.reduce((a, d) => a + d.pricePen, 0) };
  });
  const closingSoon = deals.filter((d) => daysFromToday(d.targetCloseDate) <= 31).length;
  const waiting = openTasks.filter((t) => t.assignee === "buyer");

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-10">
      {/* Hero */}
      <Card tone="navy" className="p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-48 w-48 rounded-full bg-sky/10 blur-3xl" aria-hidden />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="rounded-full p-0.5 ring-2 ring-accent">
              <Avatar initials={agent.initials} src={agent.photo} size="lg" />
            </span>
            <div>
              <p className="text-sm text-white/60">{fmtLong(TODAY)}</p>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Hola, {agent.name.split(" ")[0]} <span aria-hidden>👋</span>
              </h1>
            </div>
          </div>
          <button className="relative rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20" aria-label="Notificaciones, 3 sin leer">
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-accent ring-2 ring-navy" />
          </button>
        </div>
        <dl className="relative mt-7 grid grid-cols-3 gap-3">
          {[
            { label: "Para hoy", value: dueToday.length, hl: false },
            { label: "Atrasadas", value: overdue.length, hl: overdue.length > 0 },
            { label: "Cierres en 30 días", value: closingSoon, hl: false },
          ].map((s) => (
            <div key={s.label} className={clsx("rounded-2xl p-3 sm:p-4", s.hl ? "bg-accent text-navy" : "bg-white/10")}>
              <dd className="text-3xl font-semibold tabular-nums leading-none">{s.value}</dd>
              <dt className={clsx("mt-2 text-xs leading-tight sm:text-sm", s.hl ? "text-navy-600" : "text-white/60")}>{s.label}</dt>
            </div>
          ))}
        </dl>
      </Card>

      {/* Weekly strip + agenda */}
      <Card>
        <CardHeader
          title="Esta semana"
          subtitle={`${weekItems.length} ${weekItems.length === 1 ? "pendiente" : "pendientes"} hasta el domingo`}
          icon={<IconBox className="bg-sky text-navy"><CalendarDays className="h-5 w-5" /></IconBox>}
          action={
            <Link href="/calendar" className="flex items-center gap-0.5 text-sm font-medium text-navy hover:text-navy-200">
              Calendario <ChevronRight className="h-4 w-4" aria-hidden />
            </Link>
          }
        />
        <WeekStrip />
        <div className="space-y-2 border-t border-navy-100 bg-paper/70 p-3 sm:p-4">
          {weekItems.length === 0 && <p className="p-3 text-sm text-navy-200">Nada pendiente esta semana.</p>}
          {weekItems.map((i, idx) => (
            <div key={i.id}>
              {(idx === 0 || weekItems[idx - 1].date !== i.date) && (
                <p className="mb-2 mt-1 px-1 text-xs font-semibold uppercase tracking-wide text-navy-200">
                  {i.date === TODAY ? "Hoy" : fmtLong(i.date)}
                </p>
              )}
              <AgendaRow item={i} />
            </div>
          ))}
          <div className="px-1 pt-2">
            <Legend />
          </div>
        </div>
      </Card>

      {/* To do */}
      <Card tone="sky">
        <CardHeader
          tone="sky"
          title="Cosas por hacer"
          count={openTasks.length}
          href="/tasks"
          subtitle={overdue.length ? `${overdue.length} atrasadas` : undefined}
          icon={<IconBox className="bg-navy text-white"><ListChecks className="h-5 w-5" /></IconBox>}
        />
        <div className="space-y-2 p-3 sm:p-4">
          {openTasks.slice(0, 5).map((t) => {
            const deal = dealById(t.dealId)!;
            const late = daysFromToday(t.dueDate) < 0;
            return (
              <Link
                key={t.id}
                href={`/deals/${deal.id}`}
                className={clsx(
                  "flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-navy/5 transition hover:shadow-md",
                  "border-l-4",
                  late ? "border-red-500" : t.assignee === "buyer" ? "border-accent" : "border-navy",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-navy">{t.title}</p>
                  <p className="mt-0.5 truncate text-sm text-navy-200">
                    {shortAddress(deal)} · {t.assignee === "buyer" ? deal.buyer.name : "Tú"}
                  </p>
                </div>
                <span
                  className={clsx(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                    late ? "bg-red-50 text-red-700" : "bg-paper text-navy-600",
                  )}
                >
                  {relativeDue(t.dueDate)}
                </span>
              </Link>
            );
          })}
        </div>
      </Card>

      {/* Milestones */}
      <Card tone="sun">
        <CardHeader
          tone="sun"
          title="Próximos hitos"
          href="/calendar"
          icon={<IconBox className="bg-accent text-navy ring-1 ring-navy/10"><Flag className="h-5 w-5" /></IconBox>}
        />
        <ol className="relative space-y-3 p-5 sm:p-6">
          <span className="absolute bottom-8 left-[2.15rem] top-8 w-px bg-navy/15 sm:left-[2.4rem]" aria-hidden />
          {upcoming.map((e) => {
            const deal = dealById(e.dealId)!;
            const d = daysFromToday(e.date);
            return (
              <li key={e.id} className="relative flex items-center gap-4">
                <span className="z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-sm font-semibold text-navy shadow ring-2 ring-navy">
                  {Number(e.date.slice(8))}
                </span>
                <div className="min-w-0 flex-1 rounded-2xl bg-white/80 p-3 ring-1 ring-navy/5">
                  <p className="font-medium text-navy">{e.name}</p>
                  <p className="truncate text-sm text-navy-200">
                    {shortAddress(deal)} · {d === 0 ? "hoy" : d === 1 ? "mañana" : `en ${d} días`}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <StageBadge stage={deal.stage} />
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      {/* Active deals */}
      <Card>
        <CardHeader
          title="Negocios activos"
          count={deals.length}
          href="/deals"
          icon={<IconBox className="bg-sky text-navy"><TrendingUp className="h-5 w-5" /></IconBox>}
        />
        <ul className="space-y-2 p-3 sm:p-4">
          {deals.map((d) => {
            const pct = ((stageIndex(d.stage) + 1) / STAGES.length) * 100;
            return (
              <li key={d.id}>
                <Link href={`/deals/${d.id}`} className="block rounded-2xl bg-paper p-4 ring-1 ring-navy-100 transition hover:bg-sky/50 hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <Avatar initials={d.buyer.initials} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-navy">{shortAddress(d)}</p>
                      <p className="truncate text-sm text-navy-200">
                        {d.address.district} · {d.buyer.name}
                      </p>
                    </div>
                    <p className="font-semibold tabular-nums text-navy">{pen(d.pricePen, 0)}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label="Avance de etapa">
                      <div className="h-full rounded-full bg-navy" style={{ width: `${pct}%` }} />
                    </div>
                    <StageBadge stage={d.stage} />
                    <span className="hidden text-xs text-navy-200 sm:inline">cierra {fmtShort(d.targetCloseDate)}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Pipeline */}
      <Card tone="paper">
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

      {/* Waiting on buyers */}
      <Card tone="sky">
        <CardHeader
          tone="sky"
          title="Esperando a los compradores"
          count={waiting.length}
          icon={<IconBox className="bg-accent text-navy ring-1 ring-navy/10"><Users className="h-5 w-5" /></IconBox>}
        />
        <ul className="space-y-2 p-3 sm:p-4">
          {waiting.map((t) => {
            const d = dealById(t.dealId)!;
            const late = daysFromToday(t.dueDate) < 0;
            return (
              <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-navy/5">
                <Avatar initials={d.buyer.initials} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-navy">{d.buyer.name}</p>
                  <p className="truncate text-xs text-navy-200">{t.title}</p>
                </div>
                <span className={clsx("shrink-0 text-xs", late ? "font-medium text-red-600" : "text-navy-200")}>{relativeDue(t.dueDate)}</span>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
