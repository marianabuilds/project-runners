"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";
import {
  LayoutDashboard,
  FileText,
  ListChecks,
  CalendarRange,
  Settings,
  Menu,
  X,
  ArrowLeftRight,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
} from "lucide-react";
import { accounts, type Role } from "@/lib/data";
import { useStore } from "@/lib/store";
import { Avatar } from "./ui";
import { Logo, LogoMark } from "./logo";

const items = [
  { href: "/", label: "Panel", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendario", icon: CalendarRange },
  { href: "/tasks", label: "Tareas", icon: ListChecks },
  { href: "/documents", label: "Documentos", icon: FileText },
  { href: "/settings", label: "Configuración", icon: Settings },
];

const label = (compact?: boolean) =>
  clsx("overflow-hidden whitespace-nowrap transition-all duration-300 motion-reduce:transition-none", compact ? "max-w-0 opacity-0" : "max-w-40 opacity-100");

function Nav({ onNavigate, compact }: { onNavigate?: () => void; compact?: boolean }) {
  const path = usePathname();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <nav aria-label="Principal" className={clsx("flex-1 overflow-y-auto overflow-x-hidden", compact ? "px-2" : "px-3")}>
      <ul className="space-y-0.5">
        {items.map(({ href, label: label_, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                aria-label={compact ? label_ : undefined}
                title={compact ? label_ : undefined}
                className={clsx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors",
                  active ? "bg-sky font-bold text-ink" : "text-ink hover:bg-paper",
                )}
              >
                <Icon className={clsx("h-5 w-5", active ? "text-ink" : "text-ink-muted")} aria-hidden />
                <span className={label(compact)}>{label_}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function UserCard({ compact }: { compact?: boolean }) {
  const { role, me, setRole } = useStore();
  const [open, setOpen] = useState(false);
  return (
    <div className={clsx("relative border-t border-navy-100 bg-paper py-4 transition-all duration-300 motion-reduce:transition-none", compact ? "px-3" : "px-5")}>
      {open && (
        <div className={clsx("absolute bottom-full mb-2 rounded-2xl bg-surface p-2 shadow-xl ring-1 ring-navy/10", compact ? "left-2 w-64" : "inset-x-3")} role="menu" aria-label="Cambiar cuenta">
          <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Cambiar cuenta</p>
          {(Object.keys(accounts) as Role[]).map((r) => {
            const a = accounts[r];
            return (
              <button
                key={r}
                role="menuitemradio"
                aria-checked={role === r}
                onClick={() => {
                  setRole(r);
                  setOpen(false);
                }}
                className={clsx("flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-paper", role === r && "bg-sky")}
              >
                <Avatar initials={a.initials} src={a.photo} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{a.name}</span>
                  <span className="block text-xs text-ink-muted">{a.label}</span>
                </span>
                {role === r && <Check className="h-4 w-4 text-ink" aria-hidden />}
              </button>
            );
          })}
        </div>
      )}
      <div className={clsx("flex items-center", compact ? "flex-col gap-2" : "gap-3")}>
        <Avatar initials={me.initials} src={me.photo} />
        <div className={clsx("min-w-0 flex-1", compact && "hidden")}>
          <p className="truncate text-sm font-semibold text-ink">{me.name}</p>
          <p className="truncate text-xs text-ink-muted">{me.label}</p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="rounded-lg p-1.5 text-ink-muted hover:bg-navy-100"
          aria-label="Cambiar cuenta"
          title="Cambiar cuenta"
        >
          <ArrowLeftRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function NewDealButton({ onNavigate, compact }: { onNavigate?: () => void; compact?: boolean }) {
  const { role } = useStore();
  if (role !== "agent") return <div className="pb-2" />;
  return (
    <div className={clsx("pb-4", compact ? "px-2" : "px-3")}>
      <Link
        href="/deals/new"
        aria-label="Nuevo negocio"
        title="Nuevo negocio"
        onClick={onNavigate}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-3 py-2.5 text-sm font-medium text-white hover:bg-navy-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      >
        <Plus className="h-4 w-4 shrink-0" aria-hidden /> <span className={label(compact)}>Nuevo negocio</span>
      </Link>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("trato-sidebar") === "collapsed");
    } catch {}
  }, []);
  const toggle = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem("trato-sidebar", c ? "expanded" : "collapsed");
      } catch {}
      return !c;
    });
  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-navy-100 bg-surface px-4 py-3 lg:hidden">
        <Logo />
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-ink hover:bg-paper" aria-label="Abrir menú">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <div className="absolute inset-0 bg-navy/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-surface">
            <div className="flex items-center justify-between px-6 py-5">
              <Logo />
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-ink hover:bg-paper" aria-label="Cerrar menú">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NewDealButton onNavigate={() => setOpen(false)} />
            <Nav onNavigate={() => setOpen(false)} />
            <UserCard />
          </aside>
        </div>
      )}

      {/* Desktop sidebar: collapsible */}
      <aside
        id="sidebar"
        className={clsx(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-navy-100 bg-surface transition-[width] duration-300 ease-in-out motion-reduce:transition-none lg:flex",
          collapsed ? "w-[4.5rem]" : "w-64",
        )}
      >
        <div className={clsx("flex items-center py-6", collapsed ? "flex-col gap-4 px-2" : "justify-between px-6")}>
          {collapsed ? <LogoMark /> : <Logo />}
          <button
            onClick={toggle}
            aria-expanded={!collapsed}
            aria-controls="sidebar"
            aria-label={collapsed ? "Expandir panel lateral" : "Contraer panel lateral"}
            title={collapsed ? "Expandir" : "Contraer"}
            className="grid h-9 w-9 place-items-center rounded-lg text-ink-muted hover:bg-paper hover:text-ink"
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
          </button>
        </div>
        <NewDealButton compact={collapsed} />
        <Nav compact={collapsed} />
        <UserCard compact={collapsed} />
      </aside>
    </>
  );
}
