"use client";

import { useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { useStore, fmtDateTime } from "@/lib/store";
import { Card, CardHeader } from "./ui";

export function WhatsAppCard({ className }: { className?: string }) {
  const { lastSync, syncWhatsApp, role } = useStore();
  const [loading, setLoading] = useState(false);

  const sync = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200)); // demo: simulated sync
    syncWhatsApp();
    setLoading(false);
  };

  return (
    <Card className={className}>
      <CardHeader title="Sincronización WhatsApp" />
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-sky-100">
            <MessageCircle className="h-5 w-5 text-navy" aria-hidden />
          </div>
          <div>
            <p className="text-sm font-medium text-navy">Última actualización: {fmtDateTime(lastSync)}</p>
            <p className="text-xs text-navy-200">Fechas y tareas se leen de los chats y se comparten con todos</p>
          </div>
        </div>
        {role === "agent" && (
          <button
            onClick={sync}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-navy px-3 py-2 text-sm font-medium text-white hover:bg-navy-600 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <MessageCircle className="h-4 w-4" aria-hidden />}
            {loading ? "Sincronizando..." : "Sincronizar ahora"}
          </button>
        )}
      </div>
    </Card>
  );
}
