import { TODAY, type Deal, type Stage, STAGES } from "./data";

// Peru format: S/ 250,000.00
export const pen = (n: number, decimals = 2) =>
  "S/ " + n.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export const penShort = (n: number) =>
  n >= 1_000_000 ? `S/ ${(n / 1_000_000).toFixed(2)}M` : `S/ ${Math.round(n / 1000)}K`;

const parse = (iso: string) => new Date(iso.length === 10 ? iso + "T12:00:00" : iso);

export const fmtDate = (iso: string) =>
  parse(iso).toLocaleDateString("es-PE", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export const fmtLong = (iso: string) => {
  const s = parse(iso).toLocaleDateString("es-PE", { weekday: "long", day: "numeric", month: "long" });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const fmtShort =(iso: string) => parse(iso).toLocaleDateString("es-PE", { day: "numeric", month: "short" });

export const dayNum = (iso: string) => parse(iso).getDate();
export const monthAbbr = (iso: string) => parse(iso).toLocaleDateString("es-PE", { month: "short" });

export const daysFromToday = (iso: string) =>
  Math.round((parse(iso).getTime() - parse(TODAY).getTime()) / 86_400_000);

export const relativeDue = (iso: string) => {
  const d = daysFromToday(iso);
  if (d === 0) return "Hoy";
  if (d === 1) return "Mañana";
  if (d === -1) return "Ayer";
  if (d < 0) return `${-d} ${-d === 1 ? "día" : "días"} atrasada`;
  if (d <= 7) return `En ${d} ${d === 1 ? "día" : "días"}`;
  return fmtShort(iso);
};

export const stageLabel = (s: Stage) => STAGES.find((x) => x.key === s)!.label;
export const stageIndex = (s: Stage) => STAGES.findIndex((x) => x.key === s);

export const shortAddress = (d: Deal) => `${d.address.street} ${d.address.number}`;
export const fullAddress = (d: Deal) =>
  `${d.address.street} ${d.address.number}, ${d.address.district}, ${d.address.province}, ${d.address.department}`;
