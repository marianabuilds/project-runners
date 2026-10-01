import clsx from "clsx";

export function ProgressRing({ value, size = 96, label }: { value: number; size?: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 42 42" width={size} height={size} role="img" aria-label={label ?? `${Math.round(pct)}%`}>
        <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#E8F2F9" strokeWidth="5" />
        <circle
          cx="21"
          cy="21"
          r="15.9155"
          fill="none"
          stroke="#303841"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${pct} ${100 - pct}`}
          strokeDashoffset="25"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-lg font-semibold tabular-nums text-navy">{Math.round(pct)}%</span>
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
          <span className="text-xs font-semibold tabular-nums text-navy">{d.value || ""}</span>
          <div
            className={clsx("w-full rounded-t-lg", d.highlight ? "bg-navy" : "bg-sky")}
            style={{ height: `${Math.max((d.value / max) * 100, d.value ? 8 : 3)}%`, minHeight: 4 }}
          />
          <span className={clsx("text-[11px] font-medium uppercase", d.highlight ? "text-navy" : "text-navy-200")}>{d.label}</span>
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
