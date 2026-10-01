import { dealById, tasks, timeline, TODAY, type Assignee, type EventType } from "./data";
import { shortAddress } from "./format";

export type CalItem = {
  id: string;
  date: string;
  title: string;
  sub: string;
  dealId: string;
  kind: "event" | "task";
  eventType?: EventType;
  assignee?: Assignee;
  done: boolean;
  overdue: boolean;
};

const utc = (iso: string) => new Date(iso + "T12:00:00Z");
const toIso = (d: Date) => d.toISOString().slice(0, 10);

export const addDays = (iso: string, n: number) => {
  const d = utc(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return toIso(d);
};

// Monday-first index, 0..6
export const weekdayIndex = (iso: string) => (utc(iso).getUTCDay() + 6) % 7;

export const weekOf = (iso: string) => {
  const monday = addDays(iso, -weekdayIndex(iso));
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
};

export const monthKey = (iso: string) => iso.slice(0, 7);

export const shiftMonth = (ym: string, delta: number) => {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1, 12));
  return toIso(d).slice(0, 7);
};

// 6 full weeks, Monday-first, covering the month
export const monthGrid = (ym: string) => {
  const first = `${ym}-01`;
  const start = addDays(first, -weekdayIndex(first));
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
};

export const monthLabel = (ym: string) => {
  const s = utc(`${ym}-01`).toLocaleDateString("es-PE", { month: "long", year: "numeric", timeZone: "UTC" });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const WEEKDAYS_SHORT = ["L", "M", "X", "J", "V", "S", "D"];
export const WEEKDAYS_LONG = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export const allItems = (): CalItem[] => {
  const ev: CalItem[] = timeline.map((e) => {
    const d = dealById(e.dealId)!;
    return {
      id: e.id,
      date: e.date,
      title: e.name,
      sub: shortAddress(d),
      dealId: e.dealId,
      kind: "event",
      eventType: e.type,
      done: e.date < TODAY,
      overdue: false,
    };
  });
  const ts: CalItem[] = tasks.map((t) => {
    const d = dealById(t.dealId)!;
    const done = t.status === "completed";
    return {
      id: t.id,
      date: t.dueDate,
      title: t.title,
      sub: `${shortAddress(d)} · ${t.assignee === "buyer" ? d.buyer.name : "Tú"}`,
      dealId: t.dealId,
      kind: "task",
      assignee: t.assignee,
      done,
      overdue: !done && t.dueDate < TODAY,
    };
  });
  return [...ev, ...ts];
};

export const itemsOn = (date: string) =>
  allItems()
    .filter((i) => i.date === date)
    .sort((a, b) => Number(a.kind === "task") - Number(b.kind === "task"));

export const groupByDate = (items: CalItem[]) => {
  const m = new Map<string, CalItem[]>();
  for (const i of items) m.set(i.date, [...(m.get(i.date) ?? []), i]);
  return m;
};

export const dotClass = (i: CalItem) =>
  i.overdue ? "bg-red-500" : i.kind === "event" ? "bg-navy" : i.assignee === "buyer" ? "bg-accent ring-1 ring-navy/30" : "bg-[#7FA8C9]";
