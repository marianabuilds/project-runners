"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { accounts, audit, STAGES, deals as allDeals, INITIAL_SYNC, tasks as seedTasks, type AuditEntry, type Deal, type Role, type Stage, type Task } from "./data";

// Demo-only shared store: one source of truth for every role, persisted in localStorage
// (synced across tabs via the `storage` event). The role itself is per-tab (sessionStorage).
type Shared = { tasks: Task[]; stages: Record<string, Stage>; activity: AuditEntry[]; lastSync: string };

const KEY = "trato-demo-v1";
const ROLE_KEY = "trato-demo-role";

const seed = (): Shared => ({
  tasks: seedTasks,
  stages: Object.fromEntries(allDeals.map((d) => [d.id, d.stage])),
  activity: [...audit].sort((a, b) => b.when.localeCompare(a.when)),
  lastSync: INITIAL_SYNC,
});

type Ctx = Shared & {
  role: Role;
  me: (typeof accounts)[Role];
  setRole: (r: Role) => void;
  deals: Deal[];
  visibleTasks: Task[];
  visibleActivity: AuditEntry[];
  stageOf: (dealId: string) => Stage;
  setTaskDone: (id: string, done: boolean) => void;
  completeMany: (ids: string[]) => void;
  remind: (id: string) => void;
  setStage: (dealId: string, stage: Stage) => void;
  syncWhatsApp: () => void;
};

const StoreCtx = createContext<Ctx | null>(null);

const safe = {
  get: (s: Storage | undefined, k: string) => {
    try {
      return s?.getItem(k) ?? null;
    } catch {
      return null;
    }
  },
  set: (s: Storage | undefined, k: string, v: string) => {
    try {
      s?.setItem(k, v);
    } catch {}
  },
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Shared>(seed);
  const [role, setRoleState] = useState<Role>("agent");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = safe.get(typeof window === "undefined" ? undefined : localStorage, KEY);
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch {}
    }
    const r = safe.get(typeof window === "undefined" ? undefined : sessionStorage, ROLE_KEY) as Role | null;
    if (r && r in accounts) setRoleState(r);
    setReady(true);
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && e.newValue) {
        try {
          setState(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (ready) safe.set(localStorage, KEY, JSON.stringify(state));
  }, [state, ready]);

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
    safe.set(sessionStorage, ROLE_KEY, r);
  }, []);

  const me = accounts[role];
  const log = useCallback(
    (dealId: string, what: string): AuditEntry => ({ id: `a${Date.now()}${Math.random().toString(36).slice(2, 6)}`, dealId, who: me.name, what, when: new Date().toISOString() }),
    [me.name],
  );

  const setTaskDone = useCallback(
    (id: string, done: boolean) =>
      setState((s) => {
        const t = s.tasks.find((x) => x.id === id);
        if (!t) return s;
        return {
          ...s,
          tasks: s.tasks.map((x) => (x.id === id ? { ...x, status: done ? "completed" : "pending" } : x)),
          activity: [log(t.dealId, done ? `Completó "${t.title}"` : `Reabrió "${t.title}"`), ...s.activity],
        };
      }),
    [log],
  );

  const completeMany = useCallback(
    (ids: string[]) =>
      setState((s) => {
        const hit = s.tasks.filter((t) => ids.includes(t.id) && t.status !== "completed");
        return {
          ...s,
          tasks: s.tasks.map((t) => (ids.includes(t.id) ? { ...t, status: "completed" } : t)),
          activity: [...hit.map((t) => log(t.dealId, `Completó "${t.title}"`)), ...s.activity],
        };
      }),
    [log],
  );

  const remind = useCallback(
    (id: string) =>
      setState((s) => {
        const t = s.tasks.find((x) => x.id === id);
        return t ? { ...s, activity: [log(t.dealId, `Envió un recordatorio: "${t.title}"`), ...s.activity] } : s;
      }),
    [log],
  );

  const setStage = useCallback(
    (dealId: string, stage: Stage) =>
      setState((s) => ({ ...s, stages: { ...s.stages, [dealId]: stage }, activity: [log(dealId, `Movió la etapa a ${STAGES.find((x) => x.key === stage)?.label ?? stage}`), ...s.activity] })),
    [log],
  );

  const syncWhatsApp = useCallback(
    () => setState((s) => ({ ...s, lastSync: new Date().toISOString(), activity: [log(allDeals[0].id, "Sincronizó las conversaciones de WhatsApp"), ...s.activity] })),
    [log],
  );

  const value = useMemo<Ctx>(() => {
    const ids = me.dealIds === "all" ? allDeals.map((d) => d.id) : me.dealIds;
    const deals = allDeals.filter((d) => ids.includes(d.id)).map((d) => ({ ...d, stage: state.stages[d.id] ?? d.stage }));
    // Buyers/sellers see their own tasks plus the agent's (shared progress, no loose ends); never the other party's.
    const visibleTasks = state.tasks.filter((t) => ids.includes(t.dealId) && (role === "agent" || t.assignee === role || t.assignee === "agent"));
    const visibleActivity = state.activity.filter((a) => ids.includes(a.dealId));
    return {
      ...state,
      role,
      me,
      setRole,
      deals,
      visibleTasks,
      visibleActivity,
      stageOf: (id) => state.stages[id] ?? allDeals.find((d) => d.id === id)!.stage,
      setTaskDone,
      completeMany,
      remind,
      setStage,
      syncWhatsApp,
    };
  }, [state, role, me, setRole, setTaskDone, completeMany, remind, setStage, syncWhatsApp]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
}

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
