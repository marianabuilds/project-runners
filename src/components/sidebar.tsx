"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import clsx from "clsx";
import { Home, Building2, ListChecks, CalendarDays, MessageCircle, UserRound, Eye, Menu, X, Plus } from "lucide-react";
import { agent } from "@/lib/data";
import { Avatar } from "./ui";

const items = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/ventas", label: "Mis ventas", icon: Building2 },
  { href: "/calendario", label: "Calendario", icon: CalendarDays },
  { href: "/tasks", label: "Pendientes", icon: ListChecks },
  { href: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { href: "/buyer", label: "Lo que ve el cliente", icon: Eye },
  { href: "/settings", label: "Mi cuenta", icon: UserRound },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-miel-300 font-heading text-2xl text-cafe-800" aria-hidden>
        t
      </span>
      <span className="font-heading text-3xl text-cafe-900">trato</span>
    </Link>
  );
}

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href) && !path.startsWith("/ventas/new"));
  return (
    <nav aria-label="Menú principal" className="flex-1 overflow-y-auto px-4">
      <ul className="space-y-1.5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "flex min-h-[52px] items-center gap-4 rounded-2xl px-4 text-lg transition-colors",
                  active ? "bg-miel-300 font-semibold text-cafe-900" : "text-cafe-800 hover:bg-miel-100",
                )}
              >
                <Icon className="h-6 w-6" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function UserCard() {
  return (
    <Link href="/settings" className="flex items-center gap-3 border-t border-miel-200 px-6 py-5 hover:bg-miel-50">
      <Avatar initials={agent.initials} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-base font-semibold text-cafe-900">{agent.name}</p>
        <p className="truncate text-sm text-cafe-700">{agent.agency}</p>
      </div>
    </Link>
  );
}

function NewDealButton({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="px-4 pb-6">
      <Link
        href="/ventas/new"
        onClick={onNavigate}
        className="flex min-h-[56px] w-full items-center justify-center gap-2 rounded-2xl bg-cafe-600 px-4 text-lg font-semibold text-white hover:bg-cafe-700"
      >
        <Plus className="h-6 w-6" aria-hidden /> Nueva venta
      </Link>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-miel-200 bg-white px-4 py-3 lg:hidden">
        <Logo />
        <button
          onClick={() => setOpen(true)}
          className="flex min-h-[48px] items-center gap-2 rounded-2xl bg-miel-300 px-4 text-lg font-semibold text-cafe-900"
        >
          <Menu className="h-6 w-6" aria-hidden /> Menú
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <div className="absolute inset-0 bg-cafe-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-80 max-w-[85vw] flex-col bg-white">
            <div className="flex items-center justify-between px-6 py-5">
              <Logo />
              <button
                onClick={() => setOpen(false)}
                className="flex min-h-[48px] items-center gap-1 rounded-2xl px-3 text-base font-semibold text-cafe-800 hover:bg-miel-100"
              >
                <X className="h-6 w-6" aria-hidden /> Cerrar
              </button>
            </div>
            <NewDealButton onNavigate={() => setOpen(false)} />
            <Nav onNavigate={() => setOpen(false)} />
            <UserCard />
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-miel-200 bg-white lg:flex">
        <div className="px-6 py-8">
          <Logo />
        </div>
        <NewDealButton />
        <Nav />
        <UserCard />
      </aside>
    </>
  );
}
