import Link from "next/link";
import clsx from "clsx";
import { Check, ChevronRight } from "lucide-react";
import { STAGES, type Buyer, type DealKind, type Stage, type TaskStatus } from "@/lib/data";
import { stageIndex, stageLabel } from "@/lib/format";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={clsx("rounded-3xl bg-white ring-1 ring-miel-200", className)}>{children}</section>;
}

export function CardHeader({
  title,
  count,
  href,
  linkLabel = "Ver todo",
  action,
  subtitle,
}: {
  title: string;
  count?: number;
  href?: string;
  linkLabel?: string;
  action?: React.ReactNode;
  subtitle?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-miel-100 px-5 py-5 sm:px-7">
      <div>
        <h2 className="text-2xl text-cafe-900">
          {title}
          {count !== undefined && <span className="ml-2 font-body text-lg text-cafe-500">({count})</span>}
        </h2>
        {subtitle && <p className="mt-1 text-base text-cafe-700">{subtitle}</p>}
      </div>
      {href && (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-base font-semibold text-cafe-600 underline-offset-4 hover:bg-miel-100 hover:underline"
        >
          {linkLabel} <ChevronRight className="h-5 w-5" aria-hidden />
        </Link>
      )}
      {action}
    </div>
  );
}

/** Big, obvious call to action. */
export function Button({
  href,
  children,
  variant = "primary",
  className,
  ...props
}: {
  href?: string;
  variant?: "primary" | "secondary";
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const cls = clsx(
    "inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl px-6 text-lg font-semibold transition-colors",
    variant === "primary" && "bg-cafe-600 text-white hover:bg-cafe-700",
    variant === "secondary" && "bg-miel-300 text-cafe-900 hover:bg-miel-400",
    className,
  );
  if (href)
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  return (
    <button type="button" className={cls} {...props}>
      {children}
    </button>
  );
}

export function IconTile({ children, className, urgent }: { children: React.ReactNode; className?: string; urgent?: boolean }) {
  return (
    <div
      className={clsx(
        "grid h-12 w-12 shrink-0 place-items-center rounded-2xl",
        urgent ? "bg-red-50 text-red-700" : "bg-miel-100 text-cafe-600",
        className,
      )}
      aria-hidden
    >
      {children}
    </div>
  );
}

export function StageBadge({ stage }: { stage: Stage }) {
  const late = stageIndex(stage) >= 3;
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold",
        late ? "bg-cafe-600 text-white" : "bg-miel-300 text-cafe-900",
      )}
    >
      {stageLabel(stage)}
    </span>
  );
}

const statusStyles: Record<TaskStatus, { label: string; cls: string }> = {
  pending: { label: "Por hacer", cls: "bg-miel-100 text-cafe-800" },
  in_progress: { label: "En camino", cls: "bg-miel-300 text-cafe-900" },
  completed: { label: "Hecho", cls: "bg-emerald-50 text-emerald-800" },
};

export function StatusPill({ status }: { status: TaskStatus }) {
  const s = statusStyles[status];
  return <span className={clsx("inline-flex rounded-full px-3 py-1 text-sm font-medium", s.cls)}>{s.label}</span>;
}

export function Avatar({ initials, size = "md" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={clsx(
        "grid shrink-0 place-items-center rounded-full bg-miel-300 font-semibold text-cafe-900",
        size === "sm" && "h-10 w-10 text-sm",
        size === "md" && "h-12 w-12 text-base",
        size === "lg" && "h-16 w-16 text-xl",
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
    <ol className="flex w-full items-start" aria-label="Etapa de la venta">
      {STAGES.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s.key} className="relative flex flex-1 flex-col items-center text-center" aria-current={active ? "step" : undefined}>
            {i > 0 && (
              <span
                className={clsx("absolute right-1/2 top-5 h-1 w-full -translate-y-1/2", i <= current ? "bg-cafe-600" : "bg-miel-200")}
                aria-hidden
              />
            )}
            <span
              className={clsx(
                "relative z-10 grid h-10 w-10 place-items-center rounded-full text-base font-bold",
                done && "bg-cafe-600 text-white",
                active && "bg-miel-300 text-cafe-900 ring-4 ring-cafe-600",
                !done && !active && "bg-white text-cafe-300 ring-2 ring-miel-200",
              )}
            >
              {done ? <Check className="h-5 w-5" strokeWidth={3} aria-hidden /> : i + 1}
            </span>
            <span className={clsx("mt-3 px-1 text-sm leading-tight sm:text-base", active ? "font-bold text-cafe-900" : "text-cafe-700")}>
              {s.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function DateTile({ day, month }: { day: number; month: string }) {
  return (
    <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-miel-300 text-cafe-900" aria-hidden>
      <div className="text-center leading-none">
        <div className="font-heading text-2xl">{day}</div>
        <div className="mt-1 text-xs font-semibold uppercase">{month}</div>
      </div>
    </div>
  );
}

export function KindBadge({ kind }: { kind: DealKind }) {
  return (
    <span
      className={clsx(
        "inline-flex shrink-0 items-center rounded-full px-3 py-1 text-sm font-bold uppercase tracking-wide ring-2",
        kind === "venta" ? "bg-white text-cafe-700 ring-cafe-600" : "bg-cafe-900 text-miel-300 ring-cafe-900",
      )}
    >
      {kind === "venta" ? "Venta" : "Alquiler"}
    </span>
  );
}

export function AvatarStack({ buyers }: { buyers: Buyer[] }) {
  const shown = buyers.slice(0, 3);
  const extra = buyers.length - shown.length;
  return (
    <div className="flex shrink-0 -space-x-3" aria-label={`${buyers.length} ${buyers.length === 1 ? "persona" : "personas"}`}>
      {shown.map((b) => (
        <div key={b.id} className="grid h-12 w-12 place-items-center rounded-full bg-miel-300 text-base font-semibold text-cafe-900 ring-2 ring-white" aria-hidden>
          {b.initials}
        </div>
      ))}
      {extra > 0 && (
        <div className="grid h-12 w-12 place-items-center rounded-full bg-cafe-600 text-base font-semibold text-white ring-2 ring-white" aria-hidden>
          +{extra}
        </div>
      )}
    </div>
  );
}
