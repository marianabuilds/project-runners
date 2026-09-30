import Link from "next/link";
import clsx from "clsx";
import { ArrowLeft } from "lucide-react";
import { ActionItemCheck } from "@/components/action-item-check";
import { PageHeader } from "@/components/page-header";
import { Button, Card, CardHeader, KindBadge } from "@/components/ui";
import { daysFromToday, fmtDate, relativeDue, shortAddress } from "@/lib/format";
import { dealById, getAgentTasks } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function MisPendientesPage() {
  const tasks = getAgentTasks();
  const groups = [
    { key: "late", title: "Atrasadas", tone: "text-red-700", items: tasks.filter((t) => daysFromToday(t.dueDate) < 0) },
    { key: "today", title: "Hoy", tone: "text-cafe-900", items: tasks.filter((t) => daysFromToday(t.dueDate) === 0) },
    { key: "next", title: "Próximas", tone: "text-cafe-900", items: tasks.filter((t) => daysFromToday(t.dueDate) > 0) },
  ];

  return (
    <div className="container-page">
      <Link href="/tasks" className="mb-4 inline-flex min-h-[48px] items-center gap-2 rounded-2xl px-3 text-lg font-semibold text-cafe-600 hover:bg-miel-100">
        <ArrowLeft className="h-5 w-5" aria-hidden /> Pendientes
      </Link>
      <PageHeader
        title="Lo haces tú"
        subtitle={tasks.length ? <>Tienes <strong>{tasks.length}</strong> {tasks.length === 1 ? "tarea" : "tareas"} a tu cargo.</> : "No tienes nada a tu cargo. 🎉"}
      />

      <div className="space-y-8">
        {groups.map((g) =>
          g.items.length === 0 ? null : (
            <Card key={g.key}>
              <CardHeader title={g.title} count={g.items.length} />
              <ul className="divide-y divide-miel-100">
                {g.items.map((t) => {
                  const deal = dealById(t.dealId)!;
                  const late = g.key === "late";
                  return (
                    <li key={t.id} className="flex items-center gap-4 px-5 py-5 sm:px-7">
                      <ActionItemCheck id={t.id} title={t.title} />
                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-semibold text-cafe-900">{t.title}</p>
                        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-cafe-700">
                          <Link href={`/ventas/${deal.id}`} className="font-semibold text-cafe-600 underline-offset-4 hover:underline">{shortAddress(deal)}</Link>
                          <KindBadge kind={deal.kind} />
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={clsx("text-base font-bold", late ? "text-red-700" : g.tone)}>{relativeDue(t.dueDate)}</p>
                        <p className="text-sm text-cafe-700">{fmtDate(t.dueDate)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          ),
        )}
        <Button href="/tasks" variant="secondary" className="w-full">Ver todos los pendientes</Button>
      </div>
    </div>
  );
}
