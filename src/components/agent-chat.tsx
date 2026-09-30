"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import clsx from "clsx";
import { Send, Sparkles } from "lucide-react";
import type { Message } from "@/lib/data";
import { Card } from "./ui";

const chips = [
  { label: "Completar tarea", text: "completa tarea " },
  { label: "Nuevo evento", text: "nuevo evento " },
  { label: "Agregar comprador", text: "agrega comprador " },
  { label: "Cambiar etapa", text: "cambia etapa de " },
  { label: "Resumen de hoy", text: "resumen", send: true },
];

export function AgentChat({ initial }: { initial: Message[] }) {
  const router = useRouter();
  const [msgs, setMsgs] = useState(initial);
  const [text, setText] = useState("");
  const [busy, start] = useTransition();
  const end = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMsgs(initial);
  }, [initial]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [msgs]);

  const send = (t: string) => {
    const v = t.trim();
    if (!v || busy) return;
    setMsgs((m) => [...m, { id: `l${m.length}`, channel: "chat", from: "agent", text: v, at: "" }]);
    setText("");
    start(async () => {
      const res = await fetch("/api/agent", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: v }) });
      const data = await res.json();
      setMsgs((m) => [...m, { id: `r${m.length}`, channel: "chat", from: "bot", text: data.reply ?? "Error", at: "" }]);
      if (data.changed) router.refresh();
    });
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white px-5 py-4 sm:px-6">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white" aria-hidden>
          <Sparkles className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Asistente de ventas</h2>
          <p className="text-sm text-slate-500">Actualiza tareas y agenda eventos escribiendo, igual que por WhatsApp.</p>
        </div>
      </div>
      <div className="max-h-72 space-y-3 overflow-y-auto px-5 py-4 sm:px-6" role="log" aria-live="polite" aria-label="Conversación con el asistente">
        {msgs.slice(-12).map((m) => (
          <div key={m.id} className={clsx("flex", m.from === "agent" ? "justify-end" : "justify-start")}>
            <p
              className={clsx(
                "max-w-[85%] whitespace-pre-line rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                m.from === "agent" && "rounded-br-md bg-blue-600 text-white",
                m.from === "bot" && "rounded-bl-md bg-slate-100 text-slate-800",
                m.from === "system" && "rounded-md bg-amber-50 text-xs text-amber-900 ring-1 ring-amber-200",
              )}
            >
              {m.text}
            </p>
          </div>
        ))}
        {busy && <p className="text-xs text-slate-400">Escribiendo…</p>}
        <div ref={end} />
      </div>
      <div className="border-t border-slate-100 px-5 py-3 sm:px-6">
        <div className="mb-3 flex flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => (c.send ? send(c.text) : (setText(c.text), input.current?.focus()))}
              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200"
            >
              {c.label}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(text);
          }}
          className="flex gap-2"
        >
          <input
            ref={input}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ej.: nuevo evento tasación en Los Pinos 12 oct"
            aria-label="Mensaje al asistente"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <button type="submit" disabled={busy || !text.trim()} className="grid w-11 place-items-center rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40" aria-label="Enviar">
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </Card>
  );
}
