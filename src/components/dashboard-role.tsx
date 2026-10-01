"use client";

import Link from "next/link";
import { CalendarDays, ListChecks, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { ActivityFeed } from "./activity-feed";
import { TaskCtaButton } from "./task-cta";
import { Badge, ownerBadge } from "./agenda";
import { WeekStrip } from "./week-strip";
import { WhatsAppCard } from "./whatsapp-card";
import { Avatar, Card, CardHeader, StageBadge, StageTracker } from "./ui";
import { agent, TODAY } from "@/lib/data";
import { daysFromToday, fmtLong, pen, relativeDue, shortAddress } from "@/lib/format";
import { useStore } from "@/lib/store";
import { waLink } from "@/lib/whatsapp";

/** Buyer / seller panel: same shared data as the agent, scoped to their own deal. */
export function RoleDashboard() {
  const { role, me, deals, visibleTasks } = useStore();
  const deal = deals[0];
  if (!deal) return null;
  const open = visibleTasks.filter((t) => t.status !== "completed").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const mine = open.filter((t) => t.assignee === role).length;
  const isBuyer = role === "buyer";
  const btn = "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition";

  const stats = isBuyer
    ? [
        { label: "Tu oferta", value: pen(deal.pricePen, 0) },
        { label: "Etapa", value: <StageBadge stage={deal.stage} /> },
        { label: "Cierre estimado", value: fmtLong(deal.targetCloseDate).replace(/^\w+, /, "") },
      ]
    : [
        { label: "Precio de lista", value: pen(deal.listingPricePen ?? deal.pricePen, 0) },
        { label: "Oferta recibida", value: pen(deal.pricePen, 0) },
        { label: "Cierre estimado", value: fmtLong(deal.targetCloseDate).replace(/^\w+, /, "") },
      ];

  return (
    <div className="mx-auto max-w-7xl pb-10">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card tone="navy" className="p-6 sm:p-8 lg:col-span-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" aria-hidden />
          <div className="relative">
            <p className="text-sm text-white/60">{fmtLong(TODAY)}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
              Hola, {me.name.split(" ")[0]} <span aria-hidden>👋</span>
            </h1>
            <p className="mt-3 flex items-center gap-1.5 text-white/70">
              <MapPin className="h-4 w-4" aria-hidden /> {shortAddress(deal)}, {deal.address.district}
            </p>
            <p className="mt-4 inline-block rounded-2xl bg-white/10 px-4 py-2.5 text-sm">
              Tienes <strong className="text-accent">{mine}</strong> {mine === 1 ? "cosa" : "cosas"} por hacer {isBuyer ? "para tu nuevo hogar" : "para cerrar la venta"}.
            </p>
            <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {stats.map((s, i) => (
                <div key={s.label} className={i === 0 ? "rounded-2xl bg-accent p-3 text-navy" : "rounded-2xl bg-white/10 p-3"}>
                  <dt className={i === 0 ? "text-xs text-navy-600" : "text-xs text-white/60"}>{s.label}</dt>
                  <dd className="mt-1 text-lg font-semibold tabular-nums">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Card>

        <Card className="lg:col-span-12">
          <CardHeader title={isBuyer ? "Progreso de tu compra" : "Progreso de la venta"} />
          <div className="px-3 py-6 sm:px-6">
            <StageTracker stage={deal.stage} />
          </div>
        </Card>

        <Card className="lg:col-span-7">
          <CardHeader
            title="Esta semana"
            subtitle="Toca un día para ver sus pendientes"
            icon={<span className="grid h-10 w-10 place-items-center rounded-xl bg-sky text-navy" aria-hidden><CalendarDays className="h-5 w-5" /></span>}
            action={<Link href="/calendar" className="text-sm font-medium text-navy hover:text-navy-200">Calendario</Link>}
          />
          <WeekStrip />
        </Card>

        <Card tone="sky" className="lg:col-span-5">
          <CardHeader
            tone="sky"
            title="Cosas por hacer"
            count={open.length}
            href="/tasks"
            icon={<span className="grid h-10 w-10 place-items-center rounded-xl bg-navy text-white" aria-hidden><ListChecks className="h-5 w-5" /></span>}
          />
          <ul className="space-y-2 p-3 sm:p-4">
            {open.length === 0 && <li className="rounded-2xl bg-white/70 p-4 text-sm text-navy-600">Todo al día. 🎉</li>}
            {open.slice(0, 6).map((t) => {
              const late = daysFromToday(t.dueDate) < 0;
              return (
                <li key={t.id} className="flex items-center gap-3 rounded-2xl border-l-4 border-navy bg-white p-3 shadow-sm ring-1 ring-navy/5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-navy">{t.title}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      {late && <Badge kind="atrasada" />}
                      <Badge kind={ownerBadge(t.assignee, role)} />
                      <span className="text-[11px] text-navy-200">{relativeDue(t.dueDate)}</span>
                    </div>
                  </div>
                  <TaskCtaButton task={t} />
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="lg:col-span-7">
          <CardHeader title="Actividad" subtitle="Cualquier cambio se actualiza para todos" />
          <ActivityFeed dealId={deal.id} limit={8} />
        </Card>

        <div className="space-y-5 lg:col-span-5">
          <WhatsAppCard />
          <Card tone="paper">
            <CardHeader tone="paper" title="Tu agente" />
            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy/5">
                <Avatar initials={agent.initials} size="lg" src={agent.photo} />
                <div>
                  <p className="font-semibold text-navy">{agent.name}</p>
                  <p className="text-sm text-navy-200">{agent.agency}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <a href={`tel:${agent.phone.replace(/\s/g, "")}`} className={`${btn} bg-navy text-white hover:bg-navy-600`}>
                  <Phone className="h-4 w-4" aria-hidden /> Llamar
                </a>
                <a href={waLink(agent.phone, "Hola! Quisiera hablar sobre el negocio.")} target="_blank" rel="noopener noreferrer" className={`${btn} bg-accent text-navy hover:brightness-95`}>
                  <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
                </a>
                <a href={`mailto:${agent.email}`} className={`${btn} bg-white text-navy ring-1 ring-navy/10 hover:bg-paper`}>
                  <Mail className="h-4 w-4" aria-hidden /> Correo
                </a>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
