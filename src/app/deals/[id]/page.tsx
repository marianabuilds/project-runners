import { notFound } from "next/navigation";
import { DealView } from "@/components/deal-view";
import { dealById, deals } from "@/lib/data";

export function generateStaticParams() {
  return deals.map((d) => ({ id: d.id }));
}

export default function DealPage({ params }: { params: { id: string } }) {
  if (!dealById(params.id)) notFound();
  return <DealView id={params.id} />;
}
