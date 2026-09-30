import Link from "next/link";
import { AlertCircle, ChevronRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button, Card, StageBadge } from "@/components/ui";
import { deals, tasksFor } from "@/lib/data";
import { daysFromToday, fmtShort, pen, shortAddress } from "@/lib/format";

export default function DealsPage() {
  const sorted = [...deals].sort((a, b) => a.targetCloseDate.localeCompare(b.targetCloseDate));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Mis ventas" subtitle={`Tienes ${deals.length} ventas en curso.`}>
        <Button href="/deals/new">
          <Plus className="h-6 w-6" aria-hidden /> Nueva venta
        </Button>
      </PageHeader>

      <ul className="space-y-5">
        {sorted.map((d) => {
          const overdue = tasksFor(d.id).filter((t) => t.status !== "completed" && daysFromToday(t.dueDate) < 0).length;
          return (
            <li key={d.id}>
              <Card className="overflow-hidden">
                <Link href={`/deals/${d.id}`} className="block px-5 py-5 hover:bg-miel-50 sm:px-7 sm:py-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-heading text-2xl text-cafe-900">{shortAddress(d)}</p>
                      <p className="mt-1 text-lg text-cafe-700">{d.address.district}</p>
                    </div>
                    <ChevronRight className="mt-1 h-7 w-7 shrink-0 text-cafe-500" aria-hidden />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <StageBadge stage={d.stage} />
                    <span className="text-lg text-cafe-800">
                      Comprador/a: <strong className="font-semibold">{d.buyer.name}</strong>
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-miel-100 pt-4">
                    <span className="text-xl font-semibold tabular-nums text-cafe-900">{pen(d.pricePen, 0)}</span>
                    <span className="text-lg text-cafe-700">Cierre: {fmtShort(d.targetCloseDate)}</span>
                  </div>

                  {overdue > 0 && (
                    <p className="mt-4 flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-base font-semibold text-red-700">
                      <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
                      {overdue === 1 ? "Tienes 1 tarea atrasada" : `Tienes ${overdue} tareas atrasadas`}
                    </p>
                  )}
                </Link>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
