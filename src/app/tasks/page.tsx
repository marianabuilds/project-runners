import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { TaskList } from "@/components/task-list";
import { Card, CardHeader, StageBadge } from "@/components/ui";
import { deals, tasksFor } from "@/lib/data";
import { shortAddress } from "@/lib/format";

export default function TasksPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Tasks" subtitle="Every task across your deals" />
      <div className="space-y-6">
        {deals.map((d) => {
          const ts = tasksFor(d.id);
          if (!ts.length) return null;
          return (
            <Card key={d.id}>
              <CardHeader
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
