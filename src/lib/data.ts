// Placeholder data only — no backend. Dates are relative to the demo "today".
export const TODAY = "2026-09-29";

export type Stage = "prospect" | "offer" | "under_contract" | "due_diligence" | "closing";
export type TaskStatus = "pending" | "in_progress" | "completed";
export type Assignee = "agent" | "buyer";
export type EventType = "offer" | "inspection" | "appraisal" | "closing" | "custom";
export type DealKind = "venta" | "alquiler";
export type Source = "dashboard" | "chat" | "whatsapp";
export type BuyerRole = "principal" | "co-comprador" | "interesado";

export const EVENT_TYPES: { key: EventType; label: string }[] = [
  { key: "offer", label: "Oferta" },
  { key: "inspection", label: "Inspección" },
  { key: "appraisal", label: "Tasación" },
  { key: "closing", label: "Cierre" },
  { key: "custom", label: "Otro" },
];

export const STAGES: { key: Stage; label: string }[] = [
  { key: "prospect", label: "Interesado" },
  { key: "offer", label: "Oferta" },
  { key: "under_contract", label: "Contrato" },
  { key: "due_diligence", label: "Revisión" },
  { key: "closing", label: "Cierre" },
];

export type Task = {
  id: string;
  dealId: string;
  title: string;
  description?: string;
  assignee: Assignee;
  status: TaskStatus;
  dueDate: string;
};

export type TimelineEvent = {
  id: string;
  dealId: string;
  name: string;
  date: string;
  type: EventType;
};

export type AuditEntry = {
  id: string;
  dealId: string;
  who: string;
  what: string;
  when: string;
  source?: Source;
};

export type Buyer = { id: string; name: string; email: string; phone: string; initials: string; role: BuyerRole };

export type Message = {
  id: string;
  channel: "chat" | "whatsapp";
  from: "agent" | "bot" | "system";
  text: string;
  at: string;
};

export type Deal = {
  id: string;
  address: { street: string; number: string; district: string; province: string; department: string };
  kind: DealKind;
  /** Foto real de la propiedad (opcional). Sin ella se muestra una ilustración generada. */
  imageUrl?: string;
  buyers: Buyer[];
  pricePen: number;
  listingPricePen?: number;
  stage: Stage;
  targetCloseDate: string;
  sellerName: string;
  notes: string;
};

export const agent = {
  name: "Maricarmen Fransi",
  initials: "MF",
  agency: "Fransi Inmobiliaria",
  email: "maricarmen@fransiinmobiliaria.pe",
  phone: "+51 987 654 321",
};

export const deals: Deal[] = [
  {
    id: "d1",
    address: { street: "Av. José Larco", number: "1150", district: "Miraflores", province: "Lima", department: "Lima" },
    kind: "venta",
    buyers: [{ id: "b1", name: "Lucía Fernández", email: "lucia.fernandez@example.com", phone: "+51 912 345 678", initials: "LF", role: "principal" }],
    pricePen: 685000,
    listingPricePen: 720000,
    stage: "due_diligence",
    targetCloseDate: "2026-11-06",
    sellerName: "Jorge Salazar",
    notes: "La compradora prefiere cerrar antes de fin de noviembre. El vendedor es flexible con los muebles.",
  },
  {
    id: "d2",
    address: { street: "Calle Los Pinos", number: "245", district: "San Isidro", province: "Lima", department: "Lima" },
    kind: "venta",
    buyers: [
      { id: "b2", name: "Carlos Mendoza", email: "carlos.mendoza@example.com", phone: "+51 923 456 789", initials: "CM", role: "principal" },
      { id: "b2b", name: "Elena Mendoza", email: "elena.mendoza@example.com", phone: "+51 923 456 790", initials: "EM", role: "co-comprador" },
    ],
    pricePen: 1250000,
    listingPricePen: 1320000,
    stage: "under_contract",
    targetCloseDate: "2026-11-20",
    sellerName: "María Torres",
    notes: "Crédito hipotecario con el BCP. Falta que el banco agende la tasación.",
  },
  {
    id: "d3",
    address: { street: "Jr. Bolognesi", number: "380", district: "Barranco", province: "Lima", department: "Lima" },
    kind: "alquiler",
    buyers: [
      { id: "b3", name: "Ana Rojas", email: "ana.rojas@example.com", phone: "+51 934 567 890", initials: "AR", role: "principal" },
      { id: "b3b", name: "Mateo Rojas", email: "mateo.rojas@example.com", phone: "+51 934 567 891", initials: "MR", role: "interesado" },
    ],
    pricePen: 3800,
    listingPricePen: 4000,
    stage: "offer",
    targetCloseDate: "2026-12-04",
    sellerName: "Pedro Huamán",
    notes: "Esperamos la contraoferta esta semana. Alquiler mensual, contrato a 2 años.",
  },
  {
    id: "d4",
    address: { street: "Av. Ejército", number: "712", district: "Yanahuara", province: "Arequipa", department: "Arequipa" },
    kind: "venta",
    buyers: [{ id: "b4", name: "Diego Vargas", email: "diego.vargas@example.com", phone: "+51 945 678 901", initials: "DV", role: "principal" }],
    pricePen: 390000,
    stage: "prospect",
    targetCloseDate: "2026-12-18",
    sellerName: "Rosario Paredes",
    notes: "Va a ver dos casas más antes de decidir.",
  },
  {
    id: "d5",
    address: { street: "Calle Alcanfores", number: "560", district: "Surco", province: "Lima", department: "Lima" },
    kind: "venta",
    buyers: [
      { id: "b5", name: "Valeria Chávez", email: "valeria.chavez@example.com", phone: "+51 956 789 012", initials: "VC", role: "principal" },
      { id: "b5b", name: "Andrés Chávez", email: "andres.chavez@example.com", phone: "+51 956 789 013", initials: "AC", role: "co-comprador" },
    ],
    pricePen: 820000,
    listingPricePen: 850000,
    stage: "closing",
    targetCloseDate: "2026-10-09",
    sellerName: "Luis Castillo",
    notes: "Cita en la notaría confirmada. Entrega de llaves después del registro.",
  },
];

export const tasks: Task[] = [
  { id: "t1", dealId: "d1", title: "Subir la carta de preaprobación del banco", description: "Envía la carta del banco para mostrársela al vendedor.", assignee: "buyer", status: "pending", dueDate: "2026-09-29" },
  { id: "t2", dealId: "d1", title: "Agendar la inspección de la casa", description: "Coordinar la hora con el inspector y el vendedor.", assignee: "agent", status: "in_progress", dueDate: "2026-09-30" },
  { id: "t3", dealId: "d1", title: "Revisar el informe de inspección", assignee: "buyer", status: "pending", dueDate: "2026-10-08" },
  { id: "t4", dealId: "d1", title: "Firmar la carta de oferta", assignee: "buyer", status: "completed", dueDate: "2026-09-12" },
  { id: "t5", dealId: "d2", title: "Enviar copia del DNI a la notaría", description: "La notaría necesita una copia de tu DNI por ambos lados.", assignee: "buyer", status: "pending", dueDate: "2026-09-26" },
  { id: "t6", dealId: "d2", title: "Pedir el certificado de SUNARP", assignee: "agent", status: "pending", dueDate: "2026-10-02" },
  { id: "t7", dealId: "d3", title: "Preparar la contraoferta", assignee: "agent", status: "in_progress", dueDate: "2026-10-01" },
  { id: "t8", dealId: "d5", title: "Confirmar la cita en la notaría", assignee: "agent", status: "completed", dueDate: "2026-09-25" },
  { id: "t9", dealId: "d5", title: "Transferir la cuota inicial", description: "Transfiere el saldo a la cuenta de la notaría.", assignee: "buyer", status: "in_progress", dueDate: "2026-10-03" },
  { id: "t10", dealId: "d4", title: "Agendar segunda visita", assignee: "agent", status: "pending", dueDate: "2026-10-05" },
];

export const timeline: TimelineEvent[] = [
  { id: "e1", dealId: "d1", name: "Oferta enviada", date: "2026-09-10", type: "offer" },
  { id: "e2", dealId: "d1", name: "Inspección", date: "2026-10-02", type: "inspection" },
  { id: "e3", dealId: "d1", name: "Tasación", date: "2026-10-17", type: "appraisal" },
  { id: "e4", dealId: "d1", name: "Cierre", date: "2026-11-06", type: "closing" },
  { id: "e5", dealId: "d2", name: "Oferta enviada", date: "2026-09-18", type: "offer" },
  { id: "e6", dealId: "d2", name: "Inspección", date: "2026-10-06", type: "inspection" },
  { id: "e7", dealId: "d2", name: "Tasación", date: "2026-10-21", type: "appraisal" },
  { id: "e8", dealId: "d2", name: "Cierre", date: "2026-11-20", type: "closing" },
  { id: "e9", dealId: "d3", name: "Oferta enviada", date: "2026-09-27", type: "offer" },
  { id: "e10", dealId: "d3", name: "Cierre", date: "2026-12-04", type: "closing" },
  { id: "e11", dealId: "d5", name: "Última visita", date: "2026-10-07", type: "custom" },
  { id: "e12", dealId: "d5", name: "Cierre", date: "2026-10-09", type: "closing" },
  { id: "e13", dealId: "d4", name: "Cierre (estimado)", date: "2026-12-18", type: "closing" },
];

export const audit: AuditEntry[] = [
  { id: "a1", dealId: "d1", who: "Maricarmen Fransi", what: "Pasó la venta de Contrato a Revisión", when: "2026-09-27T16:10:00" },
  { id: "a2", dealId: "d1", who: "Lucía Fernández", what: "Completó “Firmar la carta de oferta”", when: "2026-09-12T11:42:00" },
  { id: "a3", dealId: "d1", who: "Maricarmen Fransi", what: "Creó la tarea “Subir la carta de preaprobación del banco”", when: "2026-09-11T09:05:00" },
  { id: "a4", dealId: "d1", who: "Maricarmen Fransi", what: "Creó la venta", when: "2026-09-08T14:30:00" },
];

export const messages: Message[] = [
  { id: "m1", channel: "whatsapp", from: "system", text: "Conversación vinculada con el dashboard de trato.", at: "2026-09-29T08:00:00" },
  { id: "m2", channel: "chat", from: "bot", text: "Hola Maricarmen 👋 Escríbeme lo que necesitas: completar tareas, crear fechas, agregar compradores o cambiar de etapa. Escribe “ayuda” para ver ejemplos.", at: "2026-09-29T08:00:00" },
];
