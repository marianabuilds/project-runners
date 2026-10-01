// Placeholder data only — no backend. Dates are relative to the demo "today".
export const TODAY = "2026-09-29";

export type Stage = "prospect" | "offer" | "under_contract" | "due_diligence" | "closing";
export type TaskStatus = "pending" | "in_progress" | "completed";
export type Assignee = "agent" | "buyer" | "seller";
export type Role = "agent" | "buyer" | "seller";
export type TaskAction = "upload" | "sign" | "schedule" | "review" | "send" | "request" | "prepare" | "confirm" | "transfer";
export type DocStatus = "pendiente" | "subido" | "en_revision" | "firmado" | "aprobado";
export type DocCategory = "Oferta" | "Financiamiento" | "Identidad" | "Propiedad" | "Notaría";
export type Doc = {
  id: string;
  dealId: string;
  name: string;
  category: DocCategory;
  status: DocStatus;
  updatedAt: string;
  updatedBy: string;
  note?: string;
  owner: Role | "shared";
};
export const DOC_CATEGORIES: DocCategory[] = ["Oferta", "Financiamiento", "Identidad", "Propiedad", "Notaría"];
export const DOC_STATUS: Record<DocStatus, string> = { pendiente: "Pendiente", subido: "Subido", en_revision: "En revisión", firmado: "Firmado", aprobado: "Aprobado" };
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
  manual?: boolean;
  docId?: string;
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
  email: "maricarmen@example.com",
  phone: "+51 900 000 000",
  photo: "/avatars/rosa.webp",
};

export const deals: Deal[] = [
  {
    id: "d1",
    address: { street: "Av. José Larco", number: "1150", district: "Miraflores", province: "Lima", department: "Lima" },
    buyer: { name: "Camila Bacan", email: "camila.bacan@example.com", phone: "+51 912 345 678", initials: "CB" },
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
  { id: "t1", dealId: "d1", title: "Cargar carta de precalificación", description: "Envía la carta de precalificación del banco para que podamos compartirla con el vendedor.", assignee: "buyer", status: "pending", dueDate: "2026-09-29", action: "upload", docId: "doc2" },
  { id: "t2", dealId: "d1", title: "Programar inspección del inmueble", description: "Coordina una hora con el inspector y el vendedor.", assignee: "agent", status: "in_progress", dueDate: "2026-09-30", action: "schedule" },
  { id: "t3", dealId: "d1", title: "Revisar reporte de inspección", assignee: "buyer", status: "pending", dueDate: "2026-10-08", action: "review" },
  { id: "t4", dealId: "d1", title: "Firmar carta de oferta", assignee: "buyer", status: "completed", dueDate: "2026-09-12", action: "sign", docId: "doc1" },
  { id: "t5", dealId: "d2", title: "Enviar copia de DNI al notario", description: "El notario necesita una copia de ambos lados de tu DNI.", assignee: "buyer", status: "pending", dueDate: "2026-09-26", action: "send", docId: "d2doc2" },
  { id: "t6", dealId: "d2", title: "Solicitar certificado de partida registral (SUNARP)", assignee: "agent", status: "pending", dueDate: "2026-10-02", action: "request" },
  { id: "t7", dealId: "d3", title: "Preparar contraoferta", assignee: "agent", status: "in_progress", dueDate: "2026-10-01", action: "prepare" },
  { id: "t8", dealId: "d5", title: "Confirmar cita con notario", assignee: "agent", status: "completed", dueDate: "2026-09-25", action: "confirm" },
  { id: "t9", dealId: "d5", title: "Transferir cuota inicial", description: "Transfiere el saldo a la cuenta de depósito en garantía del notario.", assignee: "buyer", status: "in_progress", dueDate: "2026-10-03", action: "transfer" },
  { id: "t11", dealId: "d1", title: "Subir título de propiedad", description: "Sube la copia del título de propiedad para la revisión del notario.", assignee: "seller", status: "pending", dueDate: "2026-10-01", action: "upload", docId: "doc4" },
  { id: "t12", dealId: "d1", title: "Firmar contrato de compraventa", assignee: "seller", status: "pending", dueDate: "2026-10-20", action: "sign", docId: "doc5" },
  { id: "t13", dealId: "d1", title: "Confirmar fecha de entrega de llaves", assignee: "seller", status: "pending", dueDate: "2026-11-05", action: "confirm" },
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
  { id: "a2", dealId: "d1", who: "Camila Bacan", what: 'Completó "Firmar carta de oferta"', when: "2026-09-12T11:42:00" },
  { id: "a3", dealId: "d1", who: "Maricarmen Fransi", what: 'Creó la tarea "Cargar carta de precalificación"', when: "2026-09-11T09:05:00" },
  { id: "a4", dealId: "d1", who: "Maricarmen Fransi", what: "Creó el negocio", when: "2026-09-08T14:30:00" },
];

export const accounts: Record<Role, { name: string; initials: string; label: string; photo?: string; dealIds: string[] | "all" }> = {
  agent: { name: agent.name, initials: agent.initials, label: "Agente", photo: agent.photo, dealIds: "all" },
  buyer: { name: "Camila Bacan", initials: "CB", label: "Compradora", dealIds: ["d1"] },
  seller: { name: "Jorge Salazar", initials: "JS", label: "Vendedor", dealIds: ["d1"] },
};

// Initial shared state (demo). Real value lives in the store.
export const INITIAL_SYNC = "2026-09-29T08:40:00";

const A = "Maricarmen Fransi";
export const docs: Doc[] = [
  { id: "doc1", dealId: "d1", name: "Carta de oferta", category: "Oferta", status: "firmado", updatedAt: "2026-09-12T11:42:00", updatedBy: "Camila Bacan", note: "Firmada y enviada al vendedor.", owner: "shared" },
  { id: "doc2", dealId: "d1", name: "Carta de precalificación", category: "Financiamiento", status: "pendiente", updatedAt: "2026-09-11T09:05:00", updatedBy: A, note: "Esperando respuesta del banco.", owner: "buyer" },
  { id: "doc3", dealId: "d1", name: "DNI del comprador", category: "Identidad", status: "aprobado", updatedAt: "2026-09-14T10:00:00", updatedBy: A, owner: "buyer" },
  { id: "doc4", dealId: "d1", name: "Título de propiedad", category: "Propiedad", status: "pendiente", updatedAt: "2026-09-20T15:30:00", updatedBy: A, note: "Jorge lo enviará esta semana.", owner: "seller" },
  { id: "doc5", dealId: "d1", name: "Contrato de compraventa", category: "Notaría", status: "en_revision", updatedAt: "2026-09-27T16:10:00", updatedBy: A, note: "Borrador con el notario.", owner: "shared" },
  { id: "d2doc1", dealId: "d2", name: "Carta de oferta", category: "Oferta", status: "firmado", updatedAt: "2026-09-18T12:00:00", updatedBy: "Carlos Mendoza", owner: "shared" },
  { id: "d2doc2", dealId: "d2", name: "DNI para el notario", category: "Identidad", status: "pendiente", updatedAt: "2026-09-22T09:00:00", updatedBy: A, note: "Ambos lados, en PDF.", owner: "buyer" },
  { id: "d2doc3", dealId: "d2", name: "Certificado de partida (SUNARP)", category: "Propiedad", status: "pendiente", updatedAt: "2026-09-24T10:00:00", updatedBy: A, owner: "seller" },
  { id: "d3doc1", dealId: "d3", name: "Carta de oferta", category: "Oferta", status: "subido", updatedAt: "2026-09-27T10:00:00", updatedBy: "Ana Rojas", note: "Pendiente de contraoferta.", owner: "shared" },
  { id: "d3doc2", dealId: "d3", name: "Carta de precalificación", category: "Financiamiento", status: "aprobado", updatedAt: "2026-09-25T14:00:00", updatedBy: A, owner: "buyer" },
  { id: "d4doc1", dealId: "d4", name: "DNI del comprador", category: "Identidad", status: "subido", updatedAt: "2026-09-26T11:00:00", updatedBy: "Diego Vargas", owner: "buyer" },
  { id: "d5doc1", dealId: "d5", name: "Contrato de compraventa", category: "Notaría", status: "firmado", updatedAt: "2026-09-25T17:00:00", updatedBy: "Valeria Chávez", note: "Cita con notario confirmada.", owner: "shared" },
  { id: "d5doc2", dealId: "d5", name: "Comprobante de cuota inicial", category: "Financiamiento", status: "subido", updatedAt: "2026-09-28T09:30:00", updatedBy: "Valeria Chávez", owner: "buyer" },
];

// What completing a task does to its linked document.
export const ACTION_DOC_STATUS: Partial<Record<TaskAction, DocStatus>> = {
  upload: "subido", send: "subido", request: "subido", sign: "firmado", review: "aprobado", confirm: "aprobado", transfer: "aprobado", prepare: "en_revision",
};

export const dealById = (id: string) => deals.find((d) => d.id === id);
export const tasksFor = (dealId: string) => tasks.filter((t) => t.dealId === dealId);
export const eventsFor = (dealId: string) =>
  timeline.filter((e) => e.dealId === dealId).sort((a, b) => a.date.localeCompare(b.date));
export const auditFor = (dealId: string) => audit.filter((a) => a.dealId === dealId);
