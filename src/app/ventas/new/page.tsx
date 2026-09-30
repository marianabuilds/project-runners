import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewVentaForm } from "@/components/forms";
import { PageHeader } from "@/components/page-header";

export default function NewVentaPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/ventas" className="mb-4 inline-flex min-h-[48px] items-center gap-2 rounded-2xl px-3 text-lg font-semibold text-cafe-600 hover:bg-miel-100">
        <ArrowLeft className="h-5 w-5" aria-hidden /> Mis ventas
      </Link>
      <PageHeader title="Nueva venta" subtitle="Llena estos datos. Puedes cambiarlos después." />
      <NewVentaForm />
    </div>
  );
}
