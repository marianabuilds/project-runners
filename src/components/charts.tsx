import clsx from "clsx";

export function ProgressRing({ value, size = 96, label }: { value: number; size?: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 42 42" width={size} height={size} role="img" aria-label={label ?? `${Math.round(pct)}%`}>
        <circle cx="21" cy="21" r="15.9155" fill="none" style={{ stroke: "rgb(var(--sky-100))" }} strokeWidth="5" />
        <circle
          cx="21"
          cy="21"
          r="15.9155"
          fill="none"
          style={{ stroke: "rgb(var(--ink))" }}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${pct} ${100 - pct}`}
          strokeDashoffset="25"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-lg font-semibold tabular-nums text-ink">{Math.round(pct)}%</span>
    </div>
  );
}

export function Sparkline({ points, className }: { points: number[]; className?: string }) {
  const max = Math.max(...points, 1);
  const w = 100;
  const h = 28;
  const step = w / Math.max(points.length - 1, 1);
  const d = points.map((p, i) => `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(h - (p / max) * (h - 4) - 2).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={clsx("h-7 w-full", className)} aria-hidden>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill="currentColor" opacity="0.12" />
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export type BarDatum = { label: string; value: number; highlight?: boolean };

export function BarChart({ data, height = 120, ariaLabel }: { data: BarDatum[]; height?: number; ariaLabel: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2" style={{ height }} role="img" aria-label={ariaLabel}>
      {data.map((d) => (
        <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
          <span className="text-xs font-semibold tabular-nums text-ink">{d.value || ""}</span>
          <div
            className={clsx("w-full rounded-t-lg", d.highlight ? "bg-navy" : "bg-sky")}
            style={{ height: `${Math.max((d.value / max) * 100, d.value ? 8 : 3)}%`, minHeight: 4 }}
          />
          <span className={clsx("text-[11px] font-medium uppercase", d.highlight ? "text-ink" : "text-ink-muted")}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function StackedBar({ segments }: { segments: { label: string; value: number; color: string }[] }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-sky-100 ring-1 ring-navy/10" role="img" aria-label="Negocios por etapa">
      {segments.filter((s) => s.value).map((s) => (
        <div key={s.label} title={`${s.label}: ${s.value}`} style={{ width: `${(s.value / total) * 100}%`, background: s.color }} />
      ))}
    </div>
  );
}

/** Calendar-page icon with the days left until a date. */
export function CierreCountdown({ days, month, size = "lg" }: { days: number; month: string; size?: "sm" | "lg" }) {
  return (
    <div className={clsx("shrink-0 overflow-hidden rounded-2xl bg-surface text-center shadow-sm ring-1 ring-navy-100", size === "lg" ? "w-28" : "w-14 rounded-xl")} role="img" aria-label={`${days} días para el cierre`}>
      <div className={clsx("bg-navy font-bold uppercase tracking-wider text-white", size === "lg" ? "py-1.5 text-xs" : "py-0.5 text-[9px]")}>{month}</div>
      <div className={size === "lg" ? "py-3" : "py-1.5"}>
        <p className={clsx("font-bold tabular-nums leading-none text-ink", size === "lg" ? "text-5xl" : "text-xl")}>{days}</p>
        <p className={clsx("font-semibold uppercase text-ink-muted", size === "lg" ? "mt-1 text-[11px]" : "text-[8px]")}>días</p>
      </div>
    </div>
  );
}
