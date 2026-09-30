import Link from "next/link";
import { AlertCircle } from "lucide-react";
import type { Deal } from "@/lib/data";
import { buyerSummary, fmtShort, priceLabel, shortAddress } from "@/lib/format";
import { AvatarStack, KindBadge, PropertyImage, StageBadge } from "./ui";

export function VentaCard({ deal, overdue = 0 }: { deal: Deal; overdue?: number }) {
  return (
    <Link
      href={`/ventas/${deal.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-miel-200 transition-shadow hover:shadow-lg hover:ring-cafe-300"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-miel-100">
        <PropertyImage id={deal.id} imageUrl={deal.imageUrl} alt={`Foto de ${shortAddress(deal)}`} className="transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute left-3 top-3">
          <KindBadge kind={deal.kind} />
        </div>
        <div className="absolute right-3 top-3">
          <StageBadge stage={deal.stage} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="min-w-0">
          <p className="truncate font-heading text-xl text-cafe-900">{shortAddress(deal)}</p>
          <p className="truncate text-base text-cafe-700">{deal.address.district}</p>
        </div>
        <div className="flex items-center gap-3">
          <AvatarStack buyers={deal.buyers} />
          <span className="min-w-0 truncate text-base text-cafe-800">{buyerSummary(deal)}</span>
        </div>
        <div className="mt-auto flex flex-wrap items-baseline justify-between gap-x-3 border-t border-miel-100 pt-3">
          <span className="text-lg font-semibold tabular-nums text-cafe-900">{priceLabel(deal)}</span>
          <span className="text-base text-cafe-700">{deal.kind === "venta" ? "Cierre" : "Inicio"}: {fmtShort(deal.targetCloseDate)}</span>
        </div>
        {overdue > 0 && (
          <p className="flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-base font-semibold text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" aria-hidden />
            {overdue === 1 ? "1 tarea atrasada" : `${overdue} tareas atrasadas`}
          </p>
        )}
      </div>
    </Link>
  );
}
