"use client";

import Link from "next/link";
import { ChevronRight, Settings2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { PaymentsCard } from "@/components/payments-card";
import { Avatar, Card } from "@/components/ui";
import { WhatsAppCard } from "@/components/whatsapp-card";
import { agent } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function SettingsPage() {
  const { me, role } = useStore();
  return (
    <div className="mx-auto max-w-7xl pb-10">
      <PageHeader title="Configuración" />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
      <Card tone="navy" className="p-5 sm:p-6 lg:col-span-5">
        <div className="flex items-center gap-4">
          <Avatar initials={me.initials} size="lg" src={me.photo} />
          <div>
            <p className="text-lg font-semibold text-white">{me.name}</p>
            <p className="text-sm text-white/60">{me.label}{role === "agent" ? ` · ${agent.agency}` : ""}</p>
          </div>
        </div>
        <dl className="mt-6 divide-y divide-white/10 text-sm">
          {[
            ...(role === "agent" ? [["Correo", agent.email], ["Teléfono", agent.phone]] : []),
            ["Notificaciones por correo", "Tarea creada · Próxima a vencer · Vencida"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3">
              <dt className="text-white/60">{k}</dt>
              <dd className="text-right text-white">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <div className="space-y-5 lg:col-span-7">
        <WhatsAppCard />
        {role !== "buyer" && (
          <Link href="/manage" className="flex items-center gap-3 rounded-3xl bg-surface p-5 ring-1 ring-navy-100/70 hover:bg-sky/50">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky text-ink" aria-hidden><Settings2 className="h-5 w-5" /></span>
            <span className="flex-1">
              <span className="block font-semibold text-ink">Gestionar negocio</span>
              <span className="block text-sm text-ink-muted">Información, fotos y qué puede ver la compradora</span>
            </span>
            <ChevronRight className="h-5 w-5 text-ink-muted" aria-hidden />
          </Link>
        )}
        <PaymentsCard />
      </div>
      </div>
    </div>
  );
}
