import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StageControl } from "@/components/stage-select";
import { TaskList } from "@/components/task-list";
import { Timeline } from "@/components/timeline";
import { Avatar, Button, Card, CardHeader, StageBadge } from "@/components/ui";
import { dealById, deals, eventsFor, tasksFor } from "@/lib/data";
import { fullAddress, pen, shortAddress } from "@/lib/format";

export function generateStaticParams() {
  return deals.map((d) => ({ id: d.id }));
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-4">
      <dt className="text-base text-cafe-700">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-cafe-900">{value}</dd>
    </div>
  );
}

export default function DealPage({ params }: { params: { id: string } }) {
  const deal = dealById(params.id);
  if (!deal) notFound();
  const tasks = tasksFor(deal.id);
  const events = eventsFor(deal.id);

  return (
    <div className="mx-auto max-w-6xl">
      <Link
        href="/deals"
        className="mb-4 inline-flex min-h-[48px] items-center gap-2 rounded-2xl px-3 text-lg font-semibold text-cafe-600 hover:bg-miel-100"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden /> Mis ventas
      </Link>
      <PageHeader
        title={shortAddress(deal)}
        subtitle={
          <span className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-5 w-5" aria-hidden /> {deal.address.district}, {deal.address.province}
            </span>
            <StageBadge stage={deal.stage} />
          </span>
        }
      />

      <div className="grid gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          <Card>
            <StageControl initial={deal.stage} />
          </Card>

          <Card>
            <CardHeader title="Lo que falta hacer" count={tasks.length} />
            <TaskList initial={tasks} buyerName={deal.buyer.name} />
          </Card>

          <Card>
            <CardHeader title="Fechas importantes" />
            <Timeline events={events} />
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader title={deal.buyer.name} subtitle="Comprador/a" />
            <div className="flex items-center gap-4 px-5 pt-5 sm:px-7">
              <Avatar initials={deal.buyer.initials} size="lg" />
              <div className="min-w-0 text-base text-cafe-700">
                <p className="truncate">{deal.buyer.phone}</p>
                <p className="truncate">{deal.buyer.email}</p>
              </div>
            </div>
            <div className="grid gap-3 px-5 py-5 sm:px-7">
              <a
                href={`tel:${deal.buyer.phone.replace(/\s/g, "")}`}
                className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-cafe-600 px-6 text-lg font-semibold text-white hover:bg-cafe-700"
              >
                <Phone className="h-6 w-6" aria-hidden /> Llamar
              </a>
              <a
                href={`mailto:${deal.buyer.email}`}
                className="inline-flex min-h-[56px] items-center justify-center gap-2 rounded-2xl bg-miel-300 px-6 text-lg font-semibold text-cafe-900 hover:bg-miel-400"
              >
                <Mail className="h-6 w-6" aria-hidden /> Escribir correo
              </a>
            </div>
          </Card>

          <Card>
            <CardHeader title="Datos de la venta" />
            <dl className="divide-y divide-miel-100 px-5 py-1 sm:px-7">
              <Row label="Precio" value={<span className="tabular-nums">{pen(deal.pricePen)}</span>} />
              <Row label="Vendedor" value={deal.sellerName} />
              <Row label="Dirección" value={fullAddress(deal)} />
            </dl>
          </Card>

          <Card>
            <CardHeader title="Notas (solo tú las ves)" />
            <p className="px-5 py-5 text-lg leading-relaxed text-cafe-800 sm:px-7">{deal.notes}</p>
          </Card>

          <Button href="/deals" variant="secondary" className="w-full lg:hidden">
            <ArrowLeft className="h-5 w-5" aria-hidden /> Volver a mis ventas
          </Button>
        </div>
      </div>
    </div>
  );
}
