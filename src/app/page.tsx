import Link from "next/link";
import clsx from "clsx";
import { AlertCircle, ChevronRight, ClipboardCheck, Home, UserRound } from "lucide-react";
import { AgentChat } from "@/components/agent-chat";
import { PageHeader } from "@/components/page-header";
import { MiniCalendar } from "@/components/mini-calendar";
import { Card, CardHeader, DateTile, IconTile } from "@/components/ui";
import { VentaCard } from "@/components/venta-card";
import { agent, TODAY } from "@/lib/data";
import { dayNum, daysFromToday, fmtDate, monthAbbr, relativeDue, shortAddress } from "@/lib/format";
import { dealById, getAgentTasks, getDeals, getEvents, getMessages, getTasks } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function Dashboard() {
  const deals = getDeals();
  const openTasks = getTasks().filter((t) => t.status !== "completed").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const upcoming = getEvents().filter((e) => e.date >= TODAY).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 3);
  const closingSoon = deals.filter((d) => daysFromToday(d.targetCloseDate) <= 31).length;
  const sales = deals.filter((d) => d.kind === "venta").length;
  const rentals = deals.length - sales;
  const mine = getAgentTasks();
  const mineLate = mine.filter((t) => daysFromToday(t.dueDate) < 0).length;
  const mineToday = mine.filter((t) => daysFromToday(t.dueDate) === 0).length;
  const events = getEvents();
  const tasksAll = getTasks();

  return (
    <div className="container-page">
      <PageHeader
        title={<>Hola, {agent.name.split(" ")[0]} <span aria-hidden>👋</span></>}
        subtitle="Esto es lo que tienes para hoy."
      />

      <div className="space-y-8">
        <AgentChat initial={getMessages("chat")} />

        <Link
          href="/mis-pendientes"
          className="flex items-center gap-4 rounded-3xl bg-cafe-600 px-5 py-5 text-white ring-1 ring-cafe-700 hover:bg-cafe-700 sm:px-7"
        >
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-miel-300 font-heading text-3xl text-cafe-900" aria-hidden>{mine.length}</span>
          <span className="min-w-0 flex-1">
            <span className="block font-heading text-2xl">Lo haces tú</span>
            <span className="block text-lg text-miel-100">
              {mineLate > 0 ? `${mineLate} ${mineLate === 1 ? "atrasada" : "atrasadas"}` : "Nada atrasado"}
              {mineToday > 0 && ` · ${mineToday} para hoy`}
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 text-lg font-semibold">Ver <ChevronRight className="h-6 w-6" aria-hidden /></span>
        </Link>

        <Card>
          <CardHeader title="Lo que tienes que hacer" href="/tasks" />
          <ul className="divide-y divide-miel-100">
            {openTasks.slice(0, 5).map((t) => {
              const deal = dealById(t.dealId)!;
              const overdue = daysFromToday(t.dueDate) < 0;
              const Icon = overdue ? AlertCircle : t.assignee === "buyer" ? UserRound : ClipboardCheck;
              return (
                <li key={t.id}>
                  <Link href={`/ventas/${deal.id}`} className="flex items-center gap-4 px-5 py-5 hover:bg-miel-50 sm:px-7">
                    <IconTile urgent={overdue}><Icon className="h-6 w-6" /></IconTile>
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-semibold text-cafe-900">{t.title}</p>
                      <p className="mt-1 text-base text-cafe-700">
                        {t.assignee === "buyer" ? `Lo hace ${deal.buyers[0]?.name}` : "Lo haces tú"} · {shortAddress(deal)}
                      </p>
                    </div>
                    <span className={clsx("shrink-0 text-base", overdue ? "font-bold text-red-700" : "text-cafe-700")}>{relativeDue(t.dueDate)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Calendario" subtitle="Toca un día para ver sus eventos" href="/calendario" />
          <MiniCalendar
            deals={deals.map((d) => ({ id: d.id, label: shortAddress(d), kind: d.kind }))}
            events={events.map((e) => ({ id: e.id, name: e.name, date: e.date, type: e.type, dealId: e.dealId }))}
            tasks={tasksAll.map((t) => ({ id: t.id, title: t.title, dueDate: t.dueDate, dealId: t.dealId, done: t.status === "completed" }))}
          />
        </Card>

        <Card>
          <CardHeader title="Próximas fechas" href="/calendario" />
          <ul className="divide-y divide-miel-100">
            {upcoming.map((e) => {
              const deal = dealById(e.dealId)!;
              return (
                <li key={e.id}>
                  <Link href={`/ventas/${deal.id}`} className="flex items-center gap-4 px-5 py-5 hover:bg-miel-50 sm:px-7">
                    <DateTile day={dayNum(e.date)} month={monthAbbr(e.date)} />
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-semibold text-cafe-900">{e.name}</p>
                      <p className="mt-1 text-base text-cafe-700">{fmtDate(e.date)} · {shortAddress(deal)}</p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Tus ventas" href="/ventas" />
          <div className="p-5 sm:p-7">
            <div className="flex items-center gap-4 rounded-2xl bg-miel-300 p-5">
              <IconTile className="bg-white"><Home className="h-6 w-6" /></IconTile>
              <div>
                <p className="font-heading text-3xl text-cafe-900">
                  {sales} <span className="text-2xl">{sales === 1 ? "venta" : "ventas"}</span>
                  {rentals > 0 && <> · {rentals} <span className="text-2xl">{rentals === 1 ? "alquiler" : "alquileres"}</span></>}
                </p>
                <p className="text-base text-cafe-800"><strong>{closingSoon}</strong> {closingSoon === 1 ? "cierra" : "cierran"} este mes</p>
              </div>
            </div>
          </div>
          <ul className="grid gap-6 border-t border-miel-100 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-3">
            {deals.map((d) => (
              <li key={d.id}>
                <VentaCard deal={d} overdue={tasksAll.filter((t) => t.dealId === d.id && t.status !== "completed" && daysFromToday(t.dueDate) < 0).length} />
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
