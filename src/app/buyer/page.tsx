import { Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TaskList } from "@/components/task-list";
import { Timeline } from "@/components/timeline";
import { Avatar, Card, CardHeader, StageBadge, StageTracker } from "@/components/ui";
import { agent, dealById, eventsFor, tasksFor } from "@/lib/data";
import { daysFromToday, fmtDate, pen, shortAddress } from "@/lib/format";

// Preview of what the buyer (Lucía) sees for deal d1.
export default function BuyerView() {
  const deal = dealById("d1")!;
  const myTasks = tasksFor(deal.id).filter((t) => t.assignee === "buyer");
  const events = eventsFor(deal.id);
  const nextThree = events.filter((e) => daysFromToday(e.date) >= 0).slice(0, 3);
  const open = myTasks.filter((t) => t.status !== "completed").length;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 rounded-xl bg-amber-50 px-4 py-2 text-sm text-amber-900 ring-1 ring-amber-200">
        Preview: this is what <strong>{deal.buyer.name}</strong> sees.
      </div>
      <PageHeader
        title={<>Hola, {deal.buyer.name.split(" ")[0]} <span aria-hidden>👋</span></>}
        subtitle={<>You have {open} {open === 1 ? "thing" : "things"} to do for your new home.</>}
      />

      <Card className="mb-6 overflow-hidden">
        <div className="bg-gradient-to-br from-blue-50 to-white px-5 py-5 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">Your home</p>
              <p className="text-xl font-semibold text-slate-900">{shortAddress(deal)}</p>
              <p className="text-sm text-slate-600">{deal.address.district}, {deal.address.province}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold tabular-nums text-slate-900">{pen(deal.pricePen)}</p>
              <StageBadge stage={deal.stage} />
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 px-3 py-6 sm:px-6">
          <StageTracker stage={deal.stage} />
        </div>
      </Card>

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {nextThree.map((e) => (
          <Card key={e.id} className="px-4 py-3">
            <p className="text-xs text-slate-500">{e.name}</p>
            <p className="mt-1 font-semibold text-slate-900">{fmtDate(e.date)}</p>
            <p className="text-xs text-slate-500">in {daysFromToday(e.date)} days</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Your tasks" count={myTasks.length} />
            <TaskList initial={myTasks} buyerName={deal.buyer.name} mode="buyer" />
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader title="Timeline" />
            <Timeline events={events} />
          </Card>
          <Card>
            <CardHeader title="Your agent" />
            <div className="flex items-center gap-3 px-5 pt-4 sm:px-6">
              <Avatar initials={agent.initials} size="lg" />
              <div>
                <p className="font-medium text-slate-900">{agent.name}</p>
                <p className="text-sm text-slate-500">{agent.agency}</p>
              </div>
            </div>
            <div className="space-y-2 px-5 py-4 text-sm sm:px-6">
              <a href={`mailto:${agent.email}`} className="flex items-center gap-2 text-slate-700 hover:text-blue-700">
                <Mail className="h-4 w-4 text-slate-400" aria-hidden /> {agent.email}
              </a>
              <a href={`tel:${agent.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-slate-700 hover:text-blue-700">
                <Phone className="h-4 w-4 text-slate-400" aria-hidden /> {agent.phone}
              </a>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
