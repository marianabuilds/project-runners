"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ArrowLeft, MessageCircle, MessagesSquare, Send, X } from "lucide-react";
import { answer, FAQ, type Answer } from "@/lib/ask";
import { agent } from "@/lib/data";
import { shortAddress } from "@/lib/format";
import { useStore } from "@/lib/store";
import { waLink } from "@/lib/whatsapp";

type Current = { q: string; a: Answer; whatsapp?: string };

/** Floating read-only FAQ: pick a question (or type one), read the answer, go back to the other questions. */
export function AskFloating() {
  const { role, scoped, lastSync, manage } = useStore();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<Current | null>(null);
  const [text, setText] = useState("");
  const btnRef = useRef<HTMLButtonElement>(null);
  const answerRef = useRef<HTMLHeadingElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const id = setTimeout(() => setVisible(true), 30);
      return () => clearTimeout(id);
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), 250);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => firstRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const ask = (q: string) => {
    const question = q.trim();
    if (!question) return;
    const a = answer(question, { role, deals: scoped.deals, isAll: scoped.isAll, tasks: scoped.tasks, docs: scoped.docs, activity: scoped.activity, lastSync, manage });
    const deal = scoped.deals[0];
    // Agent -> buyer of the negocio in view; buyer/seller -> agent. Offered only when the portal can't answer.
    const phone = role === "agent" ? deal?.buyer.phone : agent.phone;
    const whatsapp = a.fallback && phone ? waLink(phone, `Hola, tengo una pregunta${deal ? ` sobre ${shortAddress(deal)}` : ""}: ${question}`) : undefined;
    setCurrent({ q: question, a, whatsapp });
    setText("");
    setTimeout(() => answerRef.current?.focus(), 0);
  };
  const back = () => {
    setCurrent(null);
    setTimeout(() => firstRef.current?.focus(), 0);
  };

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Pregunta al portal"
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-full bg-navy px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-navy/30 hover:bg-navy-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      >
        {open ? <X className="h-5 w-5" aria-hidden /> : <MessagesSquare className="h-5 w-5" aria-hidden />}
        <span className="hidden sm:inline">Pregunta al portal</span>
      </button>

      {mounted && (
        <section
          role="dialog"
          aria-label="Pregunta al portal"
          className={clsx(
            "fixed bottom-20 right-4 z-40 flex max-h-[min(34rem,calc(100vh-7rem))] w-[min(24rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl bg-surface shadow-2xl ring-1 ring-navy/10 transition-all duration-300 ease-out motion-reduce:transition-none",
            visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          )}
        >
          <header className="border-b border-navy-100 px-5 py-4">
            <h2 className="text-base font-semibold text-ink">Pregunta al portal</h2>
            <p className="text-xs text-ink-muted">Solo consulta lo que ya está en el portal, sincronizado con WhatsApp.</p>
          </header>

          <div className="flex-1 overflow-y-auto px-4 py-4">
            {!current ? (
              <ul className="space-y-2">
                {FAQ.map((q, i) => (
                  <li key={q}>
                    <button ref={i === 0 ? firstRef : undefined} onClick={() => ask(q)} className="w-full rounded-xl bg-paper px-4 py-2.5 text-left text-sm font-semibold text-ink ring-1 ring-navy-100 hover:bg-sky">
                      {q}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div aria-live="polite" className="space-y-3">
                <button onClick={back} className="flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-ink-muted">
                  <ArrowLeft className="h-4 w-4" aria-hidden /> Otras preguntas
                </button>
                <h3 ref={answerRef} tabIndex={-1} className="text-base font-semibold text-ink focus:outline-none">{current.q}</h3>
                <div className="rounded-2xl bg-paper p-4 text-sm text-ink ring-1 ring-navy-100">
                  <p className="whitespace-pre-line">{current.a.text}</p>
                  {current.a.sources.length > 0 && (
                    <p className="mt-3 flex flex-wrap gap-1.5">
                      {current.a.sources.map((s) => (
                        <Link key={s.href + s.label} href={s.href} onClick={() => setOpen(false)} className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-ink ring-1 ring-navy-100 hover:bg-sky">
                          {s.label}
                        </Link>
                      ))}
                    </p>
                  )}
                  {current.whatsapp && (
                    <a href={current.whatsapp} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-bold text-on-accent hover:brightness-95">
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden /> Abrir WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={(e) => { e.preventDefault(); ask(text); }} className="flex items-center gap-2 border-t border-navy-100 p-3">
            <label htmlFor="ask-input" className="sr-only">Escribe tu pregunta</label>
            <input
              id="ask-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="O escribe tu pregunta…"
              autoComplete="off"
              className="min-w-0 flex-1 rounded-xl border border-navy-100 bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-navy focus:outline-none focus:ring-2 focus:ring-sky"
            />
            <button type="submit" aria-label="Enviar pregunta" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy text-white hover:bg-navy-600">
              <Send className="h-4 w-4" aria-hidden />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
