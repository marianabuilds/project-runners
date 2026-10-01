// Placeholder data only — no backend. Dates are relative to the demo "today".
export const TODAY = "2026-09-29";

export type Stage = "prospect" | "offer" | "under_contract" | "due_diligence" | "closing";
export type TaskStatus = "pending" | "in_progress" | "completed";
export type Assignee = "agent" | "buyer";
export type TaskAction = "upload" | "sign" | "schedule" | "review" | "send" | "request" | "prepare" | "confirm" | "transfer";
export type EventType = "offer" | "inspection" | "appraisal" | "closing" | "custom";

export const STAGES: { key: Stage; label: string }[] = [
  { key: "prospect", label: "Prospecto" },
  { key: "offer", label: "Oferta" },
  { key: "under_contract", label: "Bajo contrato" },
  { key: "due_diligence", label: "Diligencia debida" },
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
  action: TaskAction;
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
};

export type Deal = {
  id: string;
  address: { street: string; number: string; district: string; province: string; department: string };
  buyer: { name: string; email: string; phone: string; initials: string };
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
  agency: "Quispe Inmobiliaria",
  email: "rosa@quispeinmobiliaria.pe",
  phone: "+51 987 654 321",
  photo: "/avatars/rosa.webp",
};

export const deals: Deal[] = [
  {
    id: "d1",
    address: { street: "Av. José Larco", number: "1150", district: "Miraflores", province: "Lima", department: "Lima" },
    buyer: { name: "Lucía Fernández", email: "lucia.fernandez@example.com", phone: "+51 912 345 678", initials: "LF" },
    pricePen: 685000,
    listingPricePen: 720000,
    stage: "due_diligence",
    targetCloseDate: "2026-11-06",
    sellerName: "Jorge Salazar",
    notes: "La compradora prefiere cerrar antes de fin de noviembre. Vendedor flexible con muebles.",
  },
  {
    id: "d2",
    address: { street: "Calle Los Pinos", number: "245", district: "San Isidro", province: "Lima", department: "Lima" },
    buyer: { name: "Carlos Mendoza", email: "carlos.mendoza@example.com", phone: "+51 923 456 789", initials: "CM" },
    pricePen: 1250000,
    listingPricePen: 1320000,
    stage: "under_contract",
    targetCloseDate: "2026-11-20",
    sellerName: "María Torres",
    notes: "Hipoteca con BCP. Avalúo pendiente de programación bancaria.",
  },
  {
    id: "d3",
    address: { street: "Jr. Bolognesi", number: "380", district: "Barranco", province: "Lima", department: "Lima" },
    buyer: { name: "Ana Rojas", email: "ana.rojas@example.com", phone: "+51 934 567 890", initials: "AR" },
    pricePen: 450000,
    listingPricePen: 475000,
    stage: "offer",
    targetCloseDate: "2026-12-04",
    sellerName: "Pedro Huamán",
    notes: "Se espera contraoferta esta semana.",
  },
  {
    id: "d4",
    address: { street: "Av. Ejército", number: "712", district: "Yanahuara", province: "Arequipa", department: "Arequipa" },
    buyer: { name: "Diego Vargas", email: "diego.vargas@example.com", phone: "+51 945 678 901", initials: "DV" },
    pricePen: 390000,
    stage: "prospect",
    targetCloseDate: "2026-12-18",
    sellerName: "Rosario Paredes",
    notes: "Visitará dos propiedades más antes de decidir.",
  },
  {
    id: "d5",
    address: { street: "Calle Alcanfores", number: "560", district: "Surco", province: "Lima", department: "Lima" },
    buyer: { name: "Valeria Chávez", email: "valeria.chavez@example.com", phone: "+51 956 789 012", initials: "VC" },
    pricePen: 820000,
    listingPricePen: 850000,
    stage: "closing",
    targetCloseDate: "2026-10-09",
    sellerName: "Luis Castillo",
    notes: "Cita con notario confirmada. Entrega de llaves después del registro.",
  },
];

export const tasks: Task[] = [
  { id: "t1", dealId: "d1", title: "Cargar carta de precalificación", description: "Envía la carta de precalificación del banco para que podamos compartirla con el vendedor.", assignee: "buyer", status: "pending", dueDate: "2026-09-29", action: "upload" },
  { id: "t2", dealId: "d1", title: "Programar inspección del inmueble", description: "Coordina una hora con el inspector y el vendedor.", assignee: "agent", status: "in_progress", dueDate: "2026-09-30", action: "schedule" },
  { id: "t3", dealId: "d1", title: "Revisar reporte de inspección", assignee: "buyer", status: "pending", dueDate: "2026-10-08", action: "review" },
  { id: "t4", dealId: "d1", title: "Firmar carta de oferta", assignee: "buyer", status: "completed", dueDate: "2026-09-12", action: "sign" },
  { id: "t5", dealId: "d2", title: "Enviar copia de DNI al notario", description: "El notario necesita una copia de ambos lados de tu DNI.", assignee: "buyer", status: "pending", dueDate: "2026-09-26", action: "send" },
  { id: "t6", dealId: "d2", title: "Solicitar certificado de partida registral (SUNARP)", assignee: "agent", status: "pending", dueDate: "2026-10-02", action: "request" },
  { id: "t7", dealId: "d3", title: "Preparar contraoferta", assignee: "agent", status: "in_progress", dueDate: "2026-10-01", action: "prepare" },
  { id: "t8", dealId: "d5", title: "Confirmar cita con notario", assignee: "agent", status: "completed", dueDate: "2026-09-25", action: "confirm" },
  { id: "t9", dealId: "d5", title: "Transferir cuota inicial", description: "Transfiere el saldo a la cuenta de depósito en garantía del notario.", assignee: "buyer", status: "in_progress", dueDate: "2026-10-03", action: "transfer" },
  { id: "t10", dealId: "d4", title: "Programar segunda visita", assignee: "agent", status: "pending", dueDate: "2026-10-05", action: "schedule" },
];

export const timeline: TimelineEvent[] = [
  { id: "e1", dealId: "d1", name: "Oferta presentada", date: "2026-09-10", type: "offer" },
  { id: "e2", dealId: "d1", name: "Inspección", date: "2026-10-02", type: "inspection" },
  { id: "e3", dealId: "d1", name: "Avalúo", date: "2026-10-17", type: "appraisal" },
  { id: "e4", dealId: "d1", name: "Cierre", date: "2026-11-06", type: "closing" },
  { id: "e5", dealId: "d2", name: "Oferta presentada", date: "2026-09-18", type: "offer" },
  { id: "e6", dealId: "d2", name: "Inspección", date: "2026-10-06", type: "inspection" },
  { id: "e7", dealId: "d2", name: "Avalúo", date: "2026-10-21", type: "appraisal" },
  { id: "e8", dealId: "d2", name: "Cierre", date: "2026-11-20", type: "closing" },
  { id: "e9", dealId: "d3", name: "Oferta presentada", date: "2026-09-27", type: "offer" },
  { id: "e10", dealId: "d3", name: "Cierre", date: "2026-12-04", type: "closing" },
  { id: "e11", dealId: "d5", name: "Inspección final", date: "2026-10-07", type: "custom" },
  { id: "e12", dealId: "d5", name: "Cierre", date: "2026-10-09", type: "closing" },
  { id: "e13", dealId: "d4", name: "Cierre (meta)", date: "2026-12-18", type: "closing" },
];

export const audit: AuditEntry[] = [
  { id: "a1", dealId: "d1", who: "Maricarmen Fransi", what: "Movió la etapa de Bajo contrato a Diligencia debida", when: "2026-09-27T16:10:00" },
  { id: "a2", dealId: "d1", who: "Lucía Fernández", what: 'Completó "Firmar carta de oferta"', when: "2026-09-12T11:42:00" },
  { id: "a3", dealId: "d1", who: "Maricarmen Fransi", what: 'Creó la tarea "Cargar carta de precalificación"', when: "2026-09-11T09:05:00" },
  { id: "a4", dealId: "d1", who: "Maricarmen Fransi", what: "Creó el negocio", when: "2026-09-08T14:30:00" },
];

export const dealById = (id: string) => deals.find((d) => d.id === id);
export const tasksFor = (dealId: string) => tasks.filter((t) => t.dealId === dealId);
export const eventsFor = (dealId: string) =>
  timeline.filter((e) => e.dealId === dealId).sort((a, b) => a.date.localeCompare(b.date));
export const auditFor = (dealId: string) => audit.filter((a) => a.dealId === dealId);
