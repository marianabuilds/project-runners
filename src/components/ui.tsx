import Link from "next/link";
import clsx from "clsx";
import { Check, ChevronRight } from "lucide-react";
import { STAGES, type Buyer, type DealKind, type Stage, type TaskStatus } from "@/lib/data";
import { stageIndex, stageLabel } from "@/lib/format";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={clsx("rounded-2xl bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] ring-1 ring-slate-200/70", className)}>{children}</section>;
}

export function CardHeader({
  title,
  count,
  href,
  action,
  subtitle,
}: {
  title: string;
  count?: number;
  href?: string;
  action?: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          {title}
          {count !== undefined && <span className="ml-1.5 text-sm font-normal text-slate-500">({count})</span>}
        </h2>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="flex shrink-0 items-center gap-0.5 text-sm font-medium text-blue-700 hover:text-blue-800">
          Ver todo <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
      {action}
    </div>
  );
}

const tileTones = {
  orange: "bg-orange-50 text-orange-600 ring-orange-100",
  violet: "bg-violet-50 text-violet-600 ring-violet-100",
  blue: "bg-blue-50 text-blue-600 ring-blue-100",
  green: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  slate: "bg-slate-50 text-slate-600 ring-slate-200",
  red: "bg-red-50 text-red-600 ring-red-100",
} as const;
export type Tone = keyof typeof tileTones;

export function IconTile({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-xl ring-1", tileTones[tone], className)} aria-hidden>
      {children}
    </div>
  );
}

export const stageTone: Record<Stage, string> = {
  prospect: "bg-slate-100 text-slate-700",
  offer: "bg-violet-100 text-violet-800",
  under_contract: "bg-blue-100 text-blue-800",
  due_diligence: "bg-amber-100 text-amber-800",
  closing: "bg-emerald-100 text-emerald-800",
};
export const stageColor: Record<Stage, string> = {
  prospect: "#94a3b8",
  offer: "#8b5cf6",
  under_contract: "#3b82f6",
  due_diligence: "#f59e0b",
  closing: "#10b981",
};

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", stageTone[stage])}>
      {stageLabel(stage)}
    </span>
  );
}

const statusStyles: Record<TaskStatus, { label: string; cls: string }> = {
  pending: { label: "Pendiente", cls: "bg-slate-100 text-slate-700" },
  in_progress: { label: "En curso", cls: "bg-blue-50 text-blue-700" },
  completed: { label: "Completada", cls: "bg-emerald-50 text-emerald-700" },
};

export function StatusPill({ status }: { status: TaskStatus }) {
  const s = statusStyles[status];
  return <span className={clsx("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", s.cls)}>{s.label}</span>;
}

export function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={clsx(
        "grid shrink-0 place-items-center rounded-full bg-slate-100 font-medium text-slate-700",
        size === "sm" && "h-8 w-8 text-xs",
        size === "md" && "h-10 w-10 text-sm",
        size === "lg" && "h-12 w-12 text-base",
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}

export function StageTracker({ stage }: { stage: Stage }) {
  const current = stageIndex(stage);
  return (
    <ol className="flex w-full items-start" aria-label="Etapa">
      {STAGES.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.key} className="relative flex flex-1 flex-col items-center text-center" aria-current={active ? "step" : undefined}>
            {i > 0 && (
              <span
                className={clsx("absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2", i <= current ? "bg-blue-600" : "bg-slate-200")}
                aria-hidden
              />
            )}
            <span
              className={clsx(
                "relative z-10 grid h-8 w-8 place-items-center rounded-full text-sm font-semibold",
                done && "bg-blue-600 text-white",
                active && "bg-white text-blue-700 ring-2 ring-blue-600",
                !done && !active && "bg-white text-slate-400 ring-2 ring-slate-200",
              )}
            >
              {done ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
            </span>
            <span className={clsx("mt-2 px-1 text-[11px] leading-tight sm:text-xs", active ? "font-semibold text-slate-900" : "text-slate-500")}>
              {s.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function Donut({ segments, size = 168 }: { segments: { value: number; color: string }[]; size?: number }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const r = 15.9155; // circumference = 100
  let offset = 25;
  return (
    <svg viewBox="0 0 42 42" width={size} height={size} role="img" aria-label="Pipeline por etapa">
      <circle cx="21" cy="21" r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
      {segments.map((s, i) => {
        const pct = (s.value / total) * 100;
        const el = (
          <circle
            key={i}
            cx="21"
            cy="21"
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="7"
            strokeDasharray={`${pct} ${100 - pct}`}
            strokeDashoffset={offset}
          />
        );
        offset -= pct;
        return el;
      })}
    </svg>
  );
}

export function DateTile({ day, month }: { day: number; month: string }) {
  return (
    <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-slate-50 ring-1 ring-slate-200" aria-hidden>
      <span className="absolute -top-1 left-3 h-2 w-0.5 rounded bg-slate-300" />
      <span className="absolute -top-1 right-3 h-2 w-0.5 rounded bg-slate-300" />
      <div className="text-center leading-none">
        <div className="text-base font-semibold text-slate-900">{day}</div>
        <div className="mt-0.5 text-[10px] uppercase text-slate-500">{month}</div>
      </div>
    </div>
  );
}

export function KindBadge({ kind }: { kind: DealKind }) {
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ring-1",
        kind === "venta" ? "bg-blue-50 text-blue-700 ring-blue-200" : "bg-violet-50 text-violet-700 ring-violet-200",
      )}
    >
      {kind === "venta" ? "Venta" : "Alquiler"}
    </span>
  );
}

export function AvatarStack({ buyers, size = "md" }: { buyers: Buyer[]; size?: "sm" | "md" }) {
  const shown = buyers.slice(0, 3);
  const extra = buyers.length - shown.length;
  const dim = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";
  return (
    <div className="flex shrink-0 -space-x-2" aria-label={`${buyers.length} personas`}>
      {shown.map((b) => (
        <div key={b.id} className={clsx("grid place-items-center rounded-full bg-slate-100 font-medium text-slate-700 ring-2 ring-white", dim)} aria-hidden>
          {b.initials}
        </div>
      ))}
      {extra > 0 && (
        <div className={clsx("grid place-items-center rounded-full bg-slate-200 font-medium text-slate-600 ring-2 ring-white", dim)} aria-hidden>
          +{extra}
        </div>
      )}
    </div>
  );
}
