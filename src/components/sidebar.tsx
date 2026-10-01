"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import {
  LayoutDashboard,
  Building2,
  ListChecks,
  CalendarDays,
  CalendarRange,
  Settings,
  Menu,
  X,
  MoreHorizontal,
  Eye,
  Plus,
} from "lucide-react";
import { agent } from "@/lib/data";
import { Avatar } from "./ui";

const sections = [
  {
    heading: null,
    items: [
      { href: "/", label: "Panel", icon: LayoutDashboard },
      { href: "/calendar", label: "Calendario", icon: CalendarRange },
    ],
  },
  {
    heading: "Negocios",
    items: [
      { href: "/deals", label: "Todos los negocios", icon: Building2 },
      { href: "/tasks", label: "Tareas", icon: ListChecks },
      { href: "/timeline", label: "Cronograma", icon: CalendarDays },
    ],
  },
  {
    heading: "Previsualización",
    items: [{ href: "/buyer", label: "Vista del comprador", icon: Eye }],
  },
  {
    heading: "Cuenta",
    items: [{ href: "/settings", label: "Configuración", icon: Settings }],
  },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-navy text-lg font-bold text-white" aria-hidden>
        T
      </span>
      <span className="text-xl font-semibold tracking-tight text-navy">trato</span>
    </Link>
  );
}

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
  return (
    <nav aria-label="Main" className="flex-1 overflow-y-auto px-3">
      {sections.map((sec, i) => (
        <div key={i} className={clsx(i > 0 && "mt-6")}>
          {sec.heading && <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-navy-200">{sec.heading}</p>}
          <ul className="space-y-0.5">
            {sec.items.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={clsx(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors",
                      active ? "bg-sky font-medium text-navy" : "text-navy hover:bg-paper",
                    )}
                  >
                    <Icon className={clsx("h-5 w-5", active ? "text-navy" : "text-navy-200")} aria-hidden />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function UserCard() {
  return (
    <div className="flex items-center gap-3 border-t border-navy-100 bg-paper px-5 py-4">
      <Avatar initials={agent.initials} src={agent.photo} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-navy">{agent.name}</p>
        <p className="truncate text-xs text-navy-200">{agent.agency}</p>
      </div>
      <button className="rounded-lg p-1.5 text-navy-200 hover:bg-navy-100" aria-label="Menú de cuenta">
        <MoreHorizontal className="h-5 w-5" />
      </button>
    </div>
  );
}

function NewDealButton({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="px-3 pb-4">
      <Link
        href="/deals/new"
        onClick={onNavigate}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy"
      >
        <Plus className="h-4 w-4" aria-hidden /> Nuevo negocio
      </Link>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-navy-100 bg-white px-4 py-3 lg:hidden">
        <Logo />
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-navy hover:bg-paper" aria-label="Abrir menú">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <div className="absolute inset-0 bg-navy/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white">
            <div className="flex items-center justify-between px-6 py-5">
              <Logo />
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-navy hover:bg-paper" aria-label="Cerrar menú">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NewDealButton onNavigate={() => setOpen(false)} />
            <Nav onNavigate={() => setOpen(false)} />
            <UserCard />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-navy-100 bg-white lg:flex">
        <div className="px-6 py-6">
          <Logo />
        </div>
        <NewDealButton />
        <Nav />
        <UserCard />
      </aside>
    </>
  );
}
