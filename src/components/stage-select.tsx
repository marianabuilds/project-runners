"use client";

import { useState } from "react";
import clsx from "clsx";
import { STAGES, type Stage } from "@/lib/data";
import { StageTracker } from "./ui";

export function StageControl({ initial }: { initial: Stage }) {
  const [stage, setStage] = useState(initial);
  return (
    <div>
      <div className="border-b border-miel-100 px-5 py-5 sm:px-7">
        <h2 className="text-2xl text-cafe-900">¿En qué etapa está?</h2>
        <p className="mt-1 text-base text-cafe-700">Toca la etapa para cambiarla.</p>
      </div>
      <div className="grid grid-cols-2 gap-3 px-5 py-5 sm:grid-cols-5 sm:px-7" role="radiogroup" aria-label="Etapa de la venta">
        {STAGES.map((s) => {
          const active = s.key === stage;
          return (
            <button
              key={s.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setStage(s.key)}
              className={clsx(
                "min-h-[56px] rounded-2xl px-3 text-lg font-semibold transition-colors",
                active ? "bg-cafe-600 text-white" : "bg-miel-100 text-cafe-900 hover:bg-miel-200",
              )}
            >
              {s.label}
            </button>
          );
        })}
      </div>
      <div className="border-t border-miel-100 px-3 py-6 sm:px-7">
        <StageTracker stage={stage} />
      </div>
    </div>
  );
}
