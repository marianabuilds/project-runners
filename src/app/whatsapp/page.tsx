import { Link2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui";
import { WhatsAppSim } from "@/components/whatsapp-sim";
import { getMessages } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function WhatsAppPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="WhatsApp" subtitle="Lo que escribas aquí actualiza tus ventas, y viceversa. (Simulador)" />
      <div className="space-y-8">
        <WhatsAppSim initial={getMessages("whatsapp")} />
        <Card className="p-5 sm:p-6">
          <h2 className="flex items-center gap-2 text-2xl text-cafe-900"><Link2 className="h-5 w-5" aria-hidden /> Cómo se vincula</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-lg text-cafe-800">
            <li>Cada mensaje pasa por el mismo asistente del dashboard (<code>/api/whatsapp</code>).</li>
            <li>Los cambios aparecen en Tareas, Calendario, Mis Ventas y en la actividad con el ícono de WhatsApp.</li>
            <li>Los cambios hechos en el dashboard se reflejan aquí como avisos del sistema.</li>
            <li>Para conectar tu número real, apunta el webhook de WhatsApp Cloud API a esta ruta (requiere credenciales de Meta).</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
