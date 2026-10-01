"use client";

import { useState } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import { Card, CardHeader } from "./ui";

export function WhatsAppCard() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  const handleSync = async () => {
    setIsLoading(true);
    // Simulate sync
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setLastSynced(new Date());
    setIsLoading(false);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card>
      <CardHeader title="Sincronización WhatsApp" />
      <div className="px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-sky-100">
              <MessageCircle className="h-5 w-5 text-navy" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-medium text-navy">
                {lastSynced ? "Última sincronización: " + formatTime(lastSynced) : "No sincronizado"}
              </p>
              <p className="text-xs text-navy-100">Mantén los chats alineados automáticamente</p>
            </div>
          </div>
          <button
            onClick={handleSync}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg bg-navy px-3 py-2 text-sm font-medium text-white hover:bg-navy-200 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Sincronizando...
              </>
            ) : (
              <>
                <MessageCircle className="h-4 w-4" aria-hidden />
                Sincronizar ahora
              </>
            )}
          </button>
        </div>
      </div>
    </Card>
  );
}
