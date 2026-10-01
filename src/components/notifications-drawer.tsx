"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { CheckCheck, X } from "lucide-react";
import { Avatar } from "./ui";
import { accounts } from "@/lib/data";
import { fmtDateTime, useStore } from "@/lib/store";

const initialsOf = (who: string) => Object.values(accounts).find((a) => a.name === who)?.initials ?? who.split(" ").map((w) => w[0]).join("").slice(0, 2);
const photoOf = (who: string) => Object.values(accounts).find((a) => a.name === who)?.photo;

export function useUnread() {
  const { visibleActivity, lastSeen, me } = useStore();
  return visibleActivity.filter((a) => a.when > lastSeen && a.who !== me.name).length;
}

/** Right-side drawer with the shared activity (what changed, who did it). */
export function NotificationsDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { visibleActivity, lastSeen, me, markSeen } = useStore();
  const closeRef = useRef<HTMLButtonElement>(null);
  // Stay mounted during the exit animation so it slides out instead of vanishing.
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Two timeouts instead of rAF so the transition also runs when the tab is throttled.
      const id = setTimeout(() => setVisible(true), 30);
      return () => clearTimeout(id);
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!mounted) return null;
  const unread = visibleActivity.filter((a) => a.when > lastSeen && a.who !== me.name).length;
  const today = new Date().toDateString();
  const recent = visibleActivity.filter((a) => new Date(a.when).toDateString() === today);
  const older = visibleActivity.filter((a) => new Date(a.when).toDateString() !== today);

  const Item = ({ a }: { a: (typeof visibleActivity)[number] }) => {
    const isNew = a.when > lastSeen && a.who !== me.name;
    return (
      <li className="flex items-start gap-3 px-5 py-3">
        <Avatar initials={initialsOf(a.who)} src={photoOf(a.who)} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm text-ink">
            <span className="font-semibold">{a.who}</span> · {a.what}
          </p>
          <p className="mt-0.5 text-xs text-ink-muted">{fmtDateTime(a.when)}</p>
        </div>
        {isNew && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-red-500" aria-label="Sin leer" />}
      </li>
    );
  };

  // Portal: the top bar uses backdrop-blur, which would otherwise become the containing block of this fixed drawer.
  return createPortal(
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Notificaciones">
      <button aria-label="Cerrar notificaciones" className={clsx("absolute inset-0 cursor-default bg-navy/40 transition-opacity duration-300 ease-out motion-reduce:transition-none", visible ? "opacity-100" : "opacity-0")} onClick={onClose} />
      <aside className={clsx("absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-surface shadow-2xl ring-1 ring-navy/10 transition-transform duration-300 ease-out motion-reduce:transition-none", visible ? "translate-x-0" : "translate-x-full")}>
        <header className="flex items-center justify-between gap-3 border-b border-navy-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-ink">Notificaciones</h2>
            <p className="text-xs text-ink-muted">{unread ? `${unread} sin leer` : "Estás al día"}</p>
          </div>
          <button ref={closeRef} onClick={onClose} aria-label="Cerrar" className="rounded-lg p-2 text-ink hover:bg-paper">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto">
          {visibleActivity.length === 0 && <p className="px-6 py-10 text-center text-sm text-ink-muted">Sin notificaciones.</p>}
          {recent.length > 0 && (
            <section>
              <h3 className="px-5 pb-1 pt-4 text-xs font-bold uppercase tracking-wide text-ink-muted">Hoy</h3>
              <ul className="divide-y divide-navy-100">{recent.map((a) => <Item key={a.id} a={a} />)}</ul>
            </section>
          )}
          {older.length > 0 && (
            <section>
              <h3 className="px-5 pb-1 pt-4 text-xs font-bold uppercase tracking-wide text-ink-muted">Anteriores</h3>
              <ul className="divide-y divide-navy-100">{older.map((a) => <Item key={a.id} a={a} />)}</ul>
            </section>
          )}
        </div>
        <footer className="border-t border-navy-100 p-4">
          <button onClick={markSeen} disabled={!unread} className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white hover:bg-navy-600 disabled:opacity-40">
            <CheckCheck className="h-4 w-4" aria-hidden /> Marcar como leídas
          </button>
        </footer>
      </aside>
    </div>,
    document.body,
  );
}
