import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui";

const input =
  "mt-1.5 block w-full rounded-xl border border-navy-100 bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-navy focus:outline-none focus:ring-2 focus:ring-sky";

function Field({ label, id, hint, className, ...props }: { label: string; id: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium text-ink">{label}</label>
      <input id={id} name={id} className={input} {...props} />
      {hint && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <Card className={"p-5 sm:p-6 " + (className ?? "")}>
      <h2 className="mb-4 text-lg font-semibold text-ink">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </Card>
  );
}

export default function NewDealPage() {
  return (
    <div className="mx-auto max-w-7xl pb-10">
      <Link href="/deals" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft className="h-4 w-4" aria-hidden /> Todos los negocios
      </Link>
      <PageHeader title="Nuevo negocio" subtitle="Comienza en la etapa Prospecto. Puedes invitar al comprador ahora o después." />
      <form className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Section title="Propiedad" className="lg:col-span-6">
          <Field label="Calle" id="street" placeholder="Av. José Larco" className="sm:col-span-2" />
          <Field label="Número" id="number" placeholder="1150" />
          <Field label="Distrito" id="district" placeholder="Miraflores" />
          <Field label="Provincia" id="province" placeholder="Lima" />
          <Field label="Departamento" id="department" placeholder="Lima" />
        </Section>
        <Section title="Precio y fechas" className="lg:col-span-6">
          <Field label="Precio oferta (S/)" id="price" inputMode="decimal" placeholder="685,000.00" />
          <Field label="Precio de lista (S/)" id="listing" inputMode="decimal" placeholder="720,000.00" hint="Opcional" />
          <Field label="Fecha de cierre objetivo" id="close" type="date" hint="Típico: 45–60 días después de la oferta" />
          <Field label="Nombre del vendedor" id="seller" placeholder="Jorge Salazar" />
        </Section>
        <Section title="Comprador" className="lg:col-span-6">
          <Field label="Nombre del comprador" id="buyer" placeholder="Camila Bacan" />
          <Field label="Correo del comprador" id="buyerEmail" type="email" placeholder="camila@example.com" hint="Le enviaremos un enlace de invitación" />
        </Section>
        <div className="flex items-end justify-end gap-3 lg:col-span-6">
          <Link href="/deals" className="rounded-xl px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface">Cancelar</Link>
          <button type="button" className="rounded-xl bg-navy px-5 py-2.5 text-sm font-medium text-white hover:bg-navy-200">
            Crear negocio
          </button>
        </div>
      </form>
    </div>
  );
}
