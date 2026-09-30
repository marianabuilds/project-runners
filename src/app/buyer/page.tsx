import Link from "next/link";
import clsx from "clsx";
import { Eye, Home, Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TaskList } from "@/components/task-list";
import { Timeline } from "@/components/timeline";
import { Avatar, Button, Card, CardHeader, IconTile, KindBadge, StageTracker } from "@/components/ui";
import { agent } from "@/lib/data";
import { buyersLabel, priceLabel, shortAddress } from "@/lib/format";
import { dealById, eventsFor, getDeals, tasksFor } from "@/lib/store";

export const dynamic = "force-dynamic";

// Vista previa de lo que ve la compradora (Lucía) de la venta d1.
export default function BuyerView({ searchParams }: { searchParams: { venta?: string; comprador?: string } }) {
  const all = getDeals();
  const deal = (searchParams.venta && dealById(searchParams.venta)) || all[0];
  const buyer = deal.buyers.find((b) => b.id === searchParams.comprador) ?? deal.buyers[0];
  const myTasks = tasksFor(deal.id).filter((t) => t.assignee === "buyer");
  const events = eventsFor(deal.id);
  const open = myTasks.filter((t) => t.status !== "completed").length;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center gap-3 rounded-2xl bg-miel-100 px-5 py-4 text-lg text-cafe-900 ring-1 ring-miel-300">
        <Eye className="h-6 w-6 shrink-0 text-cafe-600" aria-hidden />
        <p>
          Así ve <strong>{buyer?.name}</strong> su {deal.kind === "venta" ? "venta" : "alquiler"}.
        </p>
      </div>
      <div className="-mt-4 mb-8 space-y-3">
        <div className="flex flex-wrap gap-2" aria-label="Elegir operación">
          {all.map((d) => (
            <Link key={d.id} href={`/buyer?venta=${d.id}`} className={clsx("inline-flex min-h-[48px] items-center rounded-2xl px-4 text-base font-semibold", d.id === deal.id ? "bg-cafe-600 text-white" : "bg-miel-100 text-cafe-800 hover:bg-miel-200")}>
              {shortAddress(d)}
            </Link>
          ))}
        </div>
        {deal.buyers.length > 1 && (
          <div className="flex flex-wrap items-center gap-2 text-base text-cafe-800">
            {buyersLabel(deal.kind)}:
            {deal.buyers.map((b) => (
              <Link key={b.id} href={`/buyer?venta=${deal.id}&comprador=${b.id}`} className={clsx("inline-flex min-h-[44px] items-center rounded-2xl px-4 font-semibold", b.id === buyer?.id ? "bg-cafe-600 text-white" : "bg-miel-100 hover:bg-miel-200")}>
                {b.name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <PageHeader
        title={<>Hola, {buyer?.name.split(" ")[0]} <span aria-hidden>👋</span></>}
        subtitle={
          open === 0 ? (
            "Por ahora no tienes nada pendiente."
          ) : (
            <>
              Tienes <strong>{open}</strong> {open === 1 ? "cosa" : "cosas"} por hacer para {deal.kind === "venta" ? "tu nuevo hogar" : "tu alquiler"}.
            </>
          )
        }
      />

      <Card className="mb-8">
        <div className="flex flex-wrap items-center gap-4 px-5 py-6 sm:px-7">
          <IconTile>
            <Home className="h-6 w-6" />
          </IconTile>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-base text-cafe-700">{deal.kind === "venta" ? "Tu nuevo hogar" : "Tu alquiler"} <KindBadge kind={deal.kind} /></p>
            <p className="font-heading text-2xl text-cafe-900 sm:text-3xl">{shortAddress(deal)}</p>
            <p className="text-base text-cafe-700">
              {deal.address.district}, {deal.address.province}
            </p>
          </div>
          <p className="font-heading text-2xl tabular-nums text-cafe-900 sm:text-3xl">{priceLabel(deal)}</p>
        </div>
        <div className="border-t border-miel-100 px-3 py-7 sm:px-7">
          <StageTracker stage={deal.stage} />
        </div>
      </Card>

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <Card>
            <CardHeader title="Lo que te toca hacer" />
            <TaskList initial={myTasks} buyerName={buyer?.name ?? ""} mode="buyer" />
          </Card>
          <Card>
            <CardHeader title="Fechas de tu compra" />
            <Timeline events={events} />
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader title="Tu agente" />
            <div className="flex items-center gap-4 px-5 pt-6 sm:px-7">
              <Avatar initials={agent.initials} size="lg" />
              <div className="min-w-0">
                <p className="text-lg font-semibold text-cafe-900">{agent.name}</p>
                <p className="text-base text-cafe-700">{agent.agency}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 px-5 py-6 sm:px-7">
              <Button href={`tel:${agent.phone.replace(/\s/g, "")}`}>
                <Phone className="h-5 w-5" aria-hidden /> Llamar
              </Button>
              <Button href={`mailto:${agent.email}`} variant="secondary">
                <Mail className="h-5 w-5" aria-hidden /> Escribir correo
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
