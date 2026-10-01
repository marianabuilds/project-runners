import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus, Mail, MapPin, MessageCircle, Pencil, Phone } from "lucide-react";
import { StageControl } from "@/components/stage-select";
import { TaskList } from "@/components/task-list";
import { Timeline } from "@/components/timeline";
import { Avatar, Card, CardHeader, StageBadge } from "@/components/ui";
import { auditFor, dealById, deals, eventsFor, tasksFor } from "@/lib/data";
import { waLink } from "@/lib/whatsapp";
import { daysFromToday, fmtDate, fullAddress, pen, shortAddress } from "@/lib/format";

export function generateStaticParams() {
  return deals.map((d) => ({ id: d.id }));
}

function Row({ label, value, emphasis }: { label: string; value: React.ReactNode; emphasis?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className={emphasis ? "font-semibold text-navy" : "text-navy-200"}>{label}</dt>
      <dd className={`text-right tabular-nums ${emphasis ? "font-semibold text-navy" : "text-navy"}`}>{value}</dd>
    </div>
  );
}

export default function DealPage({ params }: { params: { id: string } }) {
  const deal = dealById(params.id);
  if (!deal) notFound();
  const tasks = tasksFor(deal.id);
  const events = eventsFor(deal.id);
  const activity = auditFor(deal.id);
  const openTasks = tasks.filter((t) => t.status !== "completed").length;
  const daysToClose = daysFromToday(deal.targetCloseDate);

  const stats = [
    { label: "Precio", value: pen(deal.pricePen, 0) },
    { label: "Cierre", value: fmtDate(deal.targetCloseDate).replace(/^\w+\.?, /, "") },
    { label: "Días para cerrar", value: String(daysToClose) },
    { label: "Tareas abiertas", value: String(openTasks) },
  ];
  const btn = "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition";

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-10">
      <Link href="/deals" className="inline-flex items-center gap-1.5 text-sm text-navy-200 hover:text-navy">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Todos los negocios
      </Link>

      {/* Hero */}
      <Card tone="navy" className="p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" aria-hidden />
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <StageBadge stage={deal.stage} />
            <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{shortAddress(deal)}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-white/60">
              <MapPin className="h-4 w-4" aria-hidden /> {deal.address.district}, {deal.address.province}
            </p>
          </div>
          <button className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20 sm:flex">
            <Pencil className="h-4 w-4" aria-hidden /> Editar
          </button>
        </div>
        <dl className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} className={i === 0 ? "rounded-2xl bg-accent p-3 text-navy" : "rounded-2xl bg-white/10 p-3"}>
              <dt className={i === 0 ? "text-xs text-navy-600" : "text-xs text-white/60"}>{s.label}</dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums">{s.value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {/* Stage progress */}
      <Card>
        <StageControl initial={deal.stage} />
      </Card>

      {/* Buyer */}
      <Card tone="sky">
        <CardHeader tone="sky" title="Comprador" subtitle="Invitación aceptada" />
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy/5">
            <Avatar initials={deal.buyer.initials} size="lg" />
            <div className="min-w-0">
              <p className="font-semibold text-navy">{deal.buyer.name}</p>
              <p className="truncate text-sm text-navy-200">{deal.buyer.email}</p>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <a href={`tel:${deal.buyer.phone.replace(/\s/g, "")}`} className={`${btn} bg-navy text-white hover:bg-navy-600`}>
              <Phone className="h-4 w-4" aria-hidden /> Llamar
            </a>
            <a
              href={waLink(deal.buyer.phone, "Hola! Quisiera hablar sobre el negocio inmobiliario.")}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btn} bg-accent text-navy hover:brightness-95`}
            >
              <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
            </a>
            <a href={`mailto:${deal.buyer.email}`} className={`${btn} bg-white text-navy ring-1 ring-navy/10 hover:bg-paper`}>
              <Mail className="h-4 w-4" aria-hidden /> Correo
            </a>
          </div>
        </div>
      </Card>

      {/* Timeline */}
      <Card tone="sun">
        <CardHeader
          tone="sun"
          title="Cronograma"
          action={
            <button className="flex items-center gap-1 text-sm font-medium text-navy hover:text-navy-600">
              <CalendarPlus className="h-4 w-4" aria-hidden /> Agregar al calendario
            </button>
          }
        />
        <Timeline events={events} />
      </Card>

      {/* Tasks */}
      <Card>
        <CardHeader title="Tareas" count={tasks.length} />
        <TaskList initial={tasks} buyerName={deal.buyer.name} />
      </Card>

      {/* Details */}
      <Card tone="paper">
        <CardHeader tone="paper" title="Detalles del negocio" />
        <dl className="divide-y divide-navy-100 px-5 py-2 text-sm sm:px-6">
          <Row label="Precio oferta" value={pen(deal.pricePen)} emphasis />
          {deal.listingPricePen && <Row label="Precio de lista" value={pen(deal.listingPricePen)} />}
          {deal.listingPricePen && (
            <Row label="Por debajo de lista" value={<span className="text-emerald-700">−{pen(deal.listingPricePen - deal.pricePen)}</span>} />
          )}
          <Row label="Vendedor" value={deal.sellerName} />
          <Row label="Dirección" value={fullAddress(deal)} />
        </dl>
      </Card>

      <Card tone="sky">
        <CardHeader tone="sky" title="Notas privadas" subtitle="El comprador no puede ver esto" />
        <p className="px-5 py-4 text-sm leading-relaxed text-navy sm:px-6">{deal.notes}</p>
      </Card>

      {/* Activity */}
      <Card>
        <CardHeader title="Actividad" subtitle="Cambios de etapa y tareas, visibles solo para ti" />
        {activity.length ? (
          <ul className="divide-y divide-navy-100">
            {activity.map((a) => (
              <li key={a.id} className="flex flex-col gap-0.5 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-sm text-navy">
                  <span className="font-medium">{a.who}</span> · {a.what}
                </p>
                <p className="text-xs text-navy-200">{new Date(a.when).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" })}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-6 py-8 text-center text-sm text-navy-200">Sin actividad aún.</p>
        )}
      </Card>
    </div>
  );
}
