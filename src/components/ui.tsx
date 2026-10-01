import Link from "next/link";
import clsx from "clsx";
import { Banknote, CalendarPlus, Check, ChevronRight, Eye, FilePen, FileSearch, PenLine, Send, Upload, type LucideIcon } from "lucide-react";
import { STAGES, type Stage, type TaskAction, type TaskStatus } from "@/lib/data";
import { stageIndex, stageLabel } from "@/lib/format";

export type CardTone = "white" | "sky" | "navy" | "sun" | "paper";

const cardTones: Record<CardTone, { card: string; head: string; title: string; muted: string; link: string }> = {
  white: {
    card: "bg-white ring-navy-100/70 shadow-[0_2px_12px_-4px_rgba(48,56,65,0.10)]",
    head: "border-navy-100",
    title: "text-navy",
    muted: "text-navy-200",
    link: "text-navy hover:text-navy-200",
  },
  sky: {
    card: "bg-gradient-to-br from-sky via-sky to-sky-100 ring-sky shadow-[0_8px_24px_-12px_rgba(48,56,65,0.25)]",
    head: "border-navy/10",
    title: "text-navy",
    muted: "text-navy-600",
    link: "text-navy hover:text-navy-600",
  },
  navy: {
    card: "bg-gradient-to-br from-navy via-navy to-[#1f252c] text-white ring-navy shadow-[0_12px_32px_-12px_rgba(48,56,65,0.6)]",
    head: "border-white/10",
    title: "text-white",
    muted: "text-white/60",
    link: "text-accent hover:text-white",
  },
  sun: {
    card: "bg-gradient-to-br from-accent/30 via-accent/10 to-white ring-accent/60 shadow-[0_8px_24px_-12px_rgba(180,160,0,0.35)]",
    head: "border-navy/10",
    title: "text-navy",
    muted: "text-navy-600",
    link: "text-navy hover:text-navy-600",
  },
  paper: {
    card: "bg-paper ring-navy-100",
    head: "border-navy-100",
    title: "text-navy",
    muted: "text-navy-200",
    link: "text-navy hover:text-navy-200",
  },
};

export function Card({ className, children, tone = "white" }: { className?: string; children: React.ReactNode; tone?: CardTone }) {
  return <section className={clsx("relative overflow-hidden rounded-3xl ring-1", cardTones[tone].card, className)}>{children}</section>;
}

export function CardHeader({
  title,
  count,
  href,
  action,
  subtitle,
  tone = "white",
  icon,
}: {
  title: string;
  count?: number;
  href?: string;
  action?: React.ReactNode;
  subtitle?: string;
  tone?: CardTone;
  icon?: React.ReactNode;
}) {
  const t = cardTones[tone];
  return (
    <div className={clsx("flex items-center justify-between gap-4 border-b px-5 py-4 sm:px-6", t.head)}>
      <div className="flex min-w-0 items-center gap-3">
        {icon}
        <div className="min-w-0">
          <h2 className={clsx("text-lg font-semibold tracking-tight", t.title)}>
            {title}
            {count !== undefined && <span className={clsx("ml-1.5 text-sm font-normal", t.muted)}>({count})</span>}
          </h2>
          {subtitle && <p className={clsx("mt-0.5 text-sm", t.muted)}>{subtitle}</p>}
        </div>
      </div>
      {href && (
        <Link href={href} className={clsx("flex shrink-0 items-center gap-0.5 text-sm font-medium", t.link)}>
          Ver todo <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      )}
      {action}
    </div>
  );
}

const tileTones = {
  orange: "bg-accent text-navy ring-accent/20",
  violet: "bg-sky-100 text-navy ring-sky-100",
  blue: "bg-sky text-navy ring-sky-100",
  green: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  slate: "bg-paper text-navy-200 ring-navy-100",
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
  prospect: "bg-sky-100 text-navy",
  offer: "bg-sky text-navy",
  under_contract: "bg-sky-100 text-navy",
  due_diligence: "bg-accent text-navy",
  closing: "bg-sky-100 text-navy",
};
export const stageColor: Record<Stage, string> = {
  prospect: "#303841",
  offer: "#D6E6F2",
  under_contract: "#B8BCC8",
  due_diligence: "#FFF200",
  closing: "#303841",
};

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span className={clsx("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", stageTone[stage])}>
      {stageLabel(stage)}
    </span>
  );
}

const statusStyles: Record<TaskStatus, { label: string; cls: string }> = {
  pending: { label: "Pendiente", cls: "bg-sky-100 text-navy" },
  in_progress: { label: "En progreso", cls: "bg-sky text-navy" },
  completed: { label: "Completada", cls: "bg-emerald-50 text-emerald-700" },
};

export function StatusPill({ status }: { status: TaskStatus }) {
  const s = statusStyles[status];
  return <span className={clsx("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", s.cls)}>{s.label}</span>;
}

export function Avatar({ initials, size = "md", src }: { initials: string; size?: "sm" | "md" | "lg"; src?: string }) {
  if (src) {
    return (
      <img
        src={src}
        alt={initials}
        className={clsx(
          "shrink-0 rounded-full object-cover",
          size === "sm" && "h-8 w-8",
          size === "md" && "h-10 w-10",
          size === "lg" && "h-12 w-12",
        )}
      />
    );
  }
  return (
    <div
      className={clsx(
        "grid shrink-0 place-items-center rounded-full bg-navy-100 font-medium text-navy",
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
    <ol className="flex w-full items-start" aria-label="Deal stage">
      {STAGES.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.key} className="relative flex flex-1 flex-col items-center text-center" aria-current={active ? "step" : undefined}>
            {i > 0 && (
              <span
                className={clsx("absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2", i <= current ? "bg-navy" : "bg-navy-100")}
                aria-hidden
              />
            )}
            <span
              className={clsx(
                "relative z-10 grid h-8 w-8 place-items-center rounded-full text-sm font-semibold",
                done && "bg-navy text-white",
                active && "bg-white text-navy ring-2 ring-navy",
                !done && !active && "bg-white text-navy-200 ring-2 ring-navy-100",
              )}
            >
              {done ? <Check className="h-4 w-4" aria-hidden /> : i + 1}
            </span>
            <span className={clsx("mt-2 px-1 text-[11px] leading-tight sm:text-xs", active ? "font-semibold text-navy" : "text-navy-200")}>
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
    <svg viewBox="0 0 42 42" width={size} height={size} role="img" aria-label="Pipeline by stage">
      <circle cx="21" cy="21" r={r} fill="none" stroke="#e8f2f9" strokeWidth="7" />
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
    <div className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-paper ring-1 ring-navy-100" aria-hidden>
      <span className="absolute -top-1 left-3 h-2 w-0.5 rounded bg-navy-100" />
      <span className="absolute -top-1 right-3 h-2 w-0.5 rounded bg-navy-100" />
      <div className="text-center leading-none">
        <div className="text-base font-semibold text-navy">{day}</div>
        <div className="mt-0.5 text-[10px] uppercase text-navy-200">{month}</div>
      </div>
    </div>
  );
}

export const taskCta: Record<TaskAction, { label: string; Icon: LucideIcon }> = {
  upload: { label: "Subir", Icon: Upload },
  sign: { label: "Firmar", Icon: PenLine },
  schedule: { label: "Programar", Icon: CalendarPlus },
  review: { label: "Revisar", Icon: Eye },
  send: { label: "Enviar", Icon: Send },
  request: { label: "Solicitar", Icon: FileSearch },
  prepare: { label: "Preparar", Icon: FilePen },
  confirm: { label: "Confirmar", Icon: Check },
  transfer: { label: "Transferir", Icon: Banknote },
};
