"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ACTION_DOC_STATUS, accounts, audit, docs as seedDocs, seedManage, STAGES, type BuyerAccess, type ManageInfo, type Doc, type DocStatus, type TaskAction, deals as allDeals, INITIAL_SYNC, tasks as seedTasks, type AuditEntry, type Deal, type Role, type Stage, type Task } from "./data";

// Demo-only shared store: one source of truth for every role, persisted in localStorage
// (synced across tabs via the `storage` event). The role itself is per-tab (sessionStorage).
type Shared = { manage: Record<string, ManageInfo>; docs: Doc[]; tasks: Task[]; stages: Record<string, Stage>; activity: AuditEntry[]; lastSync: string };

const KEY = "trato-demo-v2";
const ROLE_KEY = "trato-demo-role";
const DEAL_KEY = "trato-demo-deal";
const DOC_STATUS_LABEL: Record<DocStatus, string> = { pendiente: "Pendiente", subido: "Subido", en_revision: "En revisión", firmado: "Firmado", aprobado: "Aprobado" };
const SEEN_KEY = "trato-demo-seen-";
export type Scope = string | "all";

const seed = (): Shared => ({
  manage: seedManage,
  docs: seedDocs,
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
  scoped: { isAll: boolean; deals: Deal[]; tasks: Task[]; activity: AuditEntry[]; docs: Doc[] };
  stageOf: (dealId: string) => Stage;
  setTaskDone: (id: string, done: boolean) => void;
  completeMany: (ids: string[]) => void;
  setStage: (dealId: string, stage: Stage) => void;
  manage: Record<string, ManageInfo>;
  setDealInfo: (dealId: string, patch: { description?: string; features?: string[] }) => void;
  addPhotos: (dealId: string, urls: string[]) => void;
  removePhoto: (dealId: string, index: number) => void;
  setBuyerAccess: (dealId: string, patch: Partial<Omit<BuyerAccess, "docCategories">> & { docCategories?: Partial<BuyerAccess["docCategories"]> }) => void;
  setDocStatus: (id: string, status: DocStatus) => void;
  setDocNote: (id: string, note: string) => void;
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

// Older saved states may lack docs / docId links; fill them from the seed.
const migrate = (saved: Partial<Shared>): Shared => {
  const base = seed();
  const links = new Map(seedTasks.map((t) => [t.id, t.docId]));
  return {
    ...base,
    ...saved,
    docs: saved.docs ?? base.docs,
    manage: saved.manage ?? base.manage,
    tasks: (saved.tasks ?? base.tasks).map((t) => (t.docId || !links.get(t.id) ? t : { ...t, docId: links.get(t.id) })),
  } as Shared;
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
        setState(migrate(JSON.parse(saved)));
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
          setState(migrate(JSON.parse(e.newValue)));
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
        const next: Shared = {
          ...s,
          tasks: s.tasks.map((x) => (x.id === id ? { ...x, status: done ? "completed" : "pending" } : x)),
          activity: [log(t.dealId, done ? `Completó "${t.title}"` : `Reabrió "${t.title}"`), ...s.activity],
        };
        const status = done && t.docId ? ACTION_DOC_STATUS[t.action] : undefined;
        const doc = status ? s.docs.find((d) => d.id === t.docId) : undefined;
        if (doc && status) {
          const now = new Date().toISOString();
          next.docs = s.docs.map((d) => (d.id === doc.id ? { ...d, status, updatedAt: now, updatedBy: me.name } : d));
          next.activity = [log(doc.dealId, `Actualizó "${doc.name}": ${DOC_STATUS_LABEL[status]}`), ...next.activity];
        }
        return next;
      }),
    [log, me.name],
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

  const setDocStatus = useCallback(
    (id: string, status: DocStatus) =>
      setState((s) => {
        const d = s.docs.find((x) => x.id === id);
        if (!d) return s;
        return {
          ...s,
          docs: s.docs.map((x) => (x.id === id ? { ...x, status, updatedAt: new Date().toISOString(), updatedBy: me.name } : x)),
          activity: [log(d.dealId, `Actualizó "${d.name}": ${DOC_STATUS_LABEL[status]}`), ...s.activity],
        };
      }),
    [log, me.name],
  );

  const setDocNote = useCallback(
    (id: string, note: string) =>
      setState((s) => {
        const d = s.docs.find((x) => x.id === id);
        if (!d) return s;
        return {
          ...s,
          docs: s.docs.map((x) => (x.id === id ? { ...x, note: note.trim() || undefined, updatedAt: new Date().toISOString(), updatedBy: me.name } : x)),
          activity: [log(d.dealId, `Dejó una nota en "${d.name}"`), ...s.activity],
        };
      }),
    [log, me.name],
  );

  const setDealInfo = useCallback(
    (dealId: string, patch: { description?: string; features?: string[] }) =>
      setState((s) => ({
        ...s,
        manage: { ...s.manage, [dealId]: { ...s.manage[dealId], ...patch } },
        activity: [log(dealId, "Actualizó la información del negocio"), ...s.activity],
      })),
    [log],
  );

  const addPhotos = useCallback(
    (dealId: string, urls: string[]) =>
      setState((s) => ({
        ...s,
        manage: { ...s.manage, [dealId]: { ...s.manage[dealId], photos: [...s.manage[dealId].photos, ...urls].slice(0, 6) } },
        activity: [log(dealId, urls.length === 1 ? "Agregó una foto" : `Agregó ${urls.length} fotos`), ...s.activity],
      })),
    [log],
  );

  const removePhoto = useCallback(
    (dealId: string, index: number) =>
      setState((s) => ({ ...s, manage: { ...s.manage, [dealId]: { ...s.manage[dealId], photos: s.manage[dealId].photos.filter((_, i) => i !== index) } } })),
    [],
  );

  // Permission changes are intentionally not logged to activity: that feed is visible to the buyer.
  const setBuyerAccess = useCallback(
    (dealId: string, patch: Partial<Omit<BuyerAccess, "docCategories">> & { docCategories?: Partial<BuyerAccess["docCategories"]> }) =>
      setState((s) => {
        const cur = s.manage[dealId];
        const { docCategories, ...rest } = patch;
        return { ...s, manage: { ...s.manage, [dealId]: { ...cur, buyerAccess: { ...cur.buyerAccess, ...rest, docCategories: { ...cur.buyerAccess.docCategories, ...docCategories } } } } };
      }),
    [],
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
      docs: state.docs.filter((d) => ids.includes(d.dealId) && inScope(d.dealId) && (role === "agent" || d.owner === "shared" || d.owner === role) && (role !== "buyer" || state.manage[d.dealId]?.buyerAccess.docCategories[d.category] !== false)),
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
      manage: state.manage,
      setDealInfo,
      addPhotos,
      removePhoto,
      setBuyerAccess,
      setDocStatus,
      setDocNote,
      addTask,
      lastSeen,
      markSeen,
      syncWhatsApp,
    };
  }, [state, role, me, setRole, activeDeal, setActiveDeal, setTaskDone, completeMany, setStage, setDealInfo, addPhotos, removePhoto, setBuyerAccess, setDocStatus, setDocNote, addTask, lastSeen, markSeen, syncWhatsApp]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
}

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("es-PE", { dateStyle: "medium", timeStyle: "short" });
