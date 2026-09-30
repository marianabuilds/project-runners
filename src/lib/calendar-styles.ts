import type { EventType } from "./data";

// Colores de chip por tipo de evento (usados en /calendario y en el mini-calendario de Inicio).
export const eventChip: Record<EventType, string> = {
  offer: "bg-violet-100 text-violet-800",
  inspection: "bg-amber-100 text-amber-800",
  appraisal: "bg-sky-100 text-sky-800",
  closing: "bg-emerald-100 text-emerald-800",
  custom: "bg-miel-100 text-cafe-800",
};
