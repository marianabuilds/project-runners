import Link from "next/link";
import clsx from "clsx";
import { AlertCircle, ClipboardCheck, FileText, Home, KeyRound, Search as SearchIcon, UserRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Avatar, Card, CardHeader, DateTile, Donut, IconTile, StageBadge, stageColor, type Tone } from "@/components/ui";
import { agent, deals, dealById, STAGES, tasks, timeline, TODAY } from "@/lib/data";
import { dayNum, daysFromToday, fmtDate, monthAbbr, pen, penShort, relativeDue, shortAddress } from "@/lib/format";

function taskVisual(assignee: string, overdue: boolean): { tone: Tone; Icon: typeof FileText } {
  if (overdue) return { tone: "red", Icon: AlertCircle };
  return assignee === "buyer" ? { tone: "violet", Icon: UserRound } : { tone: "blue", Icon: ClipboardCheck };
}

const eventIcon = { offer: FileText, inspection: SearchIcon, appraisal: Home, closing: KeyRound, custom: ClipboardCheck };

export default function Dashboard() {
  const openTasks = tasks.filter((t) => t.status !== "completed").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const overdueCount = openTasks.filter((t) => daysFromToday(t.dueDate) < 0).length;
  const upcoming = timeline.filter((e) => e.date >= TODAY).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);
  const pipelineTotal = deals.reduce((a, d) => a + d.pricePen, 0);
  const byStage = STAGES.map((s) => {
    const ds = deals.filter((d) => d.stage === s.key);
    return { ...s, count: ds.length, value: ds.reduce((a, d) => a + d.pricePen, 0) };
  });
  const closingSoon = deals.filter((d) => daysFromToday(d.targetCloseDate) <= 31).length;

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={<>Hola, {agent.name.split(" ")[0]} <span aria-hidden>👋</span></>}
        subtitle={<>Here&apos;s what&apos;s going on with your deals today.</>}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Things to do */}
          <Card>
            <CardHeader
              title="Things to do"
              count={openTasks.length}
              href="/tasks"
              subtitle={overdueCount ? `${overdueCount} overdue` : undefined}
            />
            <ul className="divide-y divide-slate-100">
              {openTasks.slice(0, 5).map((t) => {
                const deal = dealById(t.dealId)!;
                const overdue = daysFromToday(t.dueDate) < 0;
                const { tone, Icon } = taskVisual(t.assignee, overdue);
                return (
                  <li key={t.id}>
                    <Link href={`/deals/${deal.id}`} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 sm:px-6">
                      <IconTile tone={tone}>
                        <Icon className="h-5 w-5" />
                      </IconTile>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900">{t.title}</p>
                        <p className="mt-0.5 truncate text-sm text-slate-500">
                          {shortAddress(deal)} · {t.assignee === "buyer" ? deal.buyer.name : "You"}
                        </p>
                      </div>
                      <span className={clsx("shrink-0 text-sm", overdue ? "font-medium text-red-600" : "text-slate-500")}>
                        {relativeDue(t.dueDate)}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* Upcoming milestones */}
          <Card>
            <CardHeader title="Upcoming milestones" href="/timeline" />
            <ul className="divide-y divide-slate-100">
              {upcoming.map((e) => {
                const deal = dealById(e.dealId)!;
                const Icon = eventIcon[e.type];
                return (
                  <li key={e.id} className="flex items-center gap-4 px-5 py-4 sm:px-6">
                    <DateTile day={dayNum(e.date)} month={monthAbbr(e.date)} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-2 font-medium text-slate-900">
                        <Icon className="h-4 w-4 text-slate-400" aria-hidden /> {e.name}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-slate-500">
                        {fmtDate(e.date)} · {shortAddress(deal)}
                      </p>
                    </div>
                    <div className="hidden sm:block">
                      <StageBadge stage={deal.stage} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* Active deals */}
          <Card>
            <CardHeader title="Active deals" count={deals.length} href="/deals" />
            <ul className="divide-y divide-slate-100">
              {deals.map((d) => (
                <li key={d.id}>
                  <Link href={`/deals/${d.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 sm:px-6">
                    <Avatar initials={d.buyer.initials} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-900">{shortAddress(d)}</p>
                      <p className="truncate text-sm text-slate-500">
                        {d.address.district} · {d.buyer.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium tabular-nums text-slate-900">{pen(d.pricePen, 0)}</p>
                      <div className="mt-1">
                        <StageBadge stage={d.stage} />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <CardHeader title="Your pipeline" href="/deals" />
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-4 rounded-xl bg-emerald-50/70 p-4 ring-1 ring-emerald-100">
                <IconTile tone="green" className="bg-white">
                  <Home className="h-5 w-5" />
                </IconTile>
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {deals.length} <span className="font-normal">active deals</span>
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold">+{closingSoon}</span> closing in the next 30 days
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col items-center">
                <div className="relative">
                  <Donut segments={byStage.filter((s) => s.value).map((s) => ({ value: s.value, color: stageColor[s.key] }))} />
                  <div className="absolute inset-0 grid place-items-center text-center">
                    <div>
                      <p className="text-lg font-semibold tabular-nums">{penShort(pipelineTotal)}</p>
                      <p className="text-xs text-slate-500">total value</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Deals by stage" />
            <ul className="divide-y divide-slate-100">
              {byStage.map((s) => (
                <li key={s.key} className="flex items-center gap-3 px-5 py-3 sm:px-6">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: stageColor[s.key] }} aria-hidden />
                  <span className="flex-1 text-slate-800">{s.label}</span>
                  <span className="text-sm tabular-nums text-slate-500">{s.value ? penShort(s.value) : "—"}</span>
                  <span className="w-5 text-right text-sm font-medium tabular-nums text-slate-900">{s.count}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <CardHeader title="Waiting on buyers" />
            <ul className="divide-y divide-slate-100">
              {openTasks
                .filter((t) => t.assignee === "buyer")
                .map((t) => {
                  const d = dealById(t.dealId)!;
                  const overdue = daysFromToday(t.dueDate) < 0;
                  return (
                    <li key={t.id} className="flex items-center gap-3 px-5 py-3 sm:px-6">
                      <Avatar initials={d.buyer.initials} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{d.buyer.name}</p>
                        <p className="truncate text-xs text-slate-500">{t.title}</p>
                      </div>
                      <span className={clsx("shrink-0 text-xs", overdue ? "font-medium text-red-600" : "text-slate-500")}>
                        {relativeDue(t.dueDate)}
                      </span>
                    </li>
                  );
                })}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
