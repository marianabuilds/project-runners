import "server-only";
import { EVENT_TYPES, STAGES, TODAY, type Deal, type EventType, type Source, type Stage } from "./data";
import { addBuyer, addEvent, addTask, getDeals, getEvents, getTasks, setStage, setTaskStatus } from "./store";
import { buyersLabel, fmtShort, relativeDue, shortAddress, stageLabel } from "./format";

// Rule-based Spanish command parser shared by the dashboard chat and the WhatsApp simulator.
// `strip` keeps string length identical so indices found in the stripped text map to the original.
const strip = (s: string) =>
  Array.from(s.normalize("NFC")).map((c) => c.normalize("NFD").replace(/[̀-ͯ]/g, "")).join("").toLowerCase();

type Span = [number, number];
const has = (s: string, k: string) => new RegExp(`(^|[^a-z0-9])${k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`).exec(s);

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const WEEKDAYS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const addDays = (base: string, n: number) => {
  const d = new Date(base + "T12:00:00");
  d.setDate(d.getDate() + n);
  return iso(d);
};

function parseDate(s: string): { date: string; span: Span } | null {
  let m: RegExpExecArray | null;
  if ((m = /\d{4}-\d{2}-\d{2}/.exec(s))) return { date: m[0], span: [m.index, m.index + m[0].length] };
  if ((m = /pasado manana/.exec(s))) return { date: addDays(TODAY, 2), span: [m.index, m.index + m[0].length] };
  if ((m = /\bmanana\b/.exec(s))) return { date: addDays(TODAY, 1), span: [m.index, m.index + m[0].length] };
  if ((m = /\bhoy\b/.exec(s))) return { date: TODAY, span: [m.index, m.index + m[0].length] };
  const year = Number(TODAY.slice(0, 4));
  const fix = (mo: number, d: number) => {
    let y = year;
    let out = `${y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    if (out < TODAY) out = `${++y}-${String(mo).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return out;
  };
  if ((m = new RegExp(`(\\d{1,2})\\s*(?:de\\s+)?(${MONTHS.join("|")})[a-z]*`).exec(s)))
    return { date: fix(MONTHS.indexOf(m[2]) + 1, Number(m[1])), span: [m.index, m.index + m[0].length] };
  if ((m = /\b(\d{1,2})[\/-](\d{1,2})\b/.exec(s)))
    return { date: fix(Number(m[2]), Number(m[1])), span: [m.index, m.index + m[0].length] };
  if ((m = new RegExp(`(?:el\\s+)?(${WEEKDAYS.join("|")})`).exec(s))) {
    const target = WEEKDAYS.indexOf(m[1]);
    const cur = new Date(TODAY + "T12:00:00").getDay();
    return { date: addDays(TODAY, ((target - cur + 7) % 7) || 7), span: [m.index, m.index + m[0].length] };
  }
  return null;
}

const STOP = new Set(["los", "las", "del", "calle", "jiron", "av", "avenida"]);

function findDeal(s: string, deals: Deal[]): { deal: Deal | null; span: Span | null; ambiguous: Deal[] } {
  const scored = deals.map((d) => {
    const keys: { k: string; w: number }[] = [];
    const core = strip(d.address.street).replace(/^(av\.?|avenida|calle|jr\.?|jiron)\s+/, "");
    keys.push({ k: core, w: 5 }, { k: strip(d.address.district), w: 2 });
    const last = core.split(" ").pop()!;
    if (last !== core && last.length > 3 && !STOP.has(last)) keys.push({ k: last, w: 3 });
    for (const b of d.buyers) {
      const n = strip(b.name);
      keys.push({ k: n, w: 5 });
      for (const p of n.split(" ")) if (p.length > 3) keys.push({ k: p, w: 3 });
    }
    keys.push({ k: d.address.number, w: 1 });
    let score = 0;
    let best: { k: string; span: Span; w: number } | null = null;
    for (const { k, w } of keys) {
      const m = has(s, k);
      if (!m) continue;
      score += w;
      const start = m.index + m[1].length;
      if (!best || k.length > best.k.length) best = { k, span: [start, start + k.length], w };
    }
    return { d, score, span: best?.span ?? null };
  });
  scored.sort((a, b) => b.score - a.score);
  if (!scored[0] || scored[0].score === 0) return { deal: null, span: null, ambiguous: [] };
  const tied = scored.filter((x) => x.score === scored[0].score);
  if (tied.length > 1) return { deal: null, span: null, ambiguous: tied.map((x) => x.d) };
  return { deal: scored[0].d, span: scored[0].span, ambiguous: [] };
}

// Removes spans (and a leading preposition before the deal span) from the original text.
function cut(orig: string, s: string, spans: (Span | null)[]) {
  const ranges = spans.filter((x): x is Span => x !== null).map(([a, b]) => {
    const pre = /(?:\b(?:en|a|de|para|con|al|del)\s+(?:la\s+|el\s+)?)$/.exec(s.slice(0, a));
    return [pre ? a - pre[0].length : a, b] as Span;
  });
  ranges.sort((x, y) => y[0] - x[0]);
  let out = orig;
  for (const [a, b] of ranges) out = out.slice(0, a) + " " + out.slice(b);
  return out.replace(/\s+/g, " ").replace(/^[\s,.:;-]+|[\s,.:;-]+$/g, "").replace(/\b(en|a|de|para|el|la|con)$/i, "").trim();
}

const cap = (t: string) => (t ? t[0].toUpperCase() + t.slice(1) : t);
const list = (ds: Deal[]) => ds.map((d) => `• ${shortAddress(d)} (${d.address.district})`).join("\n");

export type AgentResult = { reply: string; changed: boolean };

export function runAgent(text: string, source: Source): AgentResult {
  const orig = text.trim().replace(/\s+/g, " ");
  const s = strip(orig);
  const deals = getDeals();
  const ask = (what: string): AgentResult => ({
    reply: `¿En qué venta? ${what}\n${list(deals)}\nEscribe la calle, el distrito o el nombre del comprador.`,
    changed: false,
  });
  const found = findDeal(s, deals);
  const needDeal = (what: string): AgentResult | null => {
    if (found.deal) return null;
    if (found.ambiguous.length) return { reply: `Encontré varias coincidencias:\n${list(found.ambiguous)}\nSé más específica, por favor.`, changed: false };
    return ask(what);
  };

  // ayuda
  if (/^(ayuda|help|hola|menu)\b|que puedes/.test(s))
    return {
      reply: [
        "Puedo hacer esto por ti:",
        "• “completa tarea inspección en Larco”",
        "• “agrega tarea enviar contrato en Los Pinos para el comprador mañana”",
        "• “nuevo evento tasación en Los Pinos 12 oct”",
        "• “cambia etapa de Bolognesi a cierre”",
        "• “agrega comprador Juan Pérez 999 111 222 a Alcanfores”",
        "• “resumen” para ver qué tienes hoy",
      ].join("\n"),
      changed: false,
    };

  // resumen
  if (/^(resumen|que tengo|pendientes|agenda de hoy)|que hay hoy/.test(s)) {
    const open = getTasks().filter((t) => t.status !== "completed" && t.dueDate <= addDays(TODAY, 3)).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const evs = getEvents().filter((e) => e.date >= TODAY && e.date <= addDays(TODAY, 7)).sort((a, b) => a.date.localeCompare(b.date));
    const dn = (id: string) => shortAddress(deals.find((d) => d.id === id)!);
    return {
      reply: [
        open.length ? `Tareas próximas (${open.length}):` : "Sin tareas urgentes 🎉",
        ...open.slice(0, 6).map((t) => `• ${t.title} — ${dn(t.dealId)} · ${relativeDue(t.dueDate)}`),
        evs.length ? `\nEventos esta semana (${evs.length}):` : "",
        ...evs.map((e) => `• ${e.name} — ${dn(e.dealId)} · ${fmtShort(e.date)}`),
      ].filter(Boolean).join("\n"),
      changed: false,
    };
  }

  // agregar comprador
  let m = /(?:agrega|anade|suma|registra)\w*\s+(?:un\s+|una\s+)?(co-?comprador|comprador|inquilino|interesado)\s+/.exec(s);
  if (m) {
    const miss = needDeal("Para agregar un comprador necesito saber la venta.");
    if (miss) return miss;
    const phone = /(\+?\d[\d\s]{7,}\d)/.exec(orig);
    const rest = cut(orig, s, [[0, m.index + m[0].length], found.span, phone ? [phone.index, phone.index + phone[0].length] : null]);
    if (!rest) return { reply: "¿Cómo se llama la persona? Ej.: “agrega comprador Juan Pérez a Alcanfores”.", changed: false };
    const role = /co-?comprador/.test(m[1]) ? "co-comprador" : m[1] === "interesado" ? "interesado" : undefined;
    addBuyer(found.deal!.id, { name: rest.split(/\s+/).map(cap).join(" "), phone: phone?.[1].trim(), role }, source);
    const n = found.deal!.buyers.length + 1;
    return { reply: `✅ Agregué a ${rest.split(/\s+/).map(cap).join(" ")} en ${shortAddress(found.deal!)}. Ahora hay ${n} ${buyersLabel(found.deal!.kind).toLowerCase()}.`, changed: true };
  }

  // cambiar etapa
  if (/(cambia|mueve|pasa|avanza|actualiza)\w*/.test(s) && /etapa|fase|a (prospecto|interesado|oferta|contrato|revision|cierre)/.test(s)) {
    const stageWords: Record<Stage, string> = { prospect: "(?:prospecto|interesado)", offer: "oferta", under_contract: "contrato", due_diligence: "revision", closing: "cierre" };
    const st = STAGES.find((x) => new RegExp(`(?:a|etapa|fase)\\s+(?:la\\s+)?${stageWords[x.key]}`).test(s)) ?? STAGES.find((x) => new RegExp(`\\b${stageWords[x.key]}\\b`).test(s));
    const miss = needDeal("¿A cuál le cambio la etapa?");
    if (miss) return miss;
    if (!st) return { reply: `¿A qué etapa? Opciones: ${STAGES.map((x) => x.label).join(", ")}.`, changed: false };
    setStage(found.deal!.id, st.key, source);
    return { reply: `✅ ${shortAddress(found.deal!)} pasó a “${stageLabel(st.key)}”.`, changed: true };
  }

  // completar tarea
  if (/(complet|termin|cierra|finaliz|marca|hecho|lista)\w*/.test(s) && !/evento|cita/.test(s)) {
    let pool = getTasks().filter((t) => t.status !== "completed");
    if (found.deal) pool = pool.filter((t) => t.dealId === found.deal!.id);
    const words = s.replace(/^(?:\w+\s+)?(?:la\s+)?(?:tarea\s+)?/, "");
    const ranked = pool
      .map((t) => ({ t, n: strip(t.title).split(/\s+/).filter((w) => w.length > 3 && has(words, w)).length }))
      .filter((x) => x.n > 0)
      .sort((a, b) => b.n - a.n);
    if (!ranked.length) {
      const open = pool.slice(0, 5).map((t) => `• ${t.title}`).join("\n");
      return { reply: `No encontré esa tarea. Pendientes${found.deal ? ` en ${shortAddress(found.deal)}` : ""}:\n${open || "—"}`, changed: false };
    }
    if (ranked.length > 1 && ranked[0].n === ranked[1].n && !found.deal)
      return { reply: `Hay varias tareas parecidas:\n${ranked.slice(0, 4).map((x) => `• ${x.t.title} (${shortAddress(deals.find((d) => d.id === x.t.dealId)!)})`).join("\n")}\nIndica la venta.`, changed: false };
    setTaskStatus(ranked[0].t.id, "completed", source);
    return { reply: `✅ Completé “${ranked[0].t.title}”.`, changed: true };
  }

  // nueva tarea
  m = /(?:agrega|anade|crea|nueva|nuevo|programa)\w*\s+(?:una\s+)?tarea\s*/.exec(s);
  if (m) {
    const miss = needDeal("¿Para qué venta es la tarea?");
    if (miss) return miss;
    const dt = parseDate(s);
    const buyer = /para (?:el |la )?(?:comprador|compradora|inquilino)/.exec(s);
    const title = cut(orig, s, [[0, m.index + m[0].length], found.span, dt?.span ?? null, buyer ? [buyer.index, buyer.index + buyer[0].length] : null]);
    if (!title) return { reply: "¿Cuál es la tarea? Ej.: “agrega tarea enviar contrato en Los Pinos mañana”.", changed: false };
    const dueDate = dt?.date ?? addDays(TODAY, 3);
    addTask({ dealId: found.deal!.id, title: cap(title), assignee: buyer ? "buyer" : "agent", dueDate }, source);
    return { reply: `✅ Tarea “${cap(title)}” creada en ${shortAddress(found.deal!)} para ${fmtShort(dueDate)}${dt ? "" : " (fecha por defecto)"}.`, changed: true };
  }

  // nuevo evento
  m = /(?:agrega|anade|crea|nuevo|nueva|programa|agenda|agendar)\w*\s+(?:un\s+|una\s+)?(?:evento|cita)?\s*/.exec(s);
  if (m && /evento|cita|visita|tasacion|inspeccion|cierre|firma|reunion/.test(s)) {
    const miss = needDeal("¿Para qué venta es el evento?");
    if (miss) return miss;
    const dt = parseDate(s);
    if (!dt) return { reply: "¿Para qué fecha? Ej.: “12 oct”, “mañana”, “viernes” o “2026-10-12”.", changed: false };
    const name = cut(orig, s, [[0, m.index + m[0].length], found.span, dt.span]) || "Evento";
    const type: EventType = /oferta/.test(s) ? "offer" : /inspeccion/.test(s) ? "inspection" : /tasacion/.test(s) ? "appraisal" : /cierre|firma/.test(s) ? "closing" : "custom";
    addEvent({ dealId: found.deal!.id, name: cap(name), date: dt.date, type }, source);
    return { reply: `📅 Agendé “${cap(name)}” en ${shortAddress(found.deal!)} para el ${fmtShort(dt.date)} (${EVENT_TYPES.find((x) => x.key === type)!.label}).`, changed: true };
  }

  return { reply: "No entendí eso 🤔. Escribe “ayuda” para ver lo que puedo hacer.", changed: false };
}
