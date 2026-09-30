import { Calendar } from "@/components/calendar";
import { PageHeader } from "@/components/page-header";
import { shortAddress } from "@/lib/format";
import { getDeals, getEvents, getTasks } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function CalendarioPage() {
  const deals = getDeals();
  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Calendario" subtitle="Eventos y vencimientos de todas tus ventas y alquileres" />
      <Calendar
        deals={deals.map((d) => ({ id: d.id, label: shortAddress(d), kind: d.kind }))}
        events={getEvents().map((e) => ({ id: e.id, name: e.name, date: e.date, type: e.type, dealId: e.dealId }))}
        tasks={getTasks().map((t) => ({ id: t.id, title: t.title, dueDate: t.dueDate, dealId: t.dealId, done: t.status === "completed" }))}
      />
    </div>
  );
}
