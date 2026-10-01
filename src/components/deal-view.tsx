"use client";

import Link from "next/link";
import { ArrowLeft, Mail, MapPin, MessageCircle, Pencil, Phone } from "lucide-react";
import { ActivityFeed } from "./activity-feed";
import { StageControl } from "./stage-select";
import { TaskList } from "./task-list";
import { Avatar, Card, CardHeader, StageBadge } from "./ui";
import { agent, dealById } from "@/lib/data";
import { daysFromToday, fmtDate, fullAddress, pen, shortAddress } from "@/lib/format";
import { useStore } from "@/lib/store";
import { waLink } from "@/lib/whatsapp";

function Row({ label, value, emphasis }: { label: string; value: React.ReactNode; emphasis?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className={emphasis ? "font-semibold text-ink" : "text-ink-muted"}>{label}</dt>
      <dd className={`text-right tabular-nums ${emphasis ? "font-semibold text-ink" : "text-ink"}`}>{value}</dd>
    </div>
  );
}

const btn = "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition";

function ContactCard({ title, name, email, phone, initials, photo, subtitle }: { title: string; name: string; email?: string; phone?: string; initials: string; photo?: string; subtitle?: string }) {
  return (
    <Card tone="sky" className="h-full">
      <CardHeader tone="sky" title={title} subtitle={subtitle} />
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-sm ring-1 ring-navy/5">
          <Avatar initials={initials} size="lg" src={photo} />
          <div className="min-w-0">
            <p className="font-semibold text-ink">{name}</p>
            {email && <p className="truncate text-sm text-ink-muted">{email}</p>}
          </div>
        </div>
        {phone && email && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            <a href={`tel:${phone.replace(/\s/g, "")}`} className={`${btn} bg-navy text-white hover:bg-navy-600`}>
              <Phone className="h-4 w-4" aria-hidden /> Llamar
            </a>
            <a href={waLink(phone, "Hola! Quisiera hablar sobre el negocio inmobiliario.")} target="_blank" rel="noopener noreferrer" className={`${btn} bg-accent text-on-accent hover:brightness-95`}>
              <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
            </a>
            <a href={`mailto:${email}`} className={`${btn} bg-surface text-ink ring-1 ring-navy/10 hover:bg-paper`}>
              <Mail className="h-4 w-4" aria-hidden /> Correo
            </a>
          </div>
        )}
      </div>
    </Card>
  );
}

export function DealView({ id }: { id: string }) {
  const { role, deals, visibleTasks, stageOf } = useStore();
  const base = dealById(id)!;
  if (!deals.some((d) => d.id === id)) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl bg-surface p-8 text-center ring-1 ring-navy-100">
        <p className="font-semibold text-ink">No tienes acceso a este negocio.</p>
        <Link href="/deals" className="mt-3 inline-block text-sm text-ink underline">Volver a mis negocios</Link>
      </div>
    );
  }
  const deal = { ...base, stage: stageOf(id) };
  const tasks = visibleTasks.filter((t) => t.dealId === id);
  const openTasks = tasks.filter((t) => t.status !== "completed").length;
  const isAgent = role === "agent";

  const stats = [
    { label: role === "seller" ? "Oferta recibida" : "Precio", value: pen(deal.pricePen, 0) },
    { label: "Cierre", value: fmtDate(deal.targetCloseDate).replace(/^\w+\.?, /, "") },
    { label: "Días para cerrar", value: String(daysFromToday(deal.targetCloseDate)) },
    { label: "Tareas abiertas", value: String(openTasks) },
  ];

  return (
    <div className="mx-auto max-w-7xl pb-10">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Link href="/deals" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink lg:col-span-12">
          <ArrowLeft className="h-4 w-4" aria-hidden /> {isAgent ? "Todos los negocios" : "Volver"}
        </Link>

        <Card tone="navy" className="p-6 sm:p-8 lg:col-span-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" aria-hidden />
          <div className="relative flex items-start justify-between gap-4">
            <div className="min-w-0">
              <StageBadge stage={deal.stage} />
              <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{shortAddress(deal)}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-white/60">
                <MapPin className="h-4 w-4" aria-hidden /> {deal.address.district}, {deal.address.province}
              </p>
            </div>
            {isAgent && (
              <button className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20 sm:flex">
                <Pencil className="h-4 w-4" aria-hidden /> Editar
              </button>
            )}
          </div>
          <dl className="relative mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s, i) => (
              <div key={s.label} className={i === 0 ? "rounded-2xl bg-accent p-3 text-on-accent" : "rounded-2xl bg-white/10 p-3"}>
                <dt className={i === 0 ? "text-xs text-ink-soft" : "text-xs text-white/60"}>{s.label}</dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card className="lg:col-span-12">
          <StageControl dealId={id} />
        </Card>

        {/* Contacts: each role only sees who they need */}
        {isAgent && (
          <div className="lg:col-span-6">
            <ContactCard title="Comprador" subtitle="Invitación aceptada" name={deal.buyer.name} email={deal.buyer.email} phone={deal.buyer.phone} initials={deal.buyer.initials} />
          </div>
        )}
        {isAgent && (
          <div className="lg:col-span-6">
            <ContactCard title="Vendedor" subtitle="Propietario del inmueble" name={deal.sellerName} initials={deal.sellerName.split(" ").map((w) => w[0]).join("").slice(0, 2)} />
          </div>
        )}
        {!isAgent && (
          <div className="lg:col-span-12">
            <ContactCard title="Tu agente" name={agent.name} email={agent.email} phone={agent.phone} initials={agent.initials} photo={agent.photo} subtitle={agent.agency} />
          </div>
        )}

        <Card className="lg:col-span-8">
          <CardHeader title="Tareas" count={tasks.length} />
          <TaskList tasks={tasks} />
        </Card>

        <div className="space-y-5 lg:col-span-4">
          <Card tone="paper">
            <CardHeader tone="paper" title="Detalles del negocio" />
            <dl className="divide-y divide-navy-100 px-5 py-2 text-sm sm:px-6">
              <Row label={role === "seller" ? "Oferta recibida" : "Precio oferta"} value={pen(deal.pricePen)} emphasis />
              {deal.listingPricePen && <Row label="Precio de lista" value={pen(deal.listingPricePen)} />}
              {deal.listingPricePen && role !== "buyer" && (
                <Row label="Por debajo de lista" value={<span className="text-emerald-700 dark:text-emerald-300">−{pen(deal.listingPricePen - deal.pricePen)}</span>} />
              )}
              <Row label="Vendedor" value={deal.sellerName} />
              <Row label="Dirección" value={fullAddress(deal)} />
            </dl>
          </Card>
          {isAgent && (
            <Card tone="sky">
              <CardHeader tone="sky" title="Notas privadas" subtitle="Comprador y vendedor no pueden ver esto" />
              <p className="px-5 py-4 text-sm leading-relaxed text-ink sm:px-6">{deal.notes}</p>
            </Card>
          )}
        </div>

        <Card className="lg:col-span-12">
          <CardHeader title="Actividad" subtitle="Cambios de etapa y tareas, visibles para todos los participantes" />
          <ActivityFeed dealId={id} />
        </Card>
      </div>
    </div>
  );
}
