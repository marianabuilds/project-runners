import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, DateTile, StageBadge } from "@/components/ui";
import { dealById, timeline, TODAY } from "@/lib/data";
import { dayNum, fmtDate, monthAbbr, relativeDue, shortAddress } from "@/lib/format";

export default function TimelinePage() {
  const upcoming = timeline.filter((e) => e.date >= TODAY).sort((a, b) => a.date.localeCompare(b.date));
  const byMonth = upcoming.reduce<Record<string, typeof upcoming>>((acc, e) => {
    const key = new Date(e.date + "T12:00:00").toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    (acc[key] ||= []).push(e);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Timeline" subtitle="Upcoming milestones across all deals" />
      <div className="space-y-6">
        {Object.entries(byMonth).map(([month, events]) => (
          <Card key={month}>
            <h2 className="border-b border-slate-100 px-5 py-4 text-lg font-semibold sm:px-6">{month}</h2>
            <ul className="divide-y divide-slate-100">
              {events.map((e) => {
                const d = dealById(e.dealId)!;
                return (
                  <li key={e.id}>
                    <Link href={`/deals/${d.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 sm:px-6">
                      <DateTile day={dayNum(e.date)} month={monthAbbr(e.date)} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900">{e.name}</p>
                        <p className="truncate text-sm text-slate-500">{fmtDate(e.date)} · {shortAddress(d)}</p>
                      </div>
                      <div className="hidden text-right sm:block">
                        <StageBadge stage={d.stage} />
                        <p className="mt-1 text-xs text-slate-500">{relativeDue(e.date)}</p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
}
