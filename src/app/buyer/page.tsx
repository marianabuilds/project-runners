import { Eye, Home, Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TaskList } from "@/components/task-list";
import { Timeline } from "@/components/timeline";
import { Avatar, Button, Card, CardHeader, IconTile, StageTracker } from "@/components/ui";
import { agent, dealById, eventsFor, tasksFor } from "@/lib/data";
import { pen, shortAddress } from "@/lib/format";

// Vista previa de lo que ve la compradora (Lucía) de la venta d1.
export default function BuyerView() {
  const deal = dealById("d1")!;
  const myTasks = tasksFor(deal.id).filter((t) => t.assignee === "buyer");
  const events = eventsFor(deal.id);
  const open = myTasks.filter((t) => t.status !== "completed").length;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8 flex items-center gap-3 rounded-2xl bg-miel-100 px-5 py-4 text-lg text-cafe-900 ring-1 ring-miel-300">
        <Eye className="h-6 w-6 shrink-0 text-cafe-600" aria-hidden />
        <p>
          Así ve <strong>{deal.buyer.name}</strong> su venta.
        </p>
      </div>

      <PageHeader
        title={<>Hola, {deal.buyer.name.split(" ")[0]} <span aria-hidden>👋</span></>}
        subtitle={
          open === 0 ? (
            "Por ahora no tienes nada pendiente."
          ) : (
            <>
              Tienes <strong>{open}</strong> {open === 1 ? "cosa" : "cosas"} por hacer para tu nuevo hogar.
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
            <p className="text-base text-cafe-700">Tu nuevo hogar</p>
            <p className="font-heading text-2xl text-cafe-900 sm:text-3xl">{shortAddress(deal)}</p>
            <p className="text-base text-cafe-700">
              {deal.address.district}, {deal.address.province}
            </p>
          </div>
          <p className="font-heading text-2xl tabular-nums text-cafe-900 sm:text-3xl">{pen(deal.pricePen)}</p>
        </div>
        <div className="border-t border-miel-100 px-3 py-7 sm:px-7">
          <StageTracker stage={deal.stage} />
        </div>
      </Card>

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <Card>
            <CardHeader title="Lo que te toca hacer" />
            <TaskList initial={myTasks} buyerName={deal.buyer.name} mode="buyer" />
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
