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
    items: [{ href: "/", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    heading: "Deals",
    items: [
      { href: "/deals", label: "All deals", icon: Building2 },
      { href: "/tasks", label: "Tasks", icon: ListChecks },
      { href: "/timeline", label: "Timeline", icon: CalendarDays },
    ],
  },
  {
    heading: "Preview",
    items: [{ href: "/buyer", label: "Buyer view", icon: Eye }],
  },
  {
    heading: "Account",
    items: [{ href: "/settings", label: "Settings", icon: Settings }],
  },
];

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-lg font-bold text-white" aria-hidden>
        T
      </span>
      <span className="text-xl font-semibold tracking-tight text-slate-900">trato</span>
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
          {sec.heading && <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{sec.heading}</p>}
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
                      active ? "bg-blue-50 font-medium text-blue-700" : "text-slate-700 hover:bg-slate-100",
                    )}
                  >
                    <Icon className={clsx("h-5 w-5", active ? "text-blue-600" : "text-slate-500")} aria-hidden />
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
    <div className="flex items-center gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
      <Avatar initials={agent.initials} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-900">{agent.name}</p>
        <p className="truncate text-xs text-slate-500">{agent.agency}</p>
      </div>
      <button className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200" aria-label="Account menu">
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
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        <Plus className="h-4 w-4" aria-hidden /> New deal
      </Link>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <Logo />
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100" aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-white">
            <div className="flex items-center justify-between px-6 py-5">
              <Logo />
              <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Close menu">
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
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
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
