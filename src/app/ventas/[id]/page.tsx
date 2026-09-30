import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, MessageCircle, Mail, Phone } from "lucide-react";
import { AddBuyerForm } from "@/components/forms";
import { PageHeader } from "@/components/page-header";
import { StageControl } from "@/components/stage-select";
import { TaskList } from "@/components/task-list";
import { Timeline } from "@/components/timeline";
import { Avatar, Card, CardHeader, KindBadge, StageBadge } from "@/components/ui";
import { buyersLabel, daysFromToday, fmtDate, fullAddress, pen, priceLabel, shortAddress } from "@/lib/format";
import { auditFor, dealById, eventsFor, tasksFor } from "@/lib/store";

export const dynamic = "force-dynamic";

const roleLabel = { principal: "Principal", "co-comprador": "Co-titular", interesado: "Interesado" } as const;

function Row({ label, value, emphasis }: { label: string; value: React.ReactNode; emphasis?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className={emphasis ? "font-semibold text-slate-900" : "text-slate-600"}>{label}</dt>
      <dd className={`text-right tabular-nums ${emphasis ? "font-semibold text-slate-900" : "text-slate-900"}`}>{value}</dd>
    </div>
  );
}

export default function VentaPage({ params }: { params: { id: string } }) {
  const deal = dealById(params.id);
  if (!deal) notFound();
  const tasks = tasksFor(deal.id);
  const events = eventsFor(deal.id);
  const activity = auditFor(deal.id);
  const openTasks = tasks.filter((t) => t.status !== "completed").length;
  const daysToClose = daysFromToday(deal.targetCloseDate);
  const rental = deal.kind === "alquiler";

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/ventas" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Mis Ventas
      </Link>
      <PageHeader
        title={shortAddress(deal)}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <MapPin className="h-4 w-4" aria-hidden /> {deal.address.district}, {deal.address.province}
            <KindBadge kind={deal.kind} />
            <StageBadge stage={deal.stage} />
          </span>
        }
      />

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: rental ? "Renta mensual" : "Precio", value: priceLabel(deal) },
            { label: rental ? "Inicio" : "Cierre objetivo", value: fmtDate(deal.targetCloseDate).replace(/^[^,]+, ?/, "") },
            { label: "Días restantes", value: daysToClose },
            { label: "Tareas abiertas", value: openTasks },
          ].map((s) => (
            <Card key={s.label} className="px-4 py-3">
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{s.value}</p>
            </Card>
          ))}
        </div>

        <Card><StageControl dealId={deal.id} stage={deal.stage} /></Card>

        <Card>
          <CardHeader title={buyersLabel(deal.kind)} count={deal.buyers.length} subtitle="Todas las personas involucradas en esta operación" />
          <ul className="divide-y divide-slate-100">
            {deal.buyers.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-3 px-5 py-4 sm:px-6">
                <Avatar initials={b.initials} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-900">{b.name} <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-600">{roleLabel[b.role]}</span></p>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600">
                    {b.email && <a href={`mailto:${b.email}`} className="flex items-center gap-1.5 hover:text-blue-700"><Mail className="h-3.5 w-3.5 text-slate-400" aria-hidden /> {b.email}</a>}
                    {b.phone && <a href={`tel:${b.phone.replace(/\s/g, "")}`} className="flex items-center gap-1.5 hover:text-blue-700"><Phone className="h-3.5 w-3.5 text-slate-400" aria-hidden /> {b.phone}</a>}
                  </div>
                </div>
                {b.phone && (
                  <a href={`https://wa.me/${b.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100" aria-label={`WhatsApp a ${b.name}`}>
                    <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
                  </a>
                )}
              </li>
            ))}
          </ul>
          <div className="border-t border-slate-100 px-5 py-3 sm:px-6"><AddBuyerForm dealId={deal.id} kind={deal.kind} /></div>
        </Card>

        <Card>
          <CardHeader title="Tareas" count={tasks.length} />
          <TaskList initial={tasks} buyerName={deal.buyers[0]?.name ?? "Comprador"} dealId={deal.id} />
        </Card>

        <Card>
          <CardHeader title="Calendario" subtitle="Eventos de esta operación" href="/calendario" />
          <Timeline events={events} />
        </Card>

        <Card>
          <CardHeader title="Detalles" />
          <dl className="divide-y divide-slate-100 px-5 py-2 text-sm sm:px-6">
            <Row label={rental ? "Renta mensual" : "Precio de oferta"} value={pen(deal.pricePen)} emphasis />
            {deal.listingPricePen && <Row label={rental ? "Renta publicada" : "Precio de lista"} value={pen(deal.listingPricePen)} />}
            {deal.listingPricePen && deal.listingPricePen > deal.pricePen && (
              <Row label="Bajo el precio de lista" value={<span className="text-emerald-700">−{pen(deal.listingPricePen - deal.pricePen)}</span>} />
            )}
            <Row label={rental ? "Propietario" : "Vendedor"} value={deal.sellerName} />
            <Row label="Dirección" value={fullAddress(deal)} />
          </dl>
        </Card>

        <Card>
          <CardHeader title="Actividad" subtitle="Cambios desde el dashboard, el chat y WhatsApp" />
          {activity.length ? (
            <ul className="divide-y divide-slate-100">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start gap-3 px-5 py-3 sm:px-6">
                  {a.source === "whatsapp" ? <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-label="Desde WhatsApp" /> : <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-300" aria-hidden />}
                  <p className="min-w-0 flex-1 text-sm text-slate-800"><span className="font-medium">{a.who}</span> · {a.what}</p>
                  <p className="shrink-0 text-xs text-slate-500">{new Date(a.when).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-6 py-8 text-center text-sm text-slate-500">Sin actividad todavía.</p>
          )}
        </Card>

        <Card>
          <CardHeader title="Notas privadas" subtitle="El comprador no las ve" />
          <p className="px-5 py-4 text-sm leading-relaxed text-slate-700 sm:px-6">{deal.notes || "—"}</p>
        </Card>
      </div>
    </div>
  );
}
