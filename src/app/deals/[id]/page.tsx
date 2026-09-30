import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarPlus, Mail, MapPin, Pencil, Phone } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { StageControl } from "@/components/stage-select";
import { TaskList } from "@/components/task-list";
import { Timeline } from "@/components/timeline";
import { Avatar, Card, CardHeader, StageBadge } from "@/components/ui";
import { auditFor, dealById, deals, eventsFor, tasksFor } from "@/lib/data";
import { daysFromToday, fmtDate, fullAddress, pen, shortAddress } from "@/lib/format";

export function generateStaticParams() {
  return deals.map((d) => ({ id: d.id }));
}

function Row({ label, value, emphasis }: { label: string; value: React.ReactNode; emphasis?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5">
      <dt className={emphasis ? "font-semibold text-slate-900" : "text-slate-600"}>{label}</dt>
      <dd className={`text-right tabular-nums ${emphasis ? "font-semibold text-slate-900" : "text-slate-900"}`}>{value}</dd>
    </div>
  );
}

export default function DealPage({ params }: { params: { id: string } }) {
  const deal = dealById(params.id);
  if (!deal) notFound();
  const tasks = tasksFor(deal.id);
  const events = eventsFor(deal.id);
  const activity = auditFor(deal.id);
  const openTasks = tasks.filter((t) => t.status !== "completed").length;
  const daysToClose = daysFromToday(deal.targetCloseDate);

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/deals" className="mb-4 inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All deals
      </Link>
      <PageHeader
        title={shortAddress(deal)}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <MapPin className="h-4 w-4" aria-hidden /> {deal.address.district}, {deal.address.province}
            <StageBadge stage={deal.stage} />
          </span>
        }
      >
        <button className="mr-2 hidden items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 sm:flex">
          <Pencil className="h-4 w-4" aria-hidden /> Edit deal
        </button>
      </PageHeader>

      {/* Summary strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Price", value: pen(deal.pricePen, 0) },
          { label: "Target close", value: fmtDate(deal.targetCloseDate).replace(/^\w+, /, "") },
          { label: "Days to close", value: daysToClose },
          { label: "Open tasks", value: openTasks },
        ].map((s) => (
          <Card key={s.label} className="px-4 py-3">
            <p className="text-xs text-slate-500">{s.label}</p>
            <p className="mt-1 text-lg font-semibold tabular-nums text-slate-900">{s.value}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <StageControl initial={deal.stage} />
          </Card>

          <Card>
            <CardHeader title="Tasks" count={tasks.length} />
            <TaskList initial={tasks} buyerName={deal.buyer.name} />
          </Card>

          <Card>
            <CardHeader
              title="Activity"
              subtitle="Stage and task changes, visible only to you"
            />
            {activity.length ? (
              <ul className="divide-y divide-slate-100">
                {activity.map((a) => (
                  <li key={a.id} className="flex flex-col gap-0.5 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <p className="text-sm text-slate-800">
                      <span className="font-medium">{a.who}</span> · {a.what}
                    </p>
                    <p className="text-xs text-slate-500">{new Date(a.when).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-6 py-8 text-center text-sm text-slate-500">No activity yet.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader
              title="Timeline"
              action={
                <button className="flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800">
                  <CalendarPlus className="h-4 w-4" aria-hidden /> Add to calendar
                </button>
              }
            />
            <Timeline events={events} />
          </Card>

          <Card>
            <CardHeader title="Deal details" />
            <dl className="divide-y divide-slate-100 px-5 py-2 text-sm sm:px-6">
              <Row label="Offer price" value={pen(deal.pricePen)} emphasis />
              {deal.listingPricePen && <Row label="Listing price" value={pen(deal.listingPricePen)} />}
              {deal.listingPricePen && (
                <Row label="Below listing" value={<span className="text-emerald-700">−{pen(deal.listingPricePen - deal.pricePen)}</span>} />
              )}
              <Row label="Seller" value={deal.sellerName} />
              <Row label="Address" value={fullAddress(deal)} />
            </dl>
          </Card>

          <Card>
            <CardHeader title="Buyer" />
            <div className="flex items-center gap-3 px-5 pt-4 sm:px-6">
              <Avatar initials={deal.buyer.initials} size="lg" />
              <div>
                <p className="font-medium text-slate-900">{deal.buyer.name}</p>
                <p className="text-sm text-emerald-700">Invite accepted</p>
              </div>
            </div>
            <div className="space-y-2 px-5 py-4 text-sm sm:px-6">
              <a href={`mailto:${deal.buyer.email}`} className="flex items-center gap-2 text-slate-700 hover:text-blue-700">
                <Mail className="h-4 w-4 text-slate-400" aria-hidden /> {deal.buyer.email}
              </a>
              <a href={`tel:${deal.buyer.phone.replace(/\s/g, "")}`} className="flex items-center gap-2 text-slate-700 hover:text-blue-700">
                <Phone className="h-4 w-4 text-slate-400" aria-hidden /> {deal.buyer.phone}
              </a>
            </div>
          </Card>

          <Card>
            <CardHeader title="Private notes" subtitle="Buyer can't see this" />
            <p className="px-5 py-4 text-sm leading-relaxed text-slate-700 sm:px-6">{deal.notes}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
