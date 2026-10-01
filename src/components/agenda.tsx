"use client";

import Link from "next/link";
import clsx from "clsx";
import { AlertCircle, CheckCircle2, ClipboardCheck, FileText, Home, KeyRound, Search, UserRound } from "lucide-react";
import { dotClass, type CalItem } from "@/lib/calendar";

const eventIcon = { offer: FileText, inspection: Search, appraisal: Home, closing: KeyRound, custom: ClipboardCheck };

export function itemVisual(i: CalItem) {
  if (i.kind === "event") return { Icon: eventIcon[i.eventType ?? "custom"], box: "bg-navy text-white" };
  if (i.done) return { Icon: CheckCircle2, box: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" };
  if (i.overdue) return { Icon: AlertCircle, box: "bg-red-50 dark:bg-red-500/15 text-red-600 dark:text-red-400" };
  if (i.assignee === "buyer") return { Icon: UserRound, box: "bg-accent text-on-accent" };
  return { Icon: ClipboardCheck, box: "bg-sky text-ink" };
}

const badgeStyle = {
  hito: "bg-navy text-white",
  tarea: "bg-[#7FA8C9]/30 text-ink",
  comprador: "bg-accent text-on-accent ring-1 ring-navy/20",
  vendedor: "bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-200 dark:ring-emerald-500/30",
  agente: "bg-navy-50 text-ink ring-1 ring-navy-100",
  atrasada: "bg-red-50 dark:bg-red-500/15 text-red-700 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-500/30",
} as const;
const badgeLabel = { hito: "Hito", tarea: "Tu tarea", comprador: "Comprador", vendedor: "Vendedor", agente: "Agente", atrasada: "Atrasada" } as const;
export type BadgeKind = keyof typeof badgeStyle;

export function Badge({ kind }: { kind: BadgeKind }) {
  return (
    <span className={clsx("inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold", badgeStyle[kind])}>
      {badgeLabel[kind]}
    </span>
  );
}

/** Owner badge relative to the viewer: "Tu tarea" when it's mine, otherwise who owns it. */
export const ownerBadge = (assignee: "agent" | "buyer" | "seller", role: "agent" | "buyer" | "seller"): BadgeKind =>
  assignee === role ? "tarea" : assignee === "buyer" ? "comprador" : assignee === "seller" ? "vendedor" : "agente";

export function ItemBadges({ item }: { item: CalItem }) {
  return (
    <span className="flex flex-wrap items-center justify-end gap-1">
      {item.overdue && <Badge kind="atrasada" />}
      {item.kind === "event" ? <Badge kind="hito" /> : <Badge kind="tarea" />}
    </span>
  );
}

export function AgendaRow({ item, right }: { item: CalItem; right?: React.ReactNode }) {
  const { Icon, box } = itemVisual(item);
  return (
    <Link
      href={`/deals/${item.dealId}`}
      className="flex items-center gap-3 rounded-2xl bg-surface/80 p-3 ring-1 ring-navy/5 transition hover:bg-surface hover:shadow-md"
    >
      <span className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-xl", box)} aria-hidden>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={clsx("truncate font-medium text-ink", item.done && "text-ink-muted line-through")}>{item.title}</p>
        <p className="truncate text-sm text-ink-muted">{item.sub}</p>
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
