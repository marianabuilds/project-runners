"use client";

import { Avatar } from "./ui";
import { accounts } from "@/lib/data";
import { fmtDateTime, useStore } from "@/lib/store";

const initialsOf = (who: string) => Object.values(accounts).find((a) => a.name === who)?.initials ?? who.split(" ").map((w) => w[0]).join("").slice(0, 2);
const photoOf = (who: string) => Object.values(accounts).find((a) => a.name === who)?.photo;

/** Shared activity log: every role sees updates for the deals they can access. */
export function ActivityFeed({ dealId, limit }: { dealId?: string; limit?: number }) {
  const { visibleActivity, scoped } = useStore();
  const items = (dealId ? visibleActivity.filter((a) => a.dealId === dealId) : scoped.activity).slice(0, limit);
  if (!items.length) return <p className="px-6 py-8 text-center text-sm text-ink-muted">Sin actividad aún.</p>;
  return (
    <ul className="divide-y divide-navy-100" aria-live="polite">
      {items.map((a) => (
        <li key={a.id} className="flex items-center gap-3 px-5 py-3 sm:px-6">
          <Avatar initials={initialsOf(a.who)} src={photoOf(a.who)} size="sm" />
          <p className="min-w-0 flex-1 text-sm text-ink">
            <span className="font-medium">{a.who}</span> · {a.what}
          </p>
          <p className="shrink-0 text-xs text-ink-muted">{fmtDateTime(a.when)}</p>
        </li>
      ))}
    </ul>
  );
}
