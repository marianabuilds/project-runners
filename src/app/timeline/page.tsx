import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardHeader, DateTile } from "@/components/ui";
import { dealById, timeline, TODAY } from "@/lib/data";
import { dayNum, daysFromToday, fmtDate, monthAbbr, monthName, relativeDue, shortAddress } from "@/lib/format";

export default function TimelinePage() {
  const upcoming = timeline.filter((e) => e.date >= TODAY).sort((a, b) => a.date.localeCompare(b.date));
  const byMonth = upcoming.reduce<Record<string, typeof upcoming>>((acc, e) => {
    (acc[monthName(e.date)] ||= []).push(e);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Calendario" subtitle="Las próximas fechas importantes de tus ventas" />
      <div className="space-y-8">
        {Object.entries(byMonth).map(([month, events]) => (
          <Card key={month}>
            <CardHeader title={month} />
            <ul className="divide-y divide-miel-100">
              {events.map((e) => {
                const d = dealById(e.dealId)!;
                const soon = daysFromToday(e.date) <= 7;
                return (
                  <li key={e.id}>
                    <Link href={`/deals/${d.id}`} className="flex items-center gap-4 px-5 py-5 hover:bg-miel-50 sm:px-7">
                      <DateTile day={dayNum(e.date)} month={monthAbbr(e.date)} />
                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-semibold text-cafe-900">{e.name}</p>
                        <p className="mt-1 text-base text-cafe-700">
                          {fmtDate(e.date)} · {shortAddress(d)}
                        </p>
                      </div>
                      <span className={soon ? "shrink-0 text-base font-semibold text-cafe-900" : "hidden shrink-0 text-base text-cafe-700 sm:block"}>
                        {relativeDue(e.date)}
                      </span>
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
