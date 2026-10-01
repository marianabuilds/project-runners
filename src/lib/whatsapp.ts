/**
 * WhatsApp sync demo — no real API integration
 */

export function waLink(phone: string, text?: string): string {
  const encodedText = text ? encodeURIComponent(text) : "";
  const cleanPhone = phone.replace(/\D/g, "");
  return text ? `https://wa.me/${cleanPhone}?text=${encodedText}` : `https://wa.me/${cleanPhone}`;
}

export type WhatsAppSync = {
  status: "idle" | "syncing" | "complete" | "error";
  lastSyncedAt?: string;
  messageCount: number;
};

export async function syncNow(): Promise<WhatsAppSync> {
  // Demo implementation: simulate sync delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return {
    status: "complete",
    lastSyncedAt: new Date().toISOString(),
    messageCount: 3,
  };
}
