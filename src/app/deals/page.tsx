import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Avatar, Card, StageBadge } from "@/components/ui";
import { deals, tasksFor } from "@/lib/data";
import { daysFromToday, fmtShort, pen, shortAddress } from "@/lib/format";

export default function DealsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Deals" subtitle={`${deals.length} active deals`}>
        <Link
          href="/deals/new"
          className="mr-2 flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" aria-hidden /> New deal
        </Link>
      </PageHeader>

      {/* Mobile: cards */}
      <div className="space-y-3 md:hidden">
        {deals.map((d) => {
          const open = tasksFor(d.id).filter((t) => t.status !== "completed").length;
          return (
            <Link key={d.id} href={`/deals/${d.id}`}>
              <Card className="mb-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{shortAddress(d)}</p>
                    <p className="text-sm text-slate-500">{d.address.district} · {d.buyer.name}</p>
                  </div>
                  <StageBadge stage={d.stage} />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-semibold tabular-nums">{pen(d.pricePen, 0)}</span>
                  <span className="text-slate-500">
                    {open} open · closes {fmtShort(d.targetCloseDate)}
                  </span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Desktop: table */}
      <Card className="hidden overflow-hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-6 py-3 font-medium">Property</th>
              <th scope="col" className="px-4 py-3 font-medium">Buyer</th>
              <th scope="col" className="px-4 py-3 font-medium">Stage</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Price</th>
              <th scope="col" className="px-4 py-3 font-medium">Target close</th>
              <th scope="col" className="px-6 py-3 text-right font-medium">Open tasks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {deals.map((d) => {
              const ts = tasksFor(d.id);
              const open = ts.filter((t) => t.status !== "completed");
              const overdue = open.filter((t) => daysFromToday(t.dueDate) < 0).length;
              return (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <Link href={`/deals/${d.id}`} className="font-medium text-slate-900 hover:text-blue-700">
                      {shortAddress(d)}
                    </Link>
                    <p className="text-slate-500">{d.address.district}, {d.address.province}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Avatar initials={d.buyer.initials} size="sm" />
                      {d.buyer.name}
                    </div>
                  </td>
                  <td className="px-4 py-4"><StageBadge stage={d.stage} /></td>
                  <td className="px-4 py-4 text-right font-medium tabular-nums">{pen(d.pricePen, 0)}</td>
                  <td className="px-4 py-4 text-slate-600">{fmtShort(d.targetCloseDate)}</td>
                  <td className="px-6 py-4 text-right tabular-nums">
                    {open.length}
                    {overdue > 0 && <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">{overdue} overdue</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
