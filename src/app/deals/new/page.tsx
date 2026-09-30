import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button, Card } from "@/components/ui";

const input =
  "mt-2 block min-h-[56px] w-full rounded-2xl bg-white px-4 text-lg text-cafe-900 ring-2 ring-miel-200 placeholder:text-cafe-300 focus:outline-none focus:ring-4 focus:ring-cafe-600";

function Field({ label, id, hint, ...props }: { label: string; id: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={id} className="text-lg font-semibold text-cafe-900">
        {label}
      </label>
      <input id={id} name={id} className={input} aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
      {hint && (
        <p id={`${id}-hint`} className="mt-2 text-base text-cafe-700">
          {hint}
        </p>
      )}
    </div>
  );
}

export default function NewDealPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/deals"
        className="mb-4 inline-flex min-h-[48px] items-center gap-2 rounded-2xl px-3 text-lg font-semibold text-cafe-600 hover:bg-miel-100"
      >
        <ArrowLeft className="h-5 w-5" aria-hidden /> Mis ventas
      </Link>
      <PageHeader title="Nueva venta" subtitle="Llena estos datos. Puedes cambiarlos después." />

      <form>
        <Card className="space-y-7 px-5 py-6 sm:px-7 sm:py-8">
          <Field label="Dirección" id="address" placeholder="Av. José Larco 1150" autoComplete="off" />
          <Field label="Distrito" id="district" placeholder="Miraflores" />
          <Field label="Precio (S/)" id="price" inputMode="decimal" placeholder="685,000" />
          <Field label="Fecha estimada de cierre" id="close" type="date" />
          <Field label="Nombre del comprador" id="buyer" placeholder="Lucía Fernández" />
          <Field
            label="Correo del comprador"
            id="buyerEmail"
            type="email"
            placeholder="lucia@correo.com"
            hint="Le enviaremos una invitación."
          />
        </Card>

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button href="/deals" variant="secondary">
            Cancelar
          </Button>
          <Button type="button">Crear venta</Button>
        </div>
      </form>
    </div>
  );
}
