import { CalendarView } from "@/components/calendar-view";
import { TODAY } from "@/lib/data";
import { monthKey } from "@/lib/calendar";

export const metadata = { title: "trato — calendario" };

const valid = (s?: string, re = /^\d{4}-\d{2}(-\d{2})?$/) => (s && re.test(s) ? s : undefined);

export default function CalendarPage({ searchParams }: { searchParams: { m?: string; d?: string } }) {
  const d0 = valid(searchParams.d);
  const ym = valid(searchParams.m, /^\d{4}-\d{2}$/) ?? (d0 && d0.length === 10 ? monthKey(d0) : monthKey(TODAY));
  const selected = d0 && d0.length === 10 && monthKey(d0) === ym ? d0 : monthKey(TODAY) === ym ? TODAY : `${ym}-01`;
  return <CalendarView ym={ym} selected={selected} />;
}
