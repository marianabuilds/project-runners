"use client";

import { useRef, useState } from "react";
import clsx from "clsx";
import { ImagePlus, Lock, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Avatar, Card, CardHeader } from "@/components/ui";
import { accounts, DOC_CATEGORIES, dealById } from "@/lib/data";
import { fmtShort, pen, shortAddress } from "@/lib/format";
import { useStore } from "@/lib/store";

const field = "mt-1 block w-full rounded-xl border border-navy-100 bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-navy focus:outline-none focus:ring-2 focus:ring-sky";

function Switch({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink">{label}</p>
        {hint && <p className="text-xs text-ink-muted">{hint}</p>}
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={clsx("relative h-6 w-11 shrink-0 rounded-full transition-colors motion-reduce:transition-none", checked ? "bg-navy" : "bg-navy-100")}
      >
        <span className={clsx("absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform motion-reduce:transition-none", checked && "translate-x-5")} />
      </button>
    </div>
  );
}

// Downscale to <=800px JPEG so photos fit in browser storage.
async function toDataUrl(file: File): Promise<string> {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 800 / Math.max(bmp.width, bmp.height));
  const c = document.createElement("canvas");
  c.width = Math.round(bmp.width * scale);
  c.height = Math.round(bmp.height * scale);
  c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", 0.72);
}

export default function ManagePage() {
  const { role, scoped, manage, setDealInfo, addPhotos, removePhoto, setBuyerAccess, setActiveDeal } = useStore();
  const [picked, setPicked] = useState<string | null>(null);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  if (role === "buyer") {
    return (
      <div className="mx-auto max-w-xl rounded-3xl bg-surface p-8 text-center ring-1 ring-navy-100">
        <Lock className="mx-auto h-6 w-6 text-ink-muted" aria-hidden />
        <p className="mt-2 font-semibold text-ink">No tienes acceso a esta sección.</p>
        <p className="mt-1 text-sm text-ink-muted">Solo el agente y el vendedor gestionan el negocio.</p>
      </div>
    );
  }

  const deal = picked ? dealById(picked) : scoped.isAll ? undefined : scoped.deals[0];
  if (!deal) {
    return (
      <div className="mx-auto max-w-7xl pb-10">
        <PageHeader title="Gestionar negocio" subtitle="Elige el negocio que quieres gestionar" />
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {scoped.deals.map((d) => (
            <li key={d.id}>
              <button onClick={() => { setPicked(d.id); setActiveDeal(d.id); }} className="w-full rounded-2xl bg-surface p-4 text-left ring-1 ring-navy-100 hover:bg-sky/50">
                <p className="font-semibold text-ink">{shortAddress(d)}</p>
                <p className="text-sm text-ink-muted">{d.address.district} · {d.buyer.name}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const info = manage[deal.id];
  const acc = info.buyerAccess;
  const managers = [accounts.agent, accounts.seller];

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    const room = 6 - info.photos.length;
    if (room <= 0) return setError("Máximo 6 fotos por negocio.");
    try {
      const urls = await Promise.all(Array.from(files).filter((f) => f.type.startsWith("image/")).slice(0, room).map(toDataUrl));
      if (urls.length) addPhotos(deal.id, urls);
    } catch {
      setError("No pudimos procesar esa imagen. Prueba con otro archivo JPG o PNG.");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="mx-auto max-w-7xl pb-10">
      <PageHeader title="Gestionar negocio" subtitle={`${shortAddress(deal)} · ${deal.address.district}`} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Who has access */}
        <Card tone="navy" className="p-5 sm:p-6 lg:col-span-12">
          <div className="relative flex flex-wrap items-center gap-x-8 gap-y-3">
            <p className="flex items-center gap-2 text-sm font-semibold"><Lock className="h-4 w-4 text-accent" aria-hidden /> Gestionan este negocio</p>
            <ul className="flex flex-wrap gap-3">
              {managers.map((m) => (
                <li key={m.name} className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3">
                  <Avatar initials={m.initials} src={m.photo} size="sm" />
                  <span className="text-sm font-semibold">{m.name}</span>
                  <span className="text-xs text-white/60">{m.label}</span>
                </li>
              ))}
            </ul>
            <p className="text-sm text-white/70">{deal.buyer.name} ve una versión limitada, según los permisos de abajo.</p>
          </div>
        </Card>

        {/* Property info */}
        <Card className="lg:col-span-7">
          <CardHeader title="Información de la propiedad" subtitle="La ven agente, vendedor y comprador (según permisos)" />
          <div className="space-y-4 p-5 sm:p-6">
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
              {[["Dirección", `${shortAddress(deal)}, ${deal.address.district}`], ["Precio", pen(deal.pricePen, 0)], ["Cierre", fmtShort(deal.targetCloseDate)]].map(([k, v]) => (
                <div key={k}><dt className="text-xs text-ink-muted">{k}</dt><dd className="mt-0.5 font-semibold text-ink">{v}</dd></div>
              ))}
            </dl>
            <div>
              <label htmlFor="desc" className="text-sm font-medium text-ink">Descripción</label>
              <textarea id="desc" rows={4} value={info.description} onChange={(e) => setDealInfo(deal.id, { description: e.target.value })} className={field} />
            </div>
            <div>
              <label htmlFor="feat" className="text-sm font-medium text-ink">Características (una por línea)</label>
              <textarea id="feat" rows={4} defaultValue={info.features.join("\n")} key={deal.id} onBlur={(e) => setDealInfo(deal.id, { features: e.target.value.split("\n").map((x) => x.trim()).filter(Boolean) })} className={field} />
            </div>
          </div>
        </Card>

        {/* Buyer permissions */}
        <Card tone="sky" className="lg:col-span-5">
          <CardHeader tone="sky" title={`Qué ve ${deal.buyer.name.split(" ")[0]}`} subtitle="Permisos de la compradora" />
          <div className="divide-y divide-navy/10 px-5 sm:px-6">
            <Switch label="Fotos" hint="Galería de la propiedad" checked={acc.photos} onChange={(v) => setBuyerAccess(deal.id, { photos: v })} />
            <Switch label="Precio de lista y descuento" hint="Si se oculta, solo ve su oferta" checked={acc.listPrice} onChange={(v) => setBuyerAccess(deal.id, { listPrice: v })} />
            <Switch label="Nombre del vendedor" checked={acc.sellerName} onChange={(v) => setBuyerAccess(deal.id, { sellerName: v })} />
            <div className="py-3">
              <p className="text-sm font-semibold text-ink">Documentos por categoría</p>
              <div className="divide-y divide-navy/10">
                {DOC_CATEGORIES.map((c) => (
                  <Switch key={c} label={c} checked={acc.docCategories[c]} onChange={(v) => setBuyerAccess(deal.id, { docCategories: { [c]: v } })} />
                ))}
              </div>
            </div>
          </div>
          <p className="border-t border-navy/10 px-5 py-3 text-xs text-ink-soft sm:px-6">
            Ve: {[acc.photos && "fotos", acc.listPrice && "precio de lista", acc.sellerName && "vendedor", `${DOC_CATEGORIES.filter((c) => acc.docCategories[c]).length} de ${DOC_CATEGORIES.length} categorías de documentos`].filter(Boolean).join(" · ")}.
          </p>
        </Card>

        {/* Photos */}
        <Card className="lg:col-span-12">
          <CardHeader
            title="Fotos"
            count={info.photos.length}
            subtitle="Hasta 6 imágenes"
            action={
              <button onClick={() => fileRef.current?.click()} disabled={info.photos.length >= 6} className="flex items-center gap-1.5 rounded-xl bg-navy px-3 py-2 text-sm font-semibold text-white hover:bg-navy-600 disabled:opacity-40">
                <ImagePlus className="h-4 w-4" aria-hidden /> Agregar fotos
              </button>
            }
          />
          <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" aria-label="Subir fotos" onChange={(e) => onFiles(e.target.files)} />
          {error && <p role="alert" className="px-5 pt-3 text-sm text-red-600 dark:text-red-400 sm:px-6">{error}</p>}
          <ul className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 sm:p-6 lg:grid-cols-6">
            {info.photos.map((src, i) => (
              <li key={i} className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-paper ring-1 ring-navy-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={`Foto ${i + 1} de ${shortAddress(deal)}`} className="h-full w-full object-cover" />
                <button onClick={() => removePhoto(deal.id, i)} aria-label={`Eliminar foto ${i + 1}`} className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-lg bg-surface/90 text-ink shadow hover:bg-surface">
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </li>
            ))}
            {info.photos.length === 0 && (
              <li className="col-span-full rounded-xl border border-dashed border-navy-200 p-8 text-center text-sm text-ink-muted">Aún no hay fotos. Agrega las primeras para que todos las vean.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}
