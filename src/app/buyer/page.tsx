import { Eye, Mail, MessageCircle, Phone } from "lucide-react";
import { TaskList } from "@/components/task-list";
import { Timeline } from "@/components/timeline";
import { Avatar, Card, CardHeader, StageBadge, StageTracker } from "@/components/ui";
import { agent, dealById, eventsFor, tasksFor } from "@/lib/data";
import { daysFromToday, fmtDate, pen, shortAddress } from "@/lib/format";
import { waLink } from "@/lib/whatsapp";

// Preview of what the buyer (Lucía) sees for deal d1.
export default function BuyerView() {
  const deal = dealById("d1")!;
  const myTasks = tasksFor(deal.id).filter((t) => t.assignee === "buyer");
  const events = eventsFor(deal.id);
  const nextThree = events.filter((e) => daysFromToday(e.date) >= 0).slice(0, 3);
  const open = myTasks.filter((t) => t.status !== "completed").length;
  const btn = "flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition";

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-10">
      <div className="flex items-center gap-2 rounded-2xl bg-accent/40 px-4 py-2.5 text-sm text-navy ring-1 ring-accent">
        <Eye className="h-4 w-4 shrink-0" aria-hidden />
        <span>
          Previsualización: esto es lo que ve <strong>{deal.buyer.name}</strong>.
        </span>
      </div>

      {/* Hero */}
      <Card tone="navy" className="p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/20 blur-3xl" aria-hidden />
        <div className="relative">
          <p className="text-sm text-white/60">
            Hola, {deal.buyer.name.split(" ")[0]} <span aria-hidden>👋</span>
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">{shortAddress(deal)}</h1>
          <p className="text-white/60">
            {deal.address.district}, {deal.address.province}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-3xl font-semibold tabular-nums">{pen(deal.pricePen)}</p>
            <StageBadge stage={deal.stage} />
          </div>
          <p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm">
            Tienes <strong className="text-accent">{open}</strong> {open === 1 ? "cosa" : "cosas"} por hacer para tu nuevo hogar.
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader title="Progreso de tu compra" />
        <div className="px-3 py-6 sm:px-6">
          <StageTracker stage={deal.stage} />
        </div>
      </Card>

      {/* Next dates */}
      <div className="grid gap-3 sm:grid-cols-3">
        {nextThree.map((e, i) => (
          <Card key={e.id} tone={i === 0 ? "sun" : "sky"} className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-navy-600">{e.name}</p>
            <p className="mt-1 font-semibold text-navy">{fmtDate(e.date)}</p>
            <p className="text-xs text-navy-600">en {daysFromToday(e.date)} días</p>
          </Card>
        ))}
      </div>

      <Card tone="sky">
        <CardHeader tone="sky" title="Tus tareas" count={myTasks.length} />
        <div className="bg-white">
          <TaskList initial={myTasks} buyerName={deal.buyer.name} mode="buyer" />
        </div>
      </Card>

      <Card tone="sun">
        <CardHeader tone="sun" title="Cronograma" />
        <Timeline events={events} />
      </Card>

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
            <a
              href={waLink(agent.phone, "Hola! Me gustaría hablar contigo sobre mi propiedad.")}
              target="_blank"
              rel="noopener noreferrer"
              className={`${btn} bg-accent text-navy hover:brightness-95`}
            >
              <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
            </a>
            <a href={`mailto:${agent.email}`} className={`${btn} bg-white text-navy ring-1 ring-navy/10 hover:bg-paper`}>
              <Mail className="h-4 w-4" aria-hidden /> Correo
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
