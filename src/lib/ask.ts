import { DOC_STATUS, type AuditEntry, type Deal, type Doc, type ManageInfo, type Role, type Task } from "./data";
import { daysFromToday, fmtLong, pen, relativeDue, shortAddress } from "./format";

// Read-only, deterministic Q&A over what the viewer can already see in the portal.
// No LLM, no network. Inputs are the role-scoped slices of the store, so nothing hidden can leak.
export type AskCtx = {
  role: Role;
  deals: Deal[];
  isAll: boolean;
  tasks: Task[];
  docs: Doc[];
  activity: AuditEntry[];
  lastSync: string;
  manage: Record<string, ManageInfo>;
};
export type Source = { label: string; href: string };
export type Answer = { text: string; sources: Source[]; fallback: boolean };

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[¿?¡!.,]/g, " ");
const has = (q: string, re: RegExp) => re.test(q);
const dt = (iso: string) => new Date(iso).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
const dealName = (ctx: AskCtx, id: string) => {
  const d = ctx.deals.find((x) => x.id === id);
  return d ? shortAddress(d) : "";
};
const withDeal = (ctx: AskCtx, id: string, text: string) => (ctx.isAll ? `${dealName(ctx, id)}: ${text}` : text);

const S = { tasks: { label: "Tareas", href: "/tasks" }, docs: { label: "Documentos", href: "/documents" }, cal: { label: "Calendario", href: "/calendar" } };
const dealSrc = (d: Deal): Source => ({ label: shortAddress(d), href: `/deals/${d.id}` });

const NOT_FOUND: Answer = { text: "No encuentro eso en el portal.", sources: [], fallback: true };
const READ_ONLY: Answer = { text: "Solo consulto información del portal; no hago cambios. Para hacer cambios usa Tareas, o escríbenos por WhatsApp.", sources: [{ label: "Tareas", href: "/tasks" }], fallback: true };

export function answer(question: string, ctx: AskCtx): Answer {
  const q = norm(question).trim();
  if (!q) return NOT_FOUND;
  if (!ctx.deals.length) return NOT_FOUND;

  // Not an action chat.
  if (has(q, /^(por favor )?(crea|crear|agrega|agregar|firma|firmar|cambia|cambiar|envia|enviar|manda|sube|subir|borra|elimina|actualiza|mueve|marca|programa)\b/) || has(q, /\b(quiero|puedes|podrias|necesito que)\s+(crear|agregar|firmar|cambiar|enviar|subir|borrar|eliminar|actualizar|mover|marcar|programar)\b/)) {
    return READ_ONLY;
  }

  const open = ctx.tasks.filter((t) => t.status !== "completed").sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  // Documents (checked before tasks so "qué documentos faltan" doesn't read as a task question).
  const docNameHit = ctx.docs.filter((d) => norm(d.name).split(" ").filter((w) => w.length > 3).some((w) => q.includes(w)) && has(q, /document|carta|dni|titulo|contrato|certificado|comprobante|estado|firmad|subid|aprobad|revision|nota|actualiz/));
  if (has(q, /document|papeles|archivo/) || docNameHit.length) {
    const list = docNameHit.length && !has(q, /document(os)? (faltan|pendientes)|que document|todos los document/) ? docNameHit : ctx.docs;
    if (has(q, /falta|pendiente|sin /)) {
      const pend = ctx.docs.filter((d) => d.status === "pendiente");
      if (!pend.length) return { text: "No hay documentos pendientes. 🎉", sources: [S.docs], fallback: false };
      return { text: "Documentos pendientes:\n" + pend.map((d) => `• ${withDeal(ctx, d.dealId, d.name)} (${d.category})${d.note ? ` — ${d.note}` : ""}`).join("\n"), sources: [S.docs], fallback: false };
    }
    if (!list.length) return { text: "No hay documentos disponibles para ti en este negocio.", sources: [S.docs], fallback: false };
    return {
      text: list.slice(0, 6).map((d) => `• ${withDeal(ctx, d.dealId, d.name)}: ${DOC_STATUS[d.status]} · ${dt(d.updatedAt)} · por ${d.updatedBy}${d.note ? ` — “${d.note}”` : ""}`).join("\n"),
      sources: [S.docs],
      fallback: false,
    };
  }

  // Tasks
  if (has(q, /tarea|pendiente|por hacer|que (me )?falta|que debo|atrasad|vencid|vence|tengo que/)) {
    if (has(q, /atrasad|vencid/)) {
      const late = open.filter((t) => daysFromToday(t.dueDate) < 0);
      if (!late.length) return { text: "No tienes tareas atrasadas.", sources: [S.tasks], fallback: false };
      return { text: "Tareas atrasadas:\n" + late.map((t) => `• ${withDeal(ctx, t.dealId, t.title)} (${relativeDue(t.dueDate)})`).join("\n"), sources: [S.tasks], fallback: false };
    }
    if (!open.length) return { text: "No tienes tareas pendientes. 🎉", sources: [S.tasks], fallback: false };
    return { text: `Tienes ${open.length} ${open.length === 1 ? "tarea pendiente" : "tareas pendientes"}:\n` + open.slice(0, 6).map((t) => `• ${withDeal(ctx, t.dealId, t.title)} (${relativeDue(t.dueDate)})`).join("\n"), sources: [S.tasks, S.cal], fallback: false };
  }

  // Closing / dates
  if (has(q, /cierre|cerrar|cierra|fecha|cuanto falta|cuantos dias/)) {
    const lines = [...ctx.deals].sort((a, b) => a.targetCloseDate.localeCompare(b.targetCloseDate)).map((d) => {
      const n = daysFromToday(d.targetCloseDate);
      return `• ${ctx.isAll ? shortAddress(d) + ": " : ""}cierre el ${fmtLong(d.targetCloseDate).replace(/^\w+, /, "")} (${n >= 0 ? `faltan ${n} días` : "ya pasó"})`;
    });
    return { text: lines.join("\n"), sources: ctx.deals.slice(0, 3).map(dealSrc), fallback: false };
  }

  // Price (permission-aware)
  if (has(q, /precio|cuanto cuesta|costo|oferta|descuento|lista/)) {
    const lines = ctx.deals.map((d) => {
      const showList = ctx.role !== "buyer" || ctx.manage[d.id]?.buyerAccess.listPrice !== false;
      const parts = [`oferta ${pen(d.pricePen, 0)}`];
      if (d.listingPricePen && showList) parts.push(`precio de lista ${pen(d.listingPricePen, 0)}`);
      return `• ${ctx.isAll ? shortAddress(d) + ": " : ""}${parts.join(" · ")}`;
    });
    return { text: lines.join("\n"), sources: ctx.deals.slice(0, 3).map(dealSrc), fallback: false };
  }

  // Stage / progress
  if (has(q, /etapa|avance|progreso|en que va|como va|estado del negocio|resumen/)) {
    return { text: ctx.deals.map((d) => `• ${ctx.isAll ? shortAddress(d) + ": " : ""}${stageText(d.stage)}`).join("\n"), sources: ctx.deals.slice(0, 3).map(dealSrc), fallback: false };
  }

  // Property
  if (has(q, /propiedad|departamento|casa|descripcion|caracteristica|dormitorio|bano|metraje|m2|foto|imagen/)) {
    const lines = ctx.deals.map((d) => {
      const m = ctx.manage[d.id];
      if (!m) return "";
      const photos = ctx.role !== "buyer" || m.buyerAccess.photos ? m.photos.length : 0;
      return `• ${ctx.isAll ? shortAddress(d) + ": " : ""}${m.description}${m.features.length ? ` (${m.features.join(", ")})` : ""}${has(q, /foto|imagen/) ? ` · ${photos} ${photos === 1 ? "foto" : "fotos"}` : ""}`;
    }).filter(Boolean);
    if (lines.length) return { text: lines.join("\n"), sources: ctx.deals.slice(0, 3).map(dealSrc), fallback: false };
  }

  // Activity
  if (has(q, /que paso|actividad|ultim|reciente|novedad|quien (actualizo|cambio|subio|firmo)|hoy/)) {
    if (!ctx.activity.length) return { text: "Todavía no hay actividad.", sources: [], fallback: false };
    return { text: "Lo más reciente:\n" + ctx.activity.slice(0, 5).map((a) => `• ${a.who}: ${a.what} (${dt(a.when)})`).join("\n"), sources: [{ label: "Panel", href: "/" }], fallback: false };
  }

  // WhatsApp sync
  if (has(q, /whatsapp|sincroniz|actualizad|ultima vez/)) {
    return { text: `El portal se sincronizó con WhatsApp por última vez el ${dt(ctx.lastSync).replace(/\.$/, "")}.`, sources: [{ label: "Configuración", href: "/settings" }], fallback: false };
  }

  // People / who manages
  if (has(q, /quien (gestiona|maneja|administra|ve)|agente|contacto|telefono|vendedor|comprador/)) {
    const d = ctx.deals[0];
    if (has(q, /gestiona|maneja|administra/)) {
      const seller = ctx.role === "buyer" && ctx.manage[d.id]?.buyerAccess.sellerName === false ? "el vendedor" : d.sellerName;
      return { text: `Gestionan este negocio: Maricarmen Fransi (Agente) y ${seller} (Vendedor).${ctx.role === "buyer" ? " Tú ves una versión limitada." : ` ${d.buyer.name} ve una versión limitada.`}`, sources: [dealSrc(d)], fallback: false };
    }
    const showSeller = ctx.role !== "buyer" || ctx.manage[d.id]?.buyerAccess.sellerName !== false;
    const parts = [`Agente: Maricarmen Fransi`];
    if (ctx.role !== "seller") parts.push(`Comprador: ${d.buyer.name}`);
    if (showSeller) parts.push(`Vendedor: ${d.sellerName}`);
    return { text: parts.join("\n"), sources: [dealSrc(d)], fallback: false };
  }

  return NOT_FOUND;
}

function stageText(s: Deal["stage"]) {
  const label = { prospect: "Prospecto", offer: "Oferta", under_contract: "Bajo contrato", due_diligence: "Diligencia debida", closing: "Cierre" }[s];
  return `etapa actual: ${label}`;
}

export const FAQ = [
  "¿Qué me falta por hacer?",
  "¿Qué tareas están atrasadas?",
  "¿Qué documentos faltan?",
  "¿Cuándo es el cierre?",
  "¿En qué etapa va el negocio?",
  "¿Cuál es el precio?",
  "¿Qué pasó últimamente?",
  "¿Cuándo se sincronizó WhatsApp?",
  "¿Quién gestiona este negocio?",
];
