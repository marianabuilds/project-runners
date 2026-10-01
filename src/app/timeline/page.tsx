import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, DateTile, StageBadge } from "@/components/ui";
import { dealById, timeline, TODAY } from "@/lib/data";
import { dayNum, fmtDate, monthAbbr, relativeDue, shortAddress } from "@/lib/format";

export default function TimelinePage() {
  const upcoming = timeline.filter((e) => e.date >= TODAY).sort((a, b) => a.date.localeCompare(b.date));
  const byMonth = upcoming.reduce<Record<string, typeof upcoming>>((acc, e) => {
    const key = new Date(e.date + "T12:00:00").toLocaleDateString("es-PE", { month: "long", year: "numeric" });
    (acc[key] ||= []).push(e);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Cronograma" subtitle="Próximos hitos en todos los negocios" />
      <div className="space-y-5">
        {Object.entries(byMonth).map(([month, events], n) => (
          <Card key={month} tone={n % 2 ? "white" : "sun"}>
            <h2 className="border-b border-navy/10 px-5 py-4 text-lg font-semibold capitalize text-navy sm:px-6">{month}</h2>
            <ul className="divide-y divide-navy/10">
              {events.map((e) => {
                const d = dealById(e.dealId)!;
                return (
                  <li key={e.id}>
                    <Link href={`/deals/${d.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-white/60 sm:px-6">
                      <DateTile day={dayNum(e.date)} month={monthAbbr(e.date)} />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-navy">{e.name}</p>
                        <p className="truncate text-sm text-navy-200">{fmtDate(e.date)} · {shortAddress(d)}</p>
                      </div>
                      <div className="hidden text-right sm:block">
                        <StageBadge stage={d.stage} />
                        <p className="mt-1 text-xs text-navy-200">{relativeDue(e.date)}</p>
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
