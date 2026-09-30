import Link from "next/link";
import clsx from "clsx";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { AvatarStack, Card, KindBadge, StageBadge } from "@/components/ui";
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
  const deals = tipo === "todas" ? all : all.filter((d) => d.kind === tipo);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title="Mis Ventas" subtitle={`${all.filter((d) => d.kind === "venta").length} ventas · ${all.filter((d) => d.kind === "alquiler").length} alquileres activos`}>
        <Link href="/ventas/new" className="mr-2 flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" aria-hidden /> Nueva venta
        </Link>
      </PageHeader>

      <nav className="mb-5 inline-flex gap-1 rounded-xl bg-slate-100 p-1" aria-label="Filtrar por tipo">
        {tabs.map((t) => (
          <Link key={t.key} href={t.key === "todas" ? "/ventas" : `/ventas?tipo=${t.key}`} aria-current={tipo === t.key ? "page" : undefined} className={clsx("rounded-lg px-4 py-1.5 text-sm", tipo === t.key ? "bg-white font-medium text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900")}>
            {t.label}
          </Link>
        ))}
      </nav>

      {/* Móvil: tarjetas */}
      <div className="space-y-3 md:hidden">
        {deals.map((d) => {
          const open = tasksFor(d.id).filter((t) => t.status !== "completed").length;
          return (
            <Link key={d.id} href={`/ventas/${d.id}`} className="block">
              <Card className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-medium text-slate-900"><span className="truncate">{shortAddress(d)}</span> <KindBadge kind={d.kind} /></p>
                    <p className="text-sm text-slate-500">{d.address.district} · {buyerSummary(d)}</p>
                  </div>
                  <StageBadge stage={d.stage} />
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-semibold tabular-nums">{priceLabel(d)}</span>
                  <span className="text-slate-500">{open} {open === 1 ? "abierta" : "abiertas"} · cierra {fmtShort(d.targetCloseDate)}</span>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Escritorio: tabla */}
      <Card className="hidden overflow-hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-6 py-3 font-medium">Propiedad</th>
              <th scope="col" className="px-4 py-3 font-medium">Tipo</th>
              <th scope="col" className="px-4 py-3 font-medium">Compradores</th>
              <th scope="col" className="px-4 py-3 font-medium">Etapa</th>
              <th scope="col" className="px-4 py-3 text-right font-medium">Precio</th>
              <th scope="col" className="px-4 py-3 font-medium">Cierre</th>
              <th scope="col" className="px-6 py-3 text-right font-medium">Tareas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {deals.map((d) => {
              const open = tasksFor(d.id).filter((t) => t.status !== "completed");
              const overdue = open.filter((t) => daysFromToday(t.dueDate) < 0).length;
              return (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <Link href={`/ventas/${d.id}`} className="font-medium text-slate-900 hover:text-blue-700">{shortAddress(d)}</Link>
                    <p className="text-slate-500">{d.address.district}, {d.address.province}</p>
                  </td>
                  <td className="px-4 py-4"><KindBadge kind={d.kind} /></td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2"><AvatarStack buyers={d.buyers} size="sm" /><span className="truncate">{buyerSummary(d)}</span></div>
                  </td>
                  <td className="px-4 py-4"><StageBadge stage={d.stage} /></td>
                  <td className="px-4 py-4 text-right font-medium tabular-nums">{priceLabel(d)}</td>
                  <td className="px-4 py-4 text-slate-600">{fmtShort(d.targetCloseDate)}</td>
                  <td className="px-6 py-4 text-right tabular-nums">
                    {open.length}
                    {overdue > 0 && <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">{overdue} con retraso</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {deals.length === 0 && <p className="px-6 py-10 text-center text-sm text-slate-500">No hay operaciones de este tipo.</p>}
      </Card>
    </div>
  );
}
