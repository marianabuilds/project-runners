import { TODAY, type Deal, type Stage, STAGES } from "./data";

// Peru format: S/ 250,000.00
export const pen = (n: number, decimals = 2) =>
  "S/ " + n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const penShort = (n: number) =>
  n >= 1_000_000 ? `S/ ${(n / 1_000_000).toFixed(2)} mill.` : `S/ ${Math.round(n / 1000)} mil`;

const parse = (iso: string) => new Date(iso.length === 10 ? iso + "T12:00:00" : iso);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// "lunes 13 de octubre"
export const fmtDate = (iso: string) =>
  cap(parse(iso).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" }));

// "13 de octubre"
export const fmtShort = (iso: string) => parse(iso).toLocaleDateString("es-PE", { day: "numeric", month: "long" });

export const dayNum = (iso: string) => parse(iso).getDate();
export const monthAbbr = (iso: string) =>
  parse(iso).toLocaleDateString("es-PE", { month: "short" }).replace(".", "");
export const monthName = (iso: string) =>
  cap(parse(iso).toLocaleDateString("es-PE", { month: "long", year: "numeric" }));

export const daysFromToday = (iso: string) =>
  Math.round((parse(iso).getTime() - parse(TODAY).getTime()) / 86_400_000);

export const relativeDue = (iso: string) => {
  const d = daysFromToday(iso);
  if (d === 0) return "Hoy";
  if (d === 1) return "Mañana";
  if (d === -1) return "Ayer";
  if (d < 0) return `Atrasada ${-d} días`;
  if (d <= 7) return `En ${d} días`;
  return fmtShort(iso);
};

export const stageLabel = (s: Stage) => STAGES.find((x) => x.key === s)!.label;
export const stageIndex = (s: Stage) => STAGES.findIndex((x) => x.key === s);

export const shortAddress = (d: Deal) => `${d.address.street} ${d.address.number}`;
export const fullAddress = (d: Deal) =>
  `${d.address.street} ${d.address.number}, ${d.address.district}, ${d.address.province}`;
