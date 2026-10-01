"use client";

import { STAGES, type Stage } from "@/lib/data";
import { useStore } from "@/lib/store";
import { StageTracker } from "./ui";

export function StageControl({ dealId }: { dealId: string }) {
  const { stageOf, setStage: save, role } = useStore();
  const stage = stageOf(dealId);
  const setStage = (s: Stage) => save(dealId, s);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold text-ink">Progreso del negocio</h2>
        {role === "agent" ? (
        <label className="flex items-center gap-2 text-sm text-ink-muted">
          Etapa
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as Stage)}
            className="rounded-lg border border-navy-100 bg-surface px-3 py-1.5 text-sm font-medium text-ink"
          >
            {STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        ) : (
          <p className="text-sm text-ink-muted">Actualizado por tu agente</p>
        )}
      </div>
      <div className="px-3 py-6 sm:px-6">
        <StageTracker stage={stage} />
      </div>
    </div>
  );
}
