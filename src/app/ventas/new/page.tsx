import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewVentaForm } from "@/components/forms";
import { PageHeader } from "@/components/page-header";

export default function NewVentaPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/ventas" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Mis Ventas
      </Link>
      <PageHeader title="Nueva venta" subtitle="Empieza en la etapa Prospecto. Puedes agregar varios compradores." />
      <NewVentaForm />
    </div>
  );
}
