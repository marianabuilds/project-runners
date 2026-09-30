import Link from "next/link";
import { UserRound } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { TaskList } from "@/components/task-list";
import { Button, Card, CardHeader, KindBadge, StageBadge } from "@/components/ui";
import { buyerSummary, shortAddress } from "@/lib/format";
import { getDeals, tasksFor } from "@/lib/store";

export const dynamic = "force-dynamic";

export default function TasksPage() {
  return (
    <div className="container-page">
      <PageHeader title="Pendientes" subtitle="Todo lo que falta, venta por venta">
        <Button href="/mis-pendientes" variant="secondary"><UserRound className="h-6 w-6" aria-hidden /> Solo lo mío</Button>
      </PageHeader>
      <div className="space-y-8">
        {getDeals().map((d) => {
          const ts = tasksFor(d.id);
          if (!ts.length) return null;
          return (
            <Card key={d.id}>
              <CardHeader
                title={shortAddress(d)}
                subtitle={`Cliente: ${buyerSummary(d)}`}
                action={
                  <Link href={`/ventas/${d.id}`} className="flex shrink-0 items-center gap-2" aria-label={`Ver la venta de ${shortAddress(d)}`}>
                    <KindBadge kind={d.kind} />
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
