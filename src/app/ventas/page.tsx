import Link from "next/link";
import clsx from "clsx";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { VentaCard } from "@/components/venta-card";
import { Button } from "@/components/ui";
import type { DealKind } from "@/lib/data";
import { daysFromToday } from "@/lib/format";
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
    <div className="container-page">
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

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((d) => {
          const overdue = tasksFor(d.id).filter((t) => t.status !== "completed" && daysFromToday(t.dueDate) < 0).length;
          return (
            <li key={d.id}>
              <VentaCard deal={d} overdue={overdue} />
            </li>
          );
        })}
        {sorted.length === 0 && <li className="rounded-3xl bg-white px-6 py-10 text-center text-lg text-cafe-700 ring-1 ring-miel-200 sm:col-span-2 lg:col-span-3">No hay operaciones de este tipo.</li>}
      </ul>
    </div>
  );
}
