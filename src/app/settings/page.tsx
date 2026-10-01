import { PageHeader } from "@/components/page-header";
import { Avatar, Card } from "@/components/ui";
import { WhatsAppCard } from "@/components/whatsapp-card";
import { agent } from "@/lib/data";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Configuración" />
      <Card tone="navy" className="p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <Avatar initials={agent.initials} size="lg" src={agent.photo} />
          <div>
            <p className="text-lg font-semibold text-white">{agent.name}</p>
            <p className="text-sm text-white/60">{agent.agency}</p>
          </div>
        </div>
        <dl className="mt-6 divide-y divide-white/10 text-sm">
          {[
            ["Correo", agent.email],
            ["Teléfono", agent.phone],
            ["Notificaciones por correo", "Tarea creada · Próxima a vencer · Vencida"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3">
              <dt className="text-white/60">{k}</dt>
              <dd className="text-right text-white">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <WhatsAppCard />
    </div>
  );
}
