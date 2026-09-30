import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { TaskList } from "@/components/task-list";
import { Card, CardHeader, StageBadge } from "@/components/ui";
import { shortAddress } from "@/lib/format";
import { getDeals, tasksFor } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function TasksPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Tareas" subtitle="Todas las tareas de tus ventas y alquileres" />
      <div className="space-y-6">
        {getDeals().map((d) => {
          const ts = tasksFor(d.id);
          if (!ts.length) return null;
          return (
            <Card key={d.id}>
              <CardHeader
                title={shortAddress(d)}
                subtitle={d.buyers.map((b) => b.name).join(", ")}
                action={
                  <Link href={`/ventas/${d.id}`} className="shrink-0">
                    <StageBadge stage={d.stage} />
                  </Link>
                }
              />
              <TaskList initial={ts} buyerName={d.buyers[0]?.name ?? ""} dealId={d.id} />
            </Card>
          );
        })}
      </div>
    </div>
  );
}
