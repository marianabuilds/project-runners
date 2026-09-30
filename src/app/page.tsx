import Link from "next/link";
import clsx from "clsx";
import { AlertCircle, ClipboardCheck, Home, UserRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, DateTile, IconTile, StageBadge } from "@/components/ui";
import { agent, deals, dealById, tasks, timeline, TODAY } from "@/lib/data";
import { dayNum, daysFromToday, fmtDate, monthAbbr, relativeDue, shortAddress } from "@/lib/format";

export default function Dashboard() {
  const openTasks = tasks.filter((t) => t.status !== "completed").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const upcoming = timeline.filter((e) => e.date >= TODAY).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const closingSoon = deals.filter((d) => daysFromToday(d.targetCloseDate) <= 31).length;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={<>Hola, {agent.name.split(" ")[0]} <span aria-hidden>👋</span></>}
        subtitle="Esto es lo que tienes para hoy."
      />

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <Card>
            <CardHeader title="Lo que tienes que hacer" href="/tasks" />
            <ul className="divide-y divide-miel-100">
              {openTasks.slice(0, 5).map((t) => {
                const deal = dealById(t.dealId)!;
                const overdue = daysFromToday(t.dueDate) < 0;
                const Icon = overdue ? AlertCircle : t.assignee === "buyer" ? UserRound : ClipboardCheck;
                return (
                  <li key={t.id}>
                    <Link href={`/deals/${deal.id}`} className="flex items-center gap-4 px-5 py-5 hover:bg-miel-50 sm:px-7">
                      <IconTile urgent={overdue}>
                        <Icon className="h-6 w-6" />
                      </IconTile>
                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-semibold text-cafe-900">{t.title}</p>
                        <p className="mt-1 text-base text-cafe-700">
                          {t.assignee === "buyer" ? `Lo hace ${deal.buyer.name}` : "Lo haces tú"} · {shortAddress(deal)}
                        </p>
                      </div>
                      <span className={clsx("shrink-0 text-base", overdue ? "font-bold text-red-700" : "text-cafe-700")}>
                        {relativeDue(t.dueDate)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Próximas fechas" href="/timeline" />
            <ul className="divide-y divide-miel-100">
              {upcoming.map((e) => {
                const deal = dealById(e.dealId)!;
                return (
                  <li key={e.id}>
                    <Link href={`/deals/${deal.id}`} className="flex items-center gap-4 px-5 py-5 hover:bg-miel-50 sm:px-7">
                      <DateTile day={dayNum(e.date)} month={monthAbbr(e.date)} />
                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-semibold text-cafe-900">{e.name}</p>
                        <p className="mt-1 text-base text-cafe-700">
                          {fmtDate(e.date)} · {shortAddress(deal)}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader title="Tus ventas" href="/deals" />
            <div className="p-5 sm:p-7">
              <div className="flex items-center gap-4 rounded-2xl bg-miel-300 p-5">
                <IconTile className="bg-white">
                  <Home className="h-6 w-6" />
                </IconTile>
                <div>
                  <p className="font-heading text-3xl text-cafe-900">
                    {deals.length} <span className="text-2xl">ventas</span>
                  </p>
                  <p className="text-base text-cafe-800">
                    <strong>{closingSoon}</strong> {closingSoon === 1 ? "cierra" : "cierran"} este mes
                  </p>
                </div>
              </div>
            </div>
            <ul className="divide-y divide-miel-100 border-t border-miel-100">
              {deals.map((d) => (
                <li key={d.id}>
                  <Link href={`/deals/${d.id}`} className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-miel-50 sm:px-7">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-cafe-900">{shortAddress(d)}</p>
                      <p className="truncate text-sm text-cafe-700">{d.buyer.name}</p>
                    </div>
                    <StageBadge stage={d.stage} />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
