import Link from "next/link";
import clsx from "clsx";
import { AlertCircle, ClipboardCheck, FileText, Home, KeyRound, MessageCircle, Search as SearchIcon, UserRound } from "lucide-react";
import { AgentChat } from "@/components/agent-chat";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarStack, Card, CardHeader, DateTile, Donut, IconTile, KindBadge, StageBadge, stageColor, type Tone } from "@/components/ui";
import { agent, STAGES, TODAY } from "@/lib/data";
import { dayNum, daysFromToday, fmtDate, monthAbbr, penShort, priceLabel, relativeDue, shortAddress, buyerSummary } from "@/lib/format";
import { dealById, getDeals, getEvents, getMessages, getRecentActivity, getTasks } from "@/lib/store";

export const dynamic = "force-dynamic";

function taskVisual(assignee: string, overdue: boolean): { tone: Tone; Icon: typeof FileText } {
  if (overdue) return { tone: "red", Icon: AlertCircle };
  return assignee === "buyer" ? { tone: "violet", Icon: UserRound } : { tone: "blue", Icon: ClipboardCheck };
}

const eventIcon = { offer: FileText, inspection: SearchIcon, appraisal: Home, closing: KeyRound, custom: ClipboardCheck };

export default function Dashboard() {
  const deals = getDeals();
  const tasks = getTasks();
  const openTasks = tasks.filter((t) => t.status !== "completed").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const overdueCount = openTasks.filter((t) => daysFromToday(t.dueDate) < 0).length;
  const upcoming = getEvents().filter((e) => e.date >= TODAY).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const sales = deals.filter((d) => d.kind === "venta");
  const rentals = deals.length - sales.length;
  const pipelineTotal = sales.reduce((a, d) => a + d.pricePen, 0);
  const byStage = STAGES.map((s) => {
    const ds = deals.filter((d) => d.stage === s.key);
    const vs = ds.filter((d) => d.kind === "venta");
    return { ...s, count: ds.length, value: vs.reduce((a, d) => a + d.pricePen, 0) };
  });
  const closingSoon = deals.filter((d) => daysFromToday(d.targetCloseDate) <= 31).length;
  const activity = getRecentActivity(5);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={<>Hola, {agent.name.split(" ")[0]} <span aria-hidden>👋</span></>}
        subtitle="Esto es lo que pasa hoy con tus ventas y alquileres."
      />

      <div className="space-y-6">
        {/* 1. Asistente */}
        <AgentChat initial={getMessages("chat")} />

        {/* 2. Por hacer */}
        <Card>
          <CardHeader title="Por hacer" count={openTasks.length} href="/tasks" subtitle={overdueCount ? `${overdueCount} con retraso` : undefined} />
          <ul className="divide-y divide-slate-100">
            {openTasks.slice(0, 5).map((t) => {
              const deal = dealById(t.dealId)!;
              const overdue = daysFromToday(t.dueDate) < 0;
              const { tone, Icon } = taskVisual(t.assignee, overdue);
              return (
                <li key={t.id}>
                  <Link href={`/ventas/${deal.id}`} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 sm:px-6">
                    <IconTile tone={tone}><Icon className="h-5 w-5" /></IconTile>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900">{t.title}</p>
                      <p className="mt-0.5 truncate text-sm text-slate-500">
                        {shortAddress(deal)} · {t.assignee === "buyer" ? deal.buyers[0]?.name : "Tú"}
                      </p>
                    </div>
                    <span className={clsx("shrink-0 text-sm", overdue ? "font-medium text-red-600" : "text-slate-500")}>{relativeDue(t.dueDate)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* 3. Próximos hitos */}
        <Card>
          <CardHeader title="Próximos eventos" href="/calendario" />
          <ul className="divide-y divide-slate-100">
            {upcoming.map((e) => {
              const deal = dealById(e.dealId)!;
              const Icon = eventIcon[e.type];
              return (
                <li key={e.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                  <DateTile day={dayNum(e.date)} month={monthAbbr(e.date)} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 font-medium text-slate-900"><Icon className="h-4 w-4 text-slate-400" aria-hidden /> {e.name}</p>
                    <p className="mt-0.5 truncate text-sm text-slate-500">{fmtDate(e.date)} · {shortAddress(deal)}</p>
                  </div>
                  <KindBadge kind={deal.kind} />
                </li>
              );
            })}
          </ul>
        </Card>

        {/* 4. Pipeline */}
        <Card>
          <CardHeader title="Tu pipeline" href="/ventas" />
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-4 rounded-xl bg-emerald-50/70 p-4 ring-1 ring-emerald-100">
              <IconTile tone="green" className="bg-white"><Home className="h-5 w-5" /></IconTile>
              <div>
                <p className="text-lg font-semibold text-slate-900">{sales.length} <span className="font-normal">ventas</span> · {rentals} <span className="font-normal">{rentals === 1 ? "alquiler" : "alquileres"}</span></p>
                <p className="text-sm text-slate-600"><span className="font-semibold">+{closingSoon}</span> cierran en los próximos 30 días</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
              <div className="relative shrink-0">
                <Donut segments={byStage.filter((s) => s.value).map((s) => ({ value: s.value, color: stageColor[s.key] }))} />
                <div className="absolute inset-0 grid place-items-center text-center">
                  <div>
                    <p className="text-lg font-semibold tabular-nums">{penShort(pipelineTotal)}</p>
                    <p className="text-xs text-slate-500">valor en ventas</p>
                  </div>
                </div>
              </div>
              <ul className="w-full divide-y divide-slate-100">
                {byStage.map((s) => (
                  <li key={s.key} className="flex items-center gap-3 py-2.5">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: stageColor[s.key] }} aria-hidden />
                    <span className="flex-1 text-slate-800">{s.label}</span>
                    <span className="text-sm tabular-nums text-slate-500">{s.value ? penShort(s.value) : "—"}</span>
                    <span className="w-5 text-right text-sm font-medium tabular-nums text-slate-900">{s.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* 5. Mis ventas */}
        <Card>
          <CardHeader title="Mis ventas activas" count={deals.length} href="/ventas" />
          <ul className="divide-y divide-slate-100">
            {deals.map((d) => (
              <li key={d.id}>
                <Link href={`/ventas/${d.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 sm:px-6">
                  <AvatarStack buyers={d.buyers} />
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate font-medium text-slate-900">{shortAddress(d)} <KindBadge kind={d.kind} /></p>
                    <p className="truncate text-sm text-slate-500">{d.address.district} · {buyerSummary(d)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium tabular-nums text-slate-900">{priceLabel(d)}</p>
                    <div className="mt-1"><StageBadge stage={d.stage} /></div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        {/* 6. Esperando compradores */}
        <Card>
          <CardHeader title="Esperando a compradores" />
          <ul className="divide-y divide-slate-100">
            {openTasks.filter((t) => t.assignee === "buyer").map((t) => {
              const d = dealById(t.dealId)!;
              const overdue = daysFromToday(t.dueDate) < 0;
              return (
                <li key={t.id} className="flex items-center gap-3 px-5 py-3 sm:px-6">
                  <Avatar initials={d.buyers[0]?.initials ?? "?"} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{d.buyers[0]?.name}</p>
                    <p className="truncate text-xs text-slate-500">{t.title}</p>
                  </div>
                  <span className={clsx("shrink-0 text-xs", overdue ? "font-medium text-red-600" : "text-slate-500")}>{relativeDue(t.dueDate)}</span>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* 7. Actividad reciente */}
        <Card>
          <CardHeader title="Actividad reciente" subtitle="Cambios desde el dashboard, el chat y WhatsApp" href="/whatsapp" />
          <ul className="divide-y divide-slate-100">
            {activity.map((a) => {
              const d = dealById(a.dealId);
              return (
                <li key={a.id} className="flex items-start gap-3 px-5 py-3 sm:px-6">
                  {a.source === "whatsapp" ? <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-label="WhatsApp" /> : <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-slate-300" aria-hidden />}
                  <p className="min-w-0 flex-1 text-sm text-slate-800">{a.what}{d && <span className="text-slate-500"> · {shortAddress(d)}</span>}</p>
                  <time className="shrink-0 text-xs text-slate-500">{new Date(a.when).toLocaleDateString("es-PE", { day: "numeric", month: "short" })}</time>
                </li>
              );
            })}
          </ul>
        </Card>
      </div>
    </div>
  );
}
