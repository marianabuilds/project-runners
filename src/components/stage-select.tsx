"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { STAGES, type Stage } from "@/lib/data";
import { api } from "@/lib/client";
import { StageTracker } from "./ui";

export function StageControl({ dealId, stage }: { dealId: string; stage: Stage }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const change = (next: Stage) =>
    start(async () => {
      await api({ type: "stage", dealId, stage: next });
      router.refresh();
    });
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-semibold text-slate-900">Avance</h2>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Etapa
          <select
            value={stage}
            disabled={pending}
            onChange={(e) => change(e.target.value as Stage)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-900"
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
