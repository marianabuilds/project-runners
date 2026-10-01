"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { TaskList } from "@/components/task-list";
import { Card, CardHeader, StageBadge } from "@/components/ui";
import { useStore } from "@/lib/store";
import { shortAddress } from "@/lib/format";

export default function TasksPage() {
  const { role, deals, visibleTasks } = useStore();
  return (
    <div className="mx-auto max-w-7xl pb-10">
      <PageHeader title="Tareas" subtitle={role === "agent" ? "Cada tarea en tus negocios, con su acción" : "Tus tareas y las de tu agente en este negocio"} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {deals.map((d, n) => {
          const ts = visibleTasks.filter((t) => t.dealId === d.id);
          if (!ts.length) return null;
          const tone = n % 2 ? "sky" : "white";
          return (
            <Card key={d.id} tone={tone} className="lg:col-span-12 xl:col-span-6">
              <CardHeader
                tone={tone}
                title={shortAddress(d)}
                subtitle={role === "agent" ? d.buyer.name : d.address.district}
                action={
                  <Link href={`/deals/${d.id}`} className="shrink-0">
                    <StageBadge stage={d.stage} />
                  </Link>
                }
              />
              <div className="bg-white">
                <TaskList tasks={ts} />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
