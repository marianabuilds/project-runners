import Link from "next/link";
import clsx from "clsx";
import { Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TaskList } from "@/components/task-list";
import { Timeline } from "@/components/timeline";
import { Avatar, Card, CardHeader, KindBadge, StageBadge, StageTracker } from "@/components/ui";
import { agent } from "@/lib/data";
import { buyersLabel, daysFromToday, fmtDate, priceLabel, shortAddress } from "@/lib/format";
import { dealById, eventsFor, getDeals, tasksFor } from "@/lib/store";

export const dynamic = "force-dynamic";

// Vista previa de lo que ve el comprador de una venta.
export default function BuyerView({ searchParams }: { searchParams: { venta?: string; comprador?: string } }) {
  const all = getDeals();
  const deal = (searchParams.venta && dealById(searchParams.venta)) || all[0];
  const buyer = deal.buyers.find((b) => b.id === searchParams.comprador) ?? deal.buyers[0];
  const myTasks = tasksFor(deal.id).filter((t) => t.assignee === "buyer");
  const events = eventsFor(deal.id);
  const nextThree = events.filter((e) => daysFromToday(e.date) >= 0).slice(0, 3);
  const open = myTasks.filter((t) => t.status !== "completed").length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 space-y-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900 ring-1 ring-amber-200">
        <p>Vista previa: esto es lo que ve <strong>{buyer?.name}</strong>.</p>
        <div className="flex flex-wrap gap-1.5" aria-label="Elegir operación">
          {all.map((d) => (
            <Link key={d.id} href={`/buyer?venta=${d.id}`} className={clsx("rounded-full px-2.5 py-1 text-xs font-medium", d.id === deal.id ? "bg-amber-600 text-white" : "bg-white text-amber-900 ring-1 ring-amber-200 hover:bg-amber-100")}>
              {shortAddress(d)}
            </Link>
          ))}
        </div>
        {deal.buyers.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            {buyersLabel(deal.kind)}:
            {deal.buyers.map((b) => (
              <Link key={b.id} href={`/buyer?venta=${deal.id}&comprador=${b.id}`} className={clsx("rounded-full px-2.5 py-1 font-medium", b.id === buyer?.id ? "bg-amber-600 text-white" : "bg-white ring-1 ring-amber-200 hover:bg-amber-100")}>
                {b.name}
              </Link>
            ))}
          </div>
        )}
      </div>
      <PageHeader
        title={<>Hola, {buyer?.name.split(" ")[0]} <span aria-hidden>👋</span></>}
        subtitle={<>Tienes {open} {open === 1 ? "cosa" : "cosas"} por hacer para {deal.kind === "venta" ? "tu nuevo hogar" : "tu alquiler"}.</>}
      />

      <div className="space-y-6">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-blue-50 to-white px-5 py-5 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm text-slate-500">Tu {deal.kind === "venta" ? "hogar" : "alquiler"} <KindBadge kind={deal.kind} /></p>
                <p className="text-xl font-semibold text-slate-900">{shortAddress(deal)}</p>
                <p className="text-sm text-slate-600">{deal.address.district}, {deal.address.province}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold tabular-nums text-slate-900">{priceLabel(deal, 0)}</p>
                <StageBadge stage={deal.stage} />
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 px-3 py-6 sm:px-6"><StageTracker stage={deal.stage} /></div>
        </Card>

        {nextThree.length > 0 && (
          <div className="grid gap-3 sm:grid-cols-3">
            {nextThree.map((e) => (
              <Card key={e.id} className="px-4 py-3">
                <p className="text-xs text-slate-500">{e.name}</p>
                <p className="mt-1 font-semibold text-slate-900">{fmtDate(e.date)}</p>
                <p className="text-xs text-slate-500">en {daysFromToday(e.date)} días</p>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardHeader title="Tus tareas" count={myTasks.length} />
          <TaskList initial={myTasks} buyerName={buyer?.name ?? ""} mode="buyer" />
        </Card>
        <Card><CardHeader title="Calendario" /><Timeline events={events} /></Card>
        <Card>
          <CardHeader title="Tu agente" />
          <div className="flex items-center gap-3 px-5 pt-4 sm:px-6">
            <Avatar initials={agent.initials} size="lg" />
            <div><p className="font-medium text-slate-900">{agent.name}</p><p className="text-sm text-slate-500">{agent.agency}</p></div>
          </div>
          <div className="space-y-2 px-5 py-4 text-sm sm:px-6">
            <a href={`mailto:${agent.email}`} className="flex items-center gap-2 text-slate-700 hover:text-blue-700"><Mail className="h-4 w-4 text-slate-400" aria-hidden /> {agent.email}</a>
            <a href={`tel:${agent.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-slate-700 hover:text-blue-700"><Phone className="h-4 w-4 text-slate-400" aria-hidden /> {agent.phone}</a>
          </div>
        </Card>
      </div>
    </div>
  );
}
