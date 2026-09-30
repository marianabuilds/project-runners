"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import clsx from "clsx";
import { Plus, Trash2, UserPlus } from "lucide-react";
import type { BuyerRole, DealKind } from "@/lib/data";
import { api } from "@/lib/client";
import { Card } from "./ui";

const input =
  "mt-2 block min-h-[56px] w-full rounded-2xl bg-white px-4 text-lg text-cafe-900 ring-2 ring-miel-200 placeholder:text-cafe-300 focus:outline-none focus:ring-4 focus:ring-cafe-600";

function Field({ label, id, hint, className, ...props }: { label: string; id: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-lg font-semibold text-cafe-900">{label}</label>
      <input id={id} name={id} className={input} {...props} />
      {hint && <p className="mt-1 text-sm text-cafe-700">{hint}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="mb-4 text-2xl text-cafe-900">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </Card>
  );
}

type BuyerRow = { name: string; email: string; phone: string };

export function NewVentaForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [kind, setKind] = useState<DealKind>("venta");
  const [buyers, setBuyers] = useState<BuyerRow[]>([{ name: "", email: "", phone: "" }]);
  const who = kind === "venta" ? "comprador" : "inquilino";

  const setBuyer = (i: number, patch: Partial<BuyerRow>) => setBuyers((bs) => bs.map((b, j) => (j === i ? { ...b, ...patch } : b)));

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const g = (k: string) => String(f.get(k) ?? "").trim();
    start(async () => {
      const deal = await api({
        type: "deal-create",
        kind,
        address: { street: g("street"), number: g("number"), district: g("district"), province: g("province"), department: g("department") },
        pricePen: Number(g("price").replace(/,/g, "")) || 0,
        listingPricePen: Number(g("listing").replace(/,/g, "")) || undefined,
        targetCloseDate: g("close") || "2026-12-31",
        sellerName: g("seller"),
        buyers,
      });
      router.push(`/ventas/${deal.id}`);
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Card className="p-5 sm:p-6">
        <h2 className="mb-3 text-2xl text-cafe-900">Tipo de operación</h2>
        <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Tipo de operación">
          {(["venta", "alquiler"] as const).map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={kind === k}
              onClick={() => setKind(k)}
              className={clsx("min-h-[56px] rounded-2xl px-4 text-lg font-semibold ring-2", kind === k ? "bg-miel-300 text-cafe-900 ring-cafe-600" : "bg-white text-cafe-800 ring-miel-200 hover:bg-miel-50")}
            >
              {k === "venta" ? "Venta" : "Alquiler"}
            </button>
          ))}
        </div>
      </Card>
      <Section title="Propiedad">
        <Field label="Calle" id="street" placeholder="Av. José Larco" className="sm:col-span-2" required />
        <Field label="Número" id="number" placeholder="1150" />
        <Field label="Distrito" id="district" placeholder="Miraflores" />
        <Field label="Provincia" id="province" placeholder="Lima" />
        <Field label="Departamento" id="department" placeholder="Lima" />
      </Section>
      <Section title="Precio y fechas">
        <Field label={kind === "venta" ? "Precio de oferta (S/)" : "Renta mensual (S/)"} id="price" inputMode="decimal" placeholder={kind === "venta" ? "685,000" : "3,800"} />
        <Field label={kind === "venta" ? "Precio de lista (S/)" : "Renta publicada (S/)"} id="listing" inputMode="decimal" hint="Opcional" />
        <Field label={kind === "venta" ? "Fecha de cierre objetivo" : "Inicio del contrato"} id="close" type="date" />
        <Field label={kind === "venta" ? "Vendedor" : "Propietario"} id="seller" placeholder="Jorge Salazar" />
      </Section>
      <Card className="p-5 sm:p-6">
        <h2 className="mb-1 text-2xl text-cafe-900">{kind === "venta" ? "Compradores" : "Inquilinos"}</h2>
        <p className="mb-4 text-base text-cafe-700">Puedes agregar varias personas; la primera será la principal.</p>
        <div className="space-y-4">
          {buyers.map((b, i) => (
            <div key={i} className="grid gap-3 rounded-xl bg-miel-50 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <Field label={`Nombre (${who} ${i + 1})`} id={`b-name-${i}`} value={b.name} onChange={(e) => setBuyer(i, { name: e.target.value })} />
              <Field label="Correo" id={`b-email-${i}`} type="email" value={b.email} onChange={(e) => setBuyer(i, { email: e.target.value })} />
              <Field label="WhatsApp" id={`b-phone-${i}`} type="tel" placeholder="+51 9…" value={b.phone} onChange={(e) => setBuyer(i, { phone: e.target.value })} />
              {buyers.length > 1 && (
                <button type="button" onClick={() => setBuyers((bs) => bs.filter((_, j) => j !== i))} className="self-end rounded-xl p-2.5 text-cafe-700 hover:bg-white" aria-label={`Quitar ${who} ${i + 1}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={() => setBuyers((bs) => [...bs, { name: "", email: "", phone: "" }])} className="mt-3 flex items-center gap-1.5 text-base font-medium text-cafe-600 hover:text-cafe-800">
          <Plus className="h-4 w-4" aria-hidden /> Agregar otro {who}
        </button>
      </Card>
      <div className="flex justify-end gap-3">
        <a href="/ventas" className="inline-flex min-h-[56px] items-center rounded-2xl bg-miel-300 px-6 text-lg font-semibold text-cafe-900 hover:bg-miel-400">Cancelar</a>
        <button type="submit" disabled={pending} className="min-h-[56px] rounded-2xl bg-cafe-600 px-6 text-lg font-semibold text-white hover:bg-cafe-700 disabled:opacity-50">
          {pending ? "Creando…" : kind === "venta" ? "Crear venta" : "Crear alquiler"}
        </button>
      </div>
    </form>
  );
}

export function AddBuyerForm({ dealId, kind }: { dealId: string; kind: DealKind }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [f, setF] = useState({ name: "", phone: "", email: "", role: "co-comprador" as BuyerRole });
  const who = kind === "venta" ? "comprador" : "inquilino";
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="flex items-center gap-1.5 text-base font-medium text-cafe-600 hover:text-cafe-800">
        <UserPlus className="h-4 w-4" aria-hidden /> Agregar {who}
      </button>
    );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!f.name.trim()) return;
        start(async () => {
          await api({ type: "buyer-add", dealId, ...f });
          setF({ name: "", phone: "", email: "", role: "co-comprador" });
          setOpen(false);
          router.refresh();
        });
      }}
      className="space-y-2"
    >
      <input autoFocus value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Nombre completo" aria-label="Nombre" className="w-full rounded-xl border border-miel-200 px-3 py-2 text-base" />
      <div className="grid grid-cols-2 gap-2">
        <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="WhatsApp" aria-label="WhatsApp" type="tel" className="rounded-xl border border-miel-200 px-3 py-2 text-base" />
        <select value={f.role} onChange={(e) => setF({ ...f, role: e.target.value as BuyerRole })} aria-label="Rol" className="rounded-xl border border-miel-200 px-2 py-2 text-base">
          <option value="principal">Principal</option>
          <option value="co-comprador">Co-{who}</option>
          <option value="interesado">Interesado</option>
        </select>
      </div>
      <input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="Correo (opcional)" aria-label="Correo" type="email" className="w-full rounded-xl border border-miel-200 px-3 py-2 text-base" />
      <div className="flex gap-2">
        <button type="submit" disabled={pending} className="rounded-xl bg-cafe-600 px-3 py-1.5 text-base font-medium text-white hover:bg-cafe-700 disabled:opacity-50">Agregar</button>
        <button type="button" onClick={() => setOpen(false)} className="rounded-xl px-3 py-1.5 text-base text-cafe-800 hover:bg-miel-50">Cancelar</button>
      </div>
    </form>
  );
}
