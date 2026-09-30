"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Check } from "lucide-react";
import { api } from "@/lib/client";

export function ActionItemCheck({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await api({ type: "task-status", id, status: "completed" });
          router.refresh();
        })
      }
      aria-label={`Marcar “${title}” como hecha`}
      title="Marcar como hecha"
      className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-[3px] border-cafe-300 bg-white text-transparent transition-colors hover:border-cafe-600 hover:bg-miel-50 hover:text-cafe-300 disabled:opacity-50"
    >
      <Check className="h-6 w-6" strokeWidth={3} aria-hidden />
    </button>
  );
}
