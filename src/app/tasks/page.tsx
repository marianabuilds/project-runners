import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { TaskList } from "@/components/task-list";
import { Card, CardHeader, StageBadge } from "@/components/ui";
import { deals, tasksFor } from "@/lib/data";
import { shortAddress } from "@/lib/format";

export default function TasksPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Tareas" subtitle="Cada tarea en tus negocios" />
      <div className="space-y-5">
        {deals.map((d, n) => {
          const ts = tasksFor(d.id);
          if (!ts.length) return null;
          return (
            <Card key={d.id} tone={n % 2 ? "sky" : "white"}>
              <CardHeader
                tone={n % 2 ? "sky" : "white"}
                title={shortAddress(d)}
                subtitle={d.buyer.name}
                action={
                  <Link href={`/deals/${d.id}`} className="shrink-0">
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
