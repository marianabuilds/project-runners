import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Card } from "@/components/ui";

const input =
  "mt-1.5 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100";

function Field({ label, id, hint, className, ...props }: { label: string; id: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={className}>
      <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
      <input id={id} name={id} className={input} {...props} />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5 sm:p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </Card>
  );
}

export default function NewDealPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/deals" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All deals
      </Link>
      <PageHeader title="New deal" subtitle="It starts in the Prospect stage. You can invite the buyer now or later." />
      <form className="space-y-6">
        <Section title="Property">
          <Field label="Street" id="street" placeholder="Av. José Larco" className="sm:col-span-2" />
          <Field label="Number" id="number" placeholder="1150" />
          <Field label="District" id="district" placeholder="Miraflores" />
          <Field label="Province" id="province" placeholder="Lima" />
          <Field label="Department" id="department" placeholder="Lima" />
        </Section>
        <Section title="Price & dates">
          <Field label="Offer price (S/)" id="price" inputMode="decimal" placeholder="685,000.00" />
          <Field label="Listing price (S/)" id="listing" inputMode="decimal" placeholder="720,000.00" hint="Optional" />
          <Field label="Target close date" id="close" type="date" hint="Typical: 45–60 days after the offer" />
          <Field label="Seller name" id="seller" placeholder="Jorge Salazar" />
        </Section>
        <Section title="Buyer">
          <Field label="Buyer name" id="buyer" placeholder="Lucía Fernández" />
          <Field label="Buyer email" id="buyerEmail" type="email" placeholder="lucia@example.com" hint="We'll email them an invite link" />
        </Section>
        <div className="flex justify-end gap-3">
          <Link href="/deals" className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-white">Cancel</Link>
          <button type="button" className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
            Create deal
          </button>
        </div>
      </form>
    </div>
  );
}
