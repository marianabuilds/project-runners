import { Bell, Link2, Mail, MessageCircle, Phone } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Avatar, Card, CardHeader, IconTile } from "@/components/ui";
import { WhatsAppSim } from "@/components/whatsapp-sim";
import { agent } from "@/lib/data";
import { getMessages } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const rows = [
    { icon: Mail, label: "Correo", value: agent.email },
    { icon: Phone, label: "Teléfono", value: agent.phone },
    {
      icon: Bell,
      label: "Avisos por correo",
      value: "Cuando hay una tarea nueva, cuando algo vence pronto y cuando algo se atrasa",
    },
  ];

  return (
    <div className="container-page">
      <PageHeader title="Mi cuenta" />
      <Card>
        <div className="flex items-center gap-4 border-b border-miel-100 px-5 py-6 sm:px-7">
          <Avatar initials={agent.initials} size="lg" />
          <div className="min-w-0">
            <p className="font-heading text-2xl text-cafe-900">{agent.name}</p>
            <p className="text-lg text-cafe-700">{agent.agency}</p>
          </div>
        </div>
        <dl className="divide-y divide-miel-100">
          {rows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4 px-5 py-5 sm:px-7">
              <IconTile>
                <Icon className="h-6 w-6" />
              </IconTile>
              <div className="min-w-0 flex-1">
                <dt className="text-base text-cafe-700">{label}</dt>
                <dd className="mt-1 break-words text-lg font-semibold text-cafe-900">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </Card>

      <Card className="mt-8">
        <CardHeader title="WhatsApp" subtitle="Lo que escribas aquí actualiza tus ventas, y viceversa (simulador)" />
        <div className="px-3 py-6 sm:px-7">
          <WhatsAppSim initial={getMessages("whatsapp")} />
        </div>
        <div className="border-t border-miel-100 px-5 py-6 sm:px-7">
          <h3 className="flex items-center gap-2 text-xl text-cafe-900"><Link2 className="h-5 w-5" aria-hidden /> Cómo se vincula</h3>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-lg text-cafe-800">
            <li>Cada mensaje pasa por el mismo asistente de Inicio.</li>
            <li>Los cambios aparecen en Pendientes, Calendario y Mis ventas, con el ícono <MessageCircle className="inline h-5 w-5 align-text-bottom text-green-700" aria-label="WhatsApp" />.</li>
            <li>Los cambios hechos en la app se reflejan aquí como avisos.</li>
            <li>Para conectar tu número real hace falta una cuenta de WhatsApp Business (Meta) y un webhook público hacia <code>/api/whatsapp</code>.</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
