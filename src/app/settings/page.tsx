import { Bell, Mail, Phone } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Avatar, Card, IconTile } from "@/components/ui";
import { agent } from "@/lib/data";

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
    <div className="mx-auto max-w-3xl">
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
    </div>
  );
}
