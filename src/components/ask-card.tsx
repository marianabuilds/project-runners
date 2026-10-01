"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, MessageCircle, MessagesSquare, Send } from "lucide-react";
import { Card, CardHeader } from "./ui";
import { answer, FAQ, type Answer } from "@/lib/ask";
import { agent } from "@/lib/data";
import { shortAddress } from "@/lib/format";
import { useStore } from "@/lib/store";
import { waLink } from "@/lib/whatsapp";

type Current = { q: string; a: Answer; whatsapp?: string };

/** Simple read-only FAQ: pick a question (or type one), read the answer, go back to the other questions. */
export function AskCard() {
  const { role, scoped, lastSync, manage } = useStore();
  const [current, setCurrent] = useState<Current | null>(null);
  const [text, setText] = useState("");
  const answerRef = useRef<HTMLHeadingElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);

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
    <Card className="lg:col-span-12">
      <section aria-label="Pregunta al portal">
        <CardHeader
          title="Pregunta al portal"
          subtitle="Consulta lo que ya está en el portal, sincronizado con WhatsApp"
          icon={<span className="grid h-10 w-10 place-items-center rounded-xl bg-sky text-ink" aria-hidden><MessagesSquare className="h-5 w-5" /></span>}
        />
        <div className="space-y-4 p-5 sm:p-6">
          {!current ? (
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
                      <Link key={s.href + s.label} href={s.href} className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-ink ring-1 ring-navy-100 hover:bg-sky">
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

          <form onSubmit={(e) => { e.preventDefault(); ask(text); }} className="flex items-center gap-2">
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
        </div>
      </section>
    </Card>
  );
}
