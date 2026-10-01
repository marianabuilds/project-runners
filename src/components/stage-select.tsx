"use client";

import { useState } from "react";
import { STAGES, type Stage } from "@/lib/data";
import { StageTracker } from "./ui";

export function StageControl({ initial }: { initial: Stage }) {
  const [stage, setStage] = useState(initial);
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy-100 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold text-navy">Progreso del negocio</h2>
        <label className="flex items-center gap-2 text-sm text-navy-200">
          Etapa
          <select
            value={stage}
            onChange={(e) => setStage(e.target.value as Stage)}
            className="rounded-lg border border-navy-100 bg-white px-3 py-1.5 text-sm font-medium text-navy"
          >
            {STAGES.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="px-3 py-6 sm:px-6">
        <StageTracker stage={stage} />
      </div>
    </div>
  );
}
