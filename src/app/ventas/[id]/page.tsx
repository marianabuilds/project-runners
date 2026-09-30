import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { AddBuyerForm } from "@/components/forms";
import { PageHeader } from "@/components/page-header";
import { StageControl } from "@/components/stage-select";
import { TaskList } from "@/components/task-list";
import { Timeline } from "@/components/timeline";
import { Avatar, Button, Card, CardHeader, KindBadge, StageBadge } from "@/components/ui";
import { buyersLabel, fullAddress, pen, priceLabel, shortAddress } from "@/lib/format";
import { auditFor, dealById, eventsFor, tasksFor } from "@/lib/store";

export const dynamic = "force-dynamic";

const roleLabel = { principal: "Principal", "co-comprador": "Co-titular", interesado: "Interesado" } as const;

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="py-4">
      <dt className="text-base text-cafe-700">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-cafe-900">{value}</dd>
    </div>
  );
}

export default function VentaPage({ params }: { params: { id: string } }) {
  const deal = dealById(params.id);
  if (!deal) notFound();
  const tasks = tasksFor(deal.id);
  const events = eventsFor(deal.id);
  const activity = auditFor(deal.id).slice(0, 6);
  const rental = deal.kind === "alquiler";

  return (
    <div className="container-page">
      <Link href="/ventas" className="mb-4 inline-flex min-h-[48px] items-center gap-2 rounded-2xl px-3 text-lg font-semibold text-cafe-600 hover:bg-miel-100">
        <ArrowLeft className="h-5 w-5" aria-hidden /> Mis ventas
      </Link>
      <PageHeader
        title={shortAddress(deal)}
        subtitle={
          <span className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5"><MapPin className="h-5 w-5" aria-hidden /> {deal.address.district}, {deal.address.province}</span>
            <KindBadge kind={deal.kind} />
            <StageBadge stage={deal.stage} />
          </span>
        }
      />

      <div className="space-y-8">
        <Card><StageControl dealId={deal.id} stage={deal.stage} /></Card>

        <Card>
          <CardHeader title={buyersLabel(deal.kind)} count={deal.buyers.length} subtitle="Todas las personas de esta operación" />
          <ul className="divide-y divide-miel-100">
            {deal.buyers.map((b) => (
              <li key={b.id} className="px-5 py-5 sm:px-7">
                <div className="flex items-center gap-4">
                  <Avatar initials={b.initials} size="lg" />
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-semibold text-cafe-900">{b.name}</p>
                    <p className="text-base text-cafe-700">{roleLabel[b.role]}</p>
                    {b.phone && <p className="truncate text-base text-cafe-700">{b.phone}</p>}
                    {b.email && <p className="truncate text-base text-cafe-700">{b.email}</p>}
                  </div>
                </div>
                {(b.phone || b.email) && (
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    {b.phone && (
                      <a href={`https://wa.me/${b.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-cafe-600 px-4 text-lg font-semibold text-white hover:bg-cafe-700" aria-label={`WhatsApp a ${b.name}`}>
                        <MessageCircle className="h-5 w-5" aria-hidden /> WhatsApp
                      </a>
                    )}
                    {b.phone && (
                      <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-miel-300 px-4 text-lg font-semibold text-cafe-900 hover:bg-miel-400" aria-label={`Llamar a ${b.name}`}>
                        <Phone className="h-5 w-5" aria-hidden /> Llamar
                      </a>
                    )}
                    {b.email && (
                      <a href={`mailto:${b.email}`} className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-miel-300 px-4 text-lg font-semibold text-cafe-900 hover:bg-miel-400" aria-label={`Escribir a ${b.name}`}>
                        <Mail className="h-5 w-5" aria-hidden /> Correo
                      </a>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
          <div className="border-t border-miel-100 px-5 py-5 sm:px-7"><AddBuyerForm dealId={deal.id} kind={deal.kind} /></div>
        </Card>

        <Card>
          <CardHeader title="Lo que falta hacer" count={tasks.length} />
          <TaskList initial={tasks} buyerName={deal.buyers[0]?.name ?? "el cliente"} dealId={deal.id} />
        </Card>

        <Card>
          <CardHeader title="Fechas importantes" href="/calendario" linkLabel="Calendario" />
          <Timeline events={events} />
        </Card>

        <Card>
          <CardHeader title={rental ? "Datos del alquiler" : "Datos de la venta"} />
          <dl className="divide-y divide-miel-100 px-5 py-1 sm:px-7">
            <Row label={rental ? "Renta mensual" : "Precio"} value={<span className="tabular-nums">{priceLabel(deal, 2)}</span>} />
            {deal.listingPricePen && deal.listingPricePen > deal.pricePen && (
              <Row label="Precio publicado" value={<span className="tabular-nums">{pen(deal.listingPricePen)}</span>} />
            )}
            <Row label={rental ? "Propietario" : "Vendedor"} value={deal.sellerName} />
            <Row label="Dirección" value={fullAddress(deal)} />
          </dl>
        </Card>

        <Card>
          <CardHeader title="Últimos cambios" subtitle="Desde el dashboard, el chat y WhatsApp" />
          {activity.length ? (
            <ul className="divide-y divide-miel-100">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-5 py-4 sm:px-7">
                  {a.source === "whatsapp" ? <MessageCircle className="mt-1 h-5 w-5 shrink-0 text-green-700" aria-label="Desde WhatsApp" /> : <span className="mt-2.5 h-2.5 w-2.5 shrink-0 rounded-full bg-cafe-300" aria-hidden />}
                  <p className="min-w-0 flex-1 text-base text-cafe-900">{a.what}</p>
                  <time className="shrink-0 text-sm text-cafe-700">{new Date(a.when).toLocaleDateString("es-PE", { day: "numeric", month: "short" })}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-8 text-center text-lg text-cafe-700 sm:px-7">Todavía no hay cambios.</p>
          )}
        </Card>

        <Card>
          <CardHeader title="Notas (solo tú las ves)" />
          <p className="px-5 py-5 text-lg leading-relaxed text-cafe-800 sm:px-7">{deal.notes || "—"}</p>
        </Card>

        <Button href="/ventas" variant="secondary" className="w-full"><ArrowLeft className="h-5 w-5" aria-hidden /> Volver a mis ventas</Button>
      </div>
    </div>
  );
}
