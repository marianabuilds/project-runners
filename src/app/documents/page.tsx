"use client";

import { useState } from "react";
import clsx from "clsx";
import { Pencil } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { ProgressRing } from "@/components/charts";
import { DocStatusBadge } from "@/components/doc-status";
import { Avatar, Card, CardHeader } from "@/components/ui";
import { accounts, dealById, DOC_CATEGORIES, DOC_STATUS, type Doc, type DocCategory, type DocStatus } from "@/lib/data";
import { shortAddress } from "@/lib/format";
import { fmtDateTime, useStore } from "@/lib/store";

const initialsOf = (who: string) => Object.values(accounts).find((a) => a.name === who)?.initials ?? who.split(" ").map((w) => w[0]).join("").slice(0, 2);
const photoOf = (who: string) => Object.values(accounts).find((a) => a.name === who)?.photo;

function NoteCell({ doc }: { doc: Doc }) {
  const { setDocNote } = useStore();
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(doc.note ?? "");
  const save = () => {
    if (text.trim() !== (doc.note ?? "")) setDocNote(doc.id, text);
    setEditing(false);
  };
  if (editing) {
    return (
      <input
        autoFocus
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={save}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
          if (e.key === "Escape") {
            setText(doc.note ?? "");
            setEditing(false);
          }
        }}
        aria-label={`Nota de ${doc.name}`}
        className="w-full min-w-40 rounded-lg border border-navy-100 bg-surface px-2 py-1 text-sm text-ink focus:border-navy focus:outline-none focus:ring-2 focus:ring-sky"
      />
    );
  }
  return (
    <button onClick={() => { setText(doc.note ?? ""); setEditing(true); }} className="group flex w-full min-w-40 items-center gap-1.5 text-left text-sm" aria-label={`Editar nota de ${doc.name}`}>
      <span className={doc.note ? "text-ink" : "text-ink-muted"}>{doc.note ?? "Agregar nota"}</span>
      <Pencil className="h-3.5 w-3.5 shrink-0 text-ink-muted opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden />
    </button>
  );
}

export default function DocumentsPage() {
  const { scoped, role, setDocStatus } = useStore();
  const [cat, setCat] = useState<DocCategory | "all">("all");
  const { docs, isAll, deals } = scoped;
  const deal = deals[0];
  const shown = docs.filter((d) => cat === "all" || d.category === cat).sort((a, b) => DOC_CATEGORIES.indexOf(a.category) - DOC_CATEGORIES.indexOf(b.category) || a.name.localeCompare(b.name));
  const ready = docs.filter((d) => d.status === "firmado" || d.status === "aprobado").length;
  const counts = (Object.keys(DOC_STATUS) as DocStatus[]).map((k) => ({ k, n: docs.filter((d) => d.status === k).length })).filter((c) => c.n);

  return (
    <div className="mx-auto max-w-7xl pb-10">
      <PageHeader title="Documentos" subtitle={isAll ? "Documentos de todos tus negocios" : deal ? `Documentos de ${shortAddress(deal)}` : undefined} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <Card className="order-2 lg:col-span-12">
          <CardHeader title="Estado de documentos" subtitle="Se actualiza desde WhatsApp y desde las tareas" count={shown.length} />
          <div className="flex flex-wrap gap-1.5 border-b border-navy-100 px-5 py-3 sm:px-6" role="group" aria-label="Filtrar por categoría">
            {(["all", ...DOC_CATEGORIES.filter((c) => docs.some((d) => d.category === c))] as const).map((c) => (
              <button key={c} onClick={() => setCat(c)} aria-pressed={cat === c} className={clsx("rounded-full px-3 py-1 text-sm font-semibold", cat === c ? "bg-navy text-white" : "bg-paper text-ink hover:bg-sky")}>
                {c === "all" ? "Todas" : c}
              </button>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wide text-ink-muted">
                  <th scope="col" className="px-5 py-3 font-bold sm:pl-6">Documento</th>
                  {isAll && <th scope="col" className="px-3 py-3 font-bold">Negocio</th>}
                  <th scope="col" className="px-3 py-3 font-bold">Categoría</th>
                  <th scope="col" className="px-3 py-3 font-bold">Estado</th>
                  <th scope="col" className="px-3 py-3 font-bold">Última actualización</th>
                  <th scope="col" className="px-3 py-3 font-bold">Por</th>
                  <th scope="col" className="px-3 py-3 font-bold sm:pr-6">Notas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-100">
                {shown.length === 0 && (
                  <tr><td colSpan={isAll ? 7 : 6} className="px-6 py-10 text-center text-ink-muted">Sin documentos en esta categoría.</td></tr>
                )}
                {shown.map((d) => (
                  <tr key={d.id} className="align-middle">
                    <th scope="row" className="px-5 py-3 font-semibold text-ink sm:pl-6">{d.name}</th>
                    {isAll && <td className="px-3 py-3 text-ink-soft">{(() => { const x = dealById(d.dealId); return x ? shortAddress(x) : ""; })()}</td>}
                    <td className="px-3 py-3 text-ink-soft">{d.category}</td>
                    <td className="px-3 py-3">
                      {role === "agent" ? (
                        <select
                          value={d.status}
                          onChange={(e) => setDocStatus(d.id, e.target.value as DocStatus)}
                          aria-label={`Estado de ${d.name}`}
                          className="rounded-lg border border-navy-100 bg-surface px-2 py-1 text-xs font-semibold text-ink"
                        >
                          {(Object.keys(DOC_STATUS) as DocStatus[]).map((k) => <option key={k} value={k}>{DOC_STATUS[k]}</option>)}
                        </select>
                      ) : (
                        <DocStatusBadge status={d.status} />
                      )}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink-soft">{fmtDateTime(d.updatedAt)}</td>
                    <td className="px-3 py-3">
                      <span className="flex items-center gap-2 whitespace-nowrap">
                        <Avatar initials={initialsOf(d.updatedBy)} src={photoOf(d.updatedBy)} size="sm" />
                        <span className="text-ink">{d.updatedBy}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3 sm:pr-6"><NoteCell doc={d} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card tone="sky" className="order-1 lg:col-span-12">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 p-5">
            <div className="flex items-center gap-4">
              <ProgressRing value={docs.length ? (ready / docs.length) * 100 : 0} size={72} label={`${ready} de ${docs.length} documentos listos`} />
              <p className="text-sm text-ink-soft"><span className="block text-lg font-semibold text-ink">{ready} de {docs.length}</span>firmados o aprobados</p>
            </div>
            <ul className="flex flex-wrap gap-3">
              {counts.map((c) => (
                <li key={c.k} className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-sm ring-1 ring-navy/5">
                  <DocStatusBadge status={c.k} />
                  <span className="font-semibold tabular-nums text-ink">{c.n}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
