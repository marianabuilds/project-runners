import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { TaskList } from "@/components/task-list";
import { Card, CardHeader, StageBadge } from "@/components/ui";
import { deals, tasksFor } from "@/lib/data";
import { shortAddress } from "@/lib/format";

export default function TasksPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Pendientes" subtitle="Todo lo que falta, venta por venta" />
      <div className="space-y-8">
        {deals.map((d) => {
          const ts = tasksFor(d.id);
          if (!ts.length) return null;
          return (
            <Card key={d.id}>
              <CardHeader
                title={shortAddress(d)}
                subtitle={`Cliente: ${d.buyer.name}`}
                action={
                  <Link href={`/deals/${d.id}`} className="shrink-0" aria-label={`Ver la venta de ${shortAddress(d)}`}>
                    <StageBadge stage={d.stage} />
                  </Link>
                }
              />
              <TaskList initial={ts} buyerName={d.buyer.name} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
