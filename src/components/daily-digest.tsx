"use client";

import { Activity, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardHeader } from "@/components/ui";
import { type Task, type AuditEntry } from "@/lib/data";
import { fmtDateTime } from "@/lib/store";
import clsx from "clsx";

const IconBox = ({ children, className }: { children: React.ReactNode; className: string }) => (
  <span className={clsx("grid h-10 w-10 shrink-0 place-items-center rounded-xl", className)} aria-hidden>
    {children}
  </span>
);

interface DailyDigestProps {
  tasks: Task[];
  activities: AuditEntry[];
  today: string;
}

export function DailyDigest({ tasks, activities, today }: DailyDigestProps) {
  const todaysTasks = tasks.filter((t) => t.dueDate === today);
  const todaysActivities = activities.filter((a) => a.when.startsWith(today));

  const completed = todaysTasks.filter((t) => t.status === "completed").length;
  const pending = todaysTasks.filter((t) => t.status === "pending").length;
  const inProgress = todaysTasks.filter((t) => t.status === "in_progress").length;

  if (todaysTasks.length === 0 && todaysActivities.length === 0) {
    return null;
  }

  return (
    <Card tone="sun" className="lg:col-span-12">
      <CardHeader
        tone="sun"
        title="Resumen del día"
        subtitle={`${todaysTasks.length} tareas · ${todaysActivities.length} actividades`}
        icon={<IconBox className="bg-accent text-on-accent ring-1 ring-navy/10"><Clock className="h-5 w-5" /></IconBox>}
      />
      <div className="space-y-4 p-4 sm:p-6">
        {/* Stats */}
        {todaysTasks.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white/40 p-3">
              <p className="text-xs text-ink-soft">Por hacer</p>
              <p className="mt-1 text-lg font-semibold text-ink">{pending}</p>
            </div>
            <div className="rounded-xl bg-white/40 p-3">
              <p className="text-xs text-ink-soft">En progreso</p>
              <p className="mt-1 text-lg font-semibold text-ink">{inProgress}</p>
            </div>
            <div className="rounded-xl bg-white/40 p-3">
              <p className="text-xs text-ink-soft">Completadas</p>
              <p className="mt-1 text-lg font-semibold text-ink">{completed}</p>
            </div>
          </div>
        )}

        {/* Today's tasks */}
        {todaysTasks.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-ink">Tareas de hoy</h3>
            <ul className="mt-2 space-y-2">
              {todaysTasks.map((t) => (
                <li key={t.id} className="flex items-start gap-3 rounded-lg bg-white/30 p-3">
                  <div className="mt-1 shrink-0">
                    {t.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden />
                    ) : t.status === "in_progress" ? (
                      <Clock className="h-4 w-4 text-blue-600" aria-hidden />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-600" aria-hidden />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={clsx("text-sm", t.status === "completed" ? "line-through text-ink-muted" : "text-ink")}>
                      {t.title}
                    </p>
                    <p className="text-xs text-ink-muted">{t.assignee}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recent activities */}
        {todaysActivities.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-ink">Actividad reciente</h3>
            <ul className="mt-2 space-y-2">
              {todaysActivities.slice(0, 4).map((a) => (
                <li key={a.id} className="flex items-center gap-3 rounded-lg bg-white/30 p-3">
                  <Activity className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink">
                      <span className="font-medium">{a.who}</span> · {a.what}
                    </p>
                    <p className="text-xs text-ink-muted">{fmtDateTime(a.when)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  );
}
