"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { accounts, audit, STAGES, type TaskAction, deals as allDeals, INITIAL_SYNC, tasks as seedTasks, type AuditEntry, type Deal, type Role, type Stage, type Task } from "./data";

// Demo-only shared store: one source of truth for every role, persisted in localStorage
// (synced across tabs via the `storage` event). The role itself is per-tab (sessionStorage).
type Shared = { tasks: Task[]; stages: Record<string, Stage>; activity: AuditEntry[]; lastSync: string };

const KEY = "trato-demo-v1";
const ROLE_KEY = "trato-demo-role";
const DEAL_KEY = "trato-demo-deal";
const SEEN_KEY = "trato-demo-seen-";
export type Scope = string | "all";

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
  visibleTasks: Task[]; // the viewer's own tasks, all of their negocios
  visibleActivity: AuditEntry[];
  activeDealId: Scope;
  setActiveDeal: (id: Scope) => void;
  scoped: { isAll: boolean; deals: Deal[]; tasks: Task[]; activity: AuditEntry[] };
  stageOf: (dealId: string) => Stage;
  setTaskDone: (id: string, done: boolean) => void;
  completeMany: (ids: string[]) => void;
  setStage: (dealId: string, stage: Stage) => void;
  addTask: (t: { dealId: string; title: string; dueDate: string; action: TaskAction }) => void;
  lastSeen: string;
  markSeen: () => void;
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
  const [activeDeal, setActiveDealState] = useState<Scope | null>(null);
  const [lastSeen, setLastSeen] = useState("2000-01-01T00:00:00");
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
    const seen = safe.get(typeof window === "undefined" ? undefined : localStorage, SEEN_KEY + (r ?? "agent"));
    if (seen) setLastSeen(seen);
    const d = safe.get(typeof window === "undefined" ? undefined : sessionStorage, DEAL_KEY);
    if (d) setActiveDealState(d);
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
    setActiveDealState(null);
    safe.set(sessionStorage, ROLE_KEY, r);
    safe.set(sessionStorage, DEAL_KEY, "");
    setLastSeen(safe.get(localStorage, SEEN_KEY + r) ?? "2000-01-01T00:00:00");
  }, []);

  const setActiveDeal = useCallback((id: Scope) => {
    setActiveDealState(id);
    safe.set(sessionStorage, DEAL_KEY, id);
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

  const setStage = useCallback(
    (dealId: string, stage: Stage) =>
      setState((s) => ({ ...s, stages: { ...s.stages, [dealId]: stage }, activity: [log(dealId, `Movió la etapa a ${STAGES.find((x) => x.key === stage)?.label ?? stage}`), ...s.activity] })),
    [log],
  );

  const addTask = useCallback(
    (t: { dealId: string; title: string; dueDate: string; action: TaskAction }) =>
      setState((s) => {
        const task: Task = { id: `t${Date.now()}`, dealId: t.dealId, title: t.title, assignee: role, status: "pending", dueDate: t.dueDate, action: t.action, manual: true };
        return { ...s, tasks: [...s.tasks, task], activity: [log(t.dealId, `Creó la tarea "${t.title}"`), ...s.activity] };
      }),
    [log, role],
  );

  const markSeen = useCallback(() => {
    const now = new Date().toISOString();
    setLastSeen(now);
    safe.set(localStorage, SEEN_KEY + role, now);
  }, [role]);

  const syncWhatsApp = useCallback(
    () => setState((s) => ({ ...s, lastSync: new Date().toISOString(), activity: [log(allDeals[0].id, "Sincronizó las conversaciones de WhatsApp"), ...s.activity] })),
    [log],
  );

  const value = useMemo<Ctx>(() => {
    const ids = me.dealIds === "all" ? allDeals.map((d) => d.id) : me.dealIds;
    const deals = allDeals.filter((d) => ids.includes(d.id)).map((d) => ({ ...d, stage: state.stages[d.id] ?? d.stage }));
    // Everyone sees only their own tasks; progress by others shows up in the shared activity feed.
    const visibleTasks = state.tasks.filter((t) => ids.includes(t.dealId) && t.assignee === role);
    const visibleActivity = state.activity.filter((a) => ids.includes(a.dealId));
    // Scope: one negocio (default) or "all" (consolidated). Single-negocio roles are always scoped.
    const canAll = deals.length > 1;
    const active: Scope = activeDeal === "all" && canAll ? "all" : deals.find((d) => d.id === activeDeal)?.id ?? deals[0]?.id ?? "all";
    const inScope = (id: string) => active === "all" || id === active;
    const scoped = {
      isAll: active === "all",
      deals: deals.filter((d) => inScope(d.id)),
      tasks: visibleTasks.filter((t) => inScope(t.dealId)),
      activity: visibleActivity.filter((a) => inScope(a.dealId)),
    };
    return {
      ...state,
      role,
      me,
      setRole,
      deals,
      visibleTasks,
      visibleActivity,
      activeDealId: active,
      setActiveDeal,
      scoped,
      stageOf: (id) => state.stages[id] ?? allDeals.find((d) => d.id === id)!.stage,
      setTaskDone,
      completeMany,
      setStage,
      addTask,
      lastSeen,
      markSeen,
      syncWhatsApp,
    };
  }, [state, role, me, setRole, activeDeal, setActiveDeal, setTaskDone, completeMany, setStage, addTask, lastSeen, markSeen, syncWhatsApp]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
}

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
