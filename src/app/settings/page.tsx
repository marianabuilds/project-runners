import { PageHeader } from "@/components/page-header";
import { Avatar, Card } from "@/components/ui";
import { agent } from "@/lib/data";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Ajustes" />
      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <Avatar initials={agent.initials} size="lg" />
          <div>
            <p className="font-semibold text-slate-900">{agent.name}</p>
            <p className="text-sm text-slate-500">{agent.agency}</p>
          </div>
        </div>
        <dl className="mt-6 divide-y divide-slate-100 text-sm">
          {[
            ["Correo", agent.email],
            ["Teléfono / WhatsApp", agent.phone],
            ["Notificaciones", "Tarea creada · Por vencer · Con retraso"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3">
              <dt className="text-slate-600">{k}</dt>
              <dd className="text-right text-slate-900">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}
