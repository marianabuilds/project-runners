import "server-only";
import fs from "fs";
import path from "path";
import {
  audit as seedAudit,
  deals as seedDeals,
  messages as seedMessages,
  tasks as seedTasks,
  timeline as seedTimeline,
  agent,
  type AuditEntry,
  type Buyer,
  type BuyerRole,
  type Deal,
  type DealKind,
  type EventType,
  type Message,
  type Source,
  type Stage,
  type Task,
  type TaskStatus,
  type TimelineEvent,
} from "./data";
import { initialsOf, shortAddress, stageLabel } from "./format";

// JSON-file store (local / self-hosted). Swap this module for a DB to deploy on serverless.
type Db = { deals: Deal[]; tasks: Task[]; timeline: TimelineEvent[]; audit: AuditEntry[]; messages: Message[] };

const FILE = path.join(process.cwd(), "data", "db.json");

function load(): Db {
  if (!fs.existsSync(FILE)) {
    const db: Db = {
      deals: seedDeals,
      tasks: seedTasks,
      timeline: seedTimeline,
      audit: seedAudit,
      messages: seedMessages,
    };
    save(db);
    return structuredClone(db);
  }
  return JSON.parse(fs.readFileSync(FILE, "utf8")) as Db;
}

function save(db: Db) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}

const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
const now = () => new Date().toISOString().slice(0, 19);

// ---- reads ----
export const getDeals = () => load().deals;
export const getTasks = () => load().tasks;
export const getEvents = () => load().timeline;
// Tareas que le tocan a la agente ("Lo haces tú"), abiertas.
export const getAgentTasks = () =>
  load().tasks.filter((t) => t.assignee === "agent" && t.status !== "completed").sort((a, b) => a.dueDate.localeCompare(b.dueDate));
export const dealById = (id: string) => load().deals.find((d) => d.id === id);
export const tasksFor = (dealId: string) => load().tasks.filter((t) => t.dealId === dealId);
export const eventsFor = (dealId: string) =>
  load().timeline.filter((e) => e.dealId === dealId).sort((a, b) => a.date.localeCompare(b.date));
export const auditFor = (dealId: string) =>
  load().audit.filter((a) => a.dealId === dealId).sort((a, b) => b.when.localeCompare(a.when));
export const getMessages = (channel: Message["channel"]) => load().messages.filter((m) => m.channel === channel);
export const getRecentActivity = (n = 6) =>
  load().audit.sort((a, b) => b.when.localeCompare(a.when)).slice(0, n);

// ---- writes ----
const channelLabel: Record<Source, string> = { dashboard: "el dashboard", chat: "el chat", whatsapp: "WhatsApp" };

// Logs the change and mirrors it to the other channel so dashboard and WhatsApp stay in sync.
function log(db: Db, dealId: string, what: string, source: Source) {
  db.audit.push({ id: uid("a"), dealId, who: agent.name, what, when: now(), source });
  const deal = db.deals.find((d) => d.id === dealId);
  const text = `Actualizado desde ${channelLabel[source]}: ${what}${deal ? ` (${shortAddress(deal)})` : ""}`;
  if (source !== "whatsapp") db.messages.push({ id: uid("m"), channel: "whatsapp", from: "system", text, at: now() });
  if (source !== "chat") db.messages.push({ id: uid("m"), channel: "chat", from: "system", text, at: now() });
}

function mutate<T>(fn: (db: Db) => T): T {
  const db = load();
  const out = fn(db);
  save(db);
  return out;
}

export const setTaskStatus = (id: string, status: TaskStatus, source: Source) =>
  mutate((db) => {
    const t = db.tasks.find((x) => x.id === id);
    if (!t) return null;
    t.status = status;
    log(db, t.dealId, `${status === "completed" ? "Completó" : "Reabrió"} “${t.title}”`, source);
    return t;
  });

export const addTask = (
  input: { dealId: string; title: string; assignee: Task["assignee"]; dueDate: string },
  source: Source,
) =>
  mutate((db) => {
    const t: Task = { id: uid("t"), status: "pending", ...input };
    db.tasks.push(t);
    log(db, t.dealId, `Creó la tarea “${t.title}”`, source);
    return t;
  });

export const addEvent = (input: { dealId: string; name: string; date: string; type: EventType }, source: Source) =>
  mutate((db) => {
    const e: TimelineEvent = { id: uid("e"), ...input };
    db.timeline.push(e);
    log(db, e.dealId, `Agendó “${e.name}” para el ${e.date}`, source);
    return e;
  });

export const setStage = (dealId: string, stage: Stage, source: Source) =>
  mutate((db) => {
    const d = db.deals.find((x) => x.id === dealId);
    if (!d) return null;
    const from = d.stage;
    d.stage = stage;
    log(db, dealId, `Cambió la etapa de ${stageLabel(from)} a ${stageLabel(stage)}`, source);
    return d;
  });

export const addBuyer = (
  dealId: string,
  input: { name: string; email?: string; phone?: string; role?: BuyerRole },
  source: Source,
) =>
  mutate((db) => {
    const d = db.deals.find((x) => x.id === dealId);
    if (!d) return null;
    const b: Buyer = {
      id: uid("b"),
      name: input.name,
      email: input.email ?? "",
      phone: input.phone ?? "",
      initials: initialsOf(input.name),
      role: input.role ?? (d.buyers.length ? "co-comprador" : "principal"),
    };
    d.buyers.push(b);
    log(db, dealId, `Agregó a ${b.name} como ${d.kind === "venta" ? "comprador" : "inquilino"}`, source);
    return b;
  });

export const createDeal = (
  input: {
    kind: DealKind;
    address: Deal["address"];
    pricePen: number;
    listingPricePen?: number;
    targetCloseDate: string;
    sellerName: string;
    buyers: { name: string; email?: string; phone?: string }[];
  },
  source: Source,
) =>
  mutate((db) => {
    const id = uid("d");
    const deal: Deal = {
      id,
      kind: input.kind,
      address: input.address,
      pricePen: input.pricePen,
      listingPricePen: input.listingPricePen,
      stage: "prospect",
      targetCloseDate: input.targetCloseDate,
      sellerName: input.sellerName,
      notes: "",
      buyers: input.buyers
        .filter((b) => b.name.trim())
        .map((b, i) => ({
          id: uid("b"),
          name: b.name.trim(),
          email: b.email ?? "",
          phone: b.phone ?? "",
          initials: initialsOf(b.name),
          role: i === 0 ? "principal" : "co-comprador",
        })),
    };
    db.deals.push(deal);
    log(db, id, `Creó ${input.kind === "venta" ? "la venta" : "el alquiler"}`, source);
    return deal;
  });

export const addMessage = (channel: Message["channel"], from: Message["from"], text: string) =>
  mutate((db) => {
    db.messages.push({ id: uid("m"), channel, from, text, at: now() });
  });
