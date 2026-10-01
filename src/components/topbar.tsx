"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { Bell, Building2, ChevronDown, LayoutGrid, Moon, Settings2, Sun } from "lucide-react";
import { NotificationsDrawer, useUnread } from "./notifications-drawer";
import { shortAddress } from "@/lib/format";
import { useStore } from "@/lib/store";

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("trato-theme", next ? "dark" : "light");
    } catch {}
  };
  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      title={dark ? "Modo claro" : "Modo oscuro"}
      className="grid h-10 w-10 place-items-center rounded-xl bg-surface text-ink ring-1 ring-navy-100 hover:bg-sky"
    >
      {dark ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
    </button>
  );
}

/** Sticky top bar: which negocio you're viewing (individual by default, or consolidated) + theme toggle. */
export function Topbar() {
  const { role, deals, visibleTasks, activeDealId, setActiveDeal } = useStore();
  const [open, setOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const unread = useUnread();
  const canAll = deals.length > 1;
  const current = deals.find((d) => d.id === activeDealId);
  const openCount = (id: string) => visibleTasks.filter((t) => t.dealId === id && t.status !== "completed").length;
  const pick = (id: string) => {
    setActiveDeal(id);
    setOpen(false);
  };

  return (
    <div className="sticky top-[3.6rem] z-20 -mx-4 mb-5 flex items-center justify-between gap-3 border-b border-navy-100 bg-paper/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-10 lg:px-10">
      <div className="relative min-w-0" onKeyDown={(e) => e.key === "Escape" && setOpen(false)}>
        <button
          onClick={() => canAll && setOpen((o) => !o)}
          aria-haspopup={canAll ? "listbox" : undefined}
          aria-expanded={canAll ? open : undefined}
          className={clsx("flex max-w-full items-center gap-3 rounded-xl bg-surface px-4 py-2 text-left ring-1 ring-navy-100", canAll && "hover:bg-sky")}
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-navy text-white" aria-hidden>
            {current ? <Building2 className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
          </span>
          <span className="min-w-0">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Viendo</span>
            <span className="block truncate text-sm font-semibold text-ink">
              {current ? shortAddress(current) : `Vista consolidada · ${deals.length} negocios`}
            </span>
          </span>
          {canAll && <ChevronDown className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden />}
        </button>

        {open && (
          <>
            <button aria-label="Cerrar" className="fixed inset-0 z-10 cursor-default" onClick={() => setOpen(false)} />
            <div role="listbox" aria-label="Negocio" className="absolute left-0 top-full z-20 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl bg-surface p-2 shadow-xl ring-1 ring-navy/10">
              {role === "agent" && (
                <button role="option" aria-selected={activeDealId === "all"} onClick={() => pick("all")} className={clsx("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-paper", activeDealId === "all" && "bg-sky")}>
                  <LayoutGrid className="h-4 w-4 text-ink-muted" aria-hidden />
                  <span className="flex-1 text-sm font-medium text-ink">Todos los negocios <span className="font-normal text-ink-muted">(consolidado)</span></span>
                  {activeDealId === "all" && <span className="shrink-0 rounded-full bg-navy px-2.5 py-0.5 text-[11px] font-bold text-white">Viendo</span>}
                </button>
              )}
              {deals.map((d) => (
                <button key={d.id} role="option" aria-selected={activeDealId === d.id} onClick={() => pick(d.id)} className={clsx("flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-paper", activeDealId === d.id && "bg-sky")}>
                  <Building2 className="h-4 w-4 text-ink-muted" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-ink">{shortAddress(d)}</span>
                    <span className="block truncate text-xs text-ink-muted">{d.address.district} · {role === "seller" ? "Comprador interesado" : d.buyer.name} · {openCount(d.id)} por hacer</span>
                  </span>
                  {activeDealId === d.id && <span className="shrink-0 rounded-full bg-navy px-2.5 py-0.5 text-[11px] font-bold text-white">Viendo</span>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        {role !== "buyer" && (
          <Link href="/manage" className="flex h-10 items-center gap-2 rounded-xl bg-surface px-3 text-sm font-semibold text-ink ring-1 ring-navy-100 hover:bg-sky" title="Gestionar negocio">
            <Settings2 className="h-4 w-4" aria-hidden />
            <span className="hidden sm:inline">Gestionar</span>
          </Link>
        )}
        <button
          onClick={() => setBellOpen(true)}
          aria-label={unread ? `Notificaciones, ${unread} sin leer` : "Notificaciones"}
          className="relative grid h-10 w-10 place-items-center rounded-xl bg-surface text-navy ring-1 ring-navy-100 hover:bg-sky"
        >
          <Bell className="h-5 w-5" aria-hidden />
          {unread > 0 && <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white ring-2 ring-paper">{unread}</span>}
        </button>
        <ThemeToggle />
      </div>
      <NotificationsDrawer open={bellOpen} onClose={() => setBellOpen(false)} />
    </div>
  );
}
