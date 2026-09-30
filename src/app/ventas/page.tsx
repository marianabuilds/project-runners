import Link from "next/link";
import clsx from "clsx";
import { AlertCircle, ChevronRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AvatarStack, Button, Card, KindBadge, StageBadge } from "@/components/ui";
import type { DealKind } from "@/lib/data";
import { buyerSummary, daysFromToday, fmtShort, priceLabel, shortAddress } from "@/lib/format";
import { getDeals, tasksFor } from "@/lib/store";

export const dynamic = "force-dynamic";

const tabs = [
  { key: "todas", label: "Todas" },
  { key: "venta", label: "Ventas" },
  { key: "alquiler", label: "Alquileres" },
] as const;

export default function VentasPage({ searchParams }: { searchParams: { tipo?: string } }) {
  const tipo = (["venta", "alquiler"].includes(searchParams.tipo ?? "") ? searchParams.tipo : "todas") as DealKind | "todas";
  const all = getDeals();
  const sorted = (tipo === "todas" ? all : all.filter((d) => d.kind === tipo)).sort((a, b) => a.targetCloseDate.localeCompare(b.targetCloseDate));

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Mis ventas" subtitle={`Tienes ${all.length} operaciones en curso.`}>
        <Button href="/ventas/new"><Plus className="h-6 w-6" aria-hidden /> Nueva venta</Button>
      </PageHeader>

      <nav className="mb-6 flex gap-2" aria-label="Filtrar por tipo">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={t.key === "todas" ? "/ventas" : `/ventas?tipo=${t.key}`}
            aria-current={tipo === t.key ? "page" : undefined}
            className={clsx("inline-flex min-h-[48px] flex-1 items-center justify-center rounded-2xl px-4 text-lg font-semibold sm:flex-none", tipo === t.key ? "bg-cafe-600 text-white" : "bg-miel-100 text-cafe-800 hover:bg-miel-200")}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <ul className="space-y-5">
        {sorted.map((d) => {
          const overdue = tasksFor(d.id).filter((t) => t.status !== "completed" && daysFromToday(t.dueDate) < 0).length;
          return (
            <li key={d.id}>
              <Card className="overflow-hidden">
                <Link href={`/ventas/${d.id}`} className="block px-5 py-5 hover:bg-miel-50 sm:px-7 sm:py-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-heading text-2xl text-cafe-900">{shortAddress(d)}</p>
                      <p className="mt-1 text-lg text-cafe-700">{d.address.district}</p>
                    </div>
                    <ChevronRight className="mt-1 h-7 w-7 shrink-0 text-cafe-500" aria-hidden />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <KindBadge kind={d.kind} />
                    <StageBadge stage={d.stage} />
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <AvatarStack buyers={d.buyers} />
                    <span className="text-lg text-cafe-800">{d.kind === "venta" ? "Comprador/a" : "Inquilino/a"}: <strong className="font-semibold">{buyerSummary(d)}</strong></span>
                  </div>

                  <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-miel-100 pt-4">
                    <span className="text-xl font-semibold tabular-nums text-cafe-900">{priceLabel(d)}</span>
                    <span className="text-lg text-cafe-700">{d.kind === "venta" ? "Cierre" : "Inicio"}: {fmtShort(d.targetCloseDate)}</span>
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
        {sorted.length === 0 && <li className="rounded-3xl bg-white px-6 py-10 text-center text-lg text-cafe-700 ring-1 ring-miel-200">No hay operaciones de este tipo.</li>}
      </ul>
    </div>
  );
}
