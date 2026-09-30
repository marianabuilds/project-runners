"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import clsx from "clsx";
import { Send } from "lucide-react";
import type { Message } from "@/lib/data";

export function WhatsAppSim({ initial }: { initial: Message[] }) {
  const router = useRouter();
  const [msgs, setMsgs] = useState(initial);
  const [text, setText] = useState("");
  const [busy, start] = useTransition();
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMsgs(initial);
  }, [initial]);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [msgs]);

  const send = () => {
    const v = text.trim();
    if (!v || busy) return;
    setMsgs((m) => [...m, { id: `l${m.length}`, channel: "whatsapp", from: "agent", text: v, at: "" }]);
    setText("");
    start(async () => {
      const res = await fetch("/api/whatsapp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ from: "+51987654321", text: v }) });
      const data = await res.json();
      if (data.messages) setMsgs(data.messages);
      if (data.changed) router.refresh();
    });
  };

  return (
    <div className="mx-auto flex h-[34rem] max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-slate-200">
      <div className="flex items-center gap-3 bg-emerald-700 px-4 py-3 text-white">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-white/20 text-sm font-semibold" aria-hidden>T</span>
        <div>
          <p className="text-sm font-semibold">trato · asistente</p>
          <p className="text-xs text-emerald-100">en línea</p>
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto bg-[#efeae2] px-3 py-4" role="log" aria-live="polite" aria-label="Conversación de WhatsApp">
        {msgs.map((m) => (
          <div key={m.id} className={clsx("flex", m.from === "agent" ? "justify-end" : m.from === "system" ? "justify-center" : "justify-start")}>
            <p
              className={clsx(
                "max-w-[85%] whitespace-pre-line rounded-lg px-3 py-1.5 text-sm shadow-sm",
                m.from === "agent" && "bg-[#d9fdd3] text-slate-900",
                m.from === "bot" && "bg-white text-slate-900",
                m.from === "system" && "bg-amber-50 text-center text-xs text-amber-900",
              )}
            >
              {m.text}
            </p>
          </div>
        ))}
        {busy && <p className="text-xs text-slate-500">Escribiendo…</p>}
        <div ref={end} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2 bg-slate-100 p-3"
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe un mensaje" aria-label="Mensaje de WhatsApp" className="min-w-0 flex-1 rounded-full border-0 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300" />
        <button type="submit" disabled={busy || !text.trim()} className="grid h-10 w-10 place-items-center rounded-full bg-emerald-600 text-white disabled:opacity-40" aria-label="Enviar">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
