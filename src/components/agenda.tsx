import Link from "next/link";
import clsx from "clsx";
import { AlertCircle, CheckCircle2, ClipboardCheck, FileText, Home, KeyRound, Search, UserRound } from "lucide-react";
import { dotClass, type CalItem } from "@/lib/calendar";

const eventIcon = { offer: FileText, inspection: Search, appraisal: Home, closing: KeyRound, custom: ClipboardCheck };

export function itemVisual(i: CalItem) {
  if (i.kind === "event") return { Icon: eventIcon[i.eventType ?? "custom"], box: "bg-navy text-white" };
  if (i.done) return { Icon: CheckCircle2, box: "bg-emerald-50 text-emerald-600" };
  if (i.overdue) return { Icon: AlertCircle, box: "bg-red-50 text-red-600" };
  if (i.assignee === "buyer") return { Icon: UserRound, box: "bg-accent text-navy" };
  return { Icon: ClipboardCheck, box: "bg-sky text-navy" };
}

const badgeStyle = {
  hito: "bg-navy text-white",
  tarea: "bg-[#7FA8C9]/30 text-navy",
  comprador: "bg-accent text-navy ring-1 ring-navy/20",
  atrasada: "bg-red-50 text-red-700 ring-1 ring-red-200",
} as const;
const badgeLabel = { hito: "Hito", tarea: "Tu tarea", comprador: "Comprador", atrasada: "Atrasada" } as const;

export function Badge({ kind }: { kind: keyof typeof badgeStyle }) {
  return (
    <span className={clsx("inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold", badgeStyle[kind])}>
      {badgeLabel[kind]}
    </span>
  );
}

export function ItemBadges({ item }: { item: CalItem }) {
  return (
    <span className="flex flex-wrap items-center justify-end gap-1">
      {item.overdue && <Badge kind="atrasada" />}
      {item.kind === "event" ? <Badge kind="hito" /> : item.assignee === "buyer" ? <Badge kind="comprador" /> : <Badge kind="tarea" />}
    </span>
  );
}

export function AgendaRow({ item, right }: { item: CalItem; right?: React.ReactNode }) {
  const { Icon, box } = itemVisual(item);
  return (
    <Link
      href={`/deals/${item.dealId}`}
      className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 ring-1 ring-navy/5 transition hover:bg-white hover:shadow-md"
    >
      <span className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-xl", box)} aria-hidden>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={clsx("truncate font-medium text-navy", item.done && "text-navy-200 line-through")}>{item.title}</p>
        <p className="truncate text-sm text-navy-200">{item.sub}</p>
      </div>
      {right ?? <ItemBadges item={item} />}
    </Link>
  );
}

export function Dots({ items, max = 4 }: { items: CalItem[]; max?: number }) {
  return (
    <span className="flex h-2 items-center justify-center gap-0.5" aria-hidden>
      {items.slice(0, max).map((i) => (
        <span key={i.id} className={clsx("h-1.5 w-1.5 rounded-full", dotClass(i))} />
      ))}
    </span>
  );
}

export function Legend() {
  const l = [
    ["bg-navy", "Hito"],
    ["bg-[#7FA8C9]", "Tu tarea"],
    ["bg-accent ring-1 ring-navy/30", "Comprador"],
    ["bg-red-500", "Atrasada"],
  ];
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-navy-200">
      {l.map(([c, t]) => (
        <li key={t} className="flex items-center gap-1.5">
          <span className={clsx("h-2 w-2 rounded-full", c)} /> {t}
        </li>
      ))}
    </ul>
  );
}
