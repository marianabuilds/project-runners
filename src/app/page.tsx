"use client";

import { AgentDashboard } from "@/components/dashboard-agent";
import { RoleDashboard } from "@/components/dashboard-role";
import { useStore } from "@/lib/store";

export default function Dashboard() {
  const { role } = useStore();
  return role === "agent" ? <AgentDashboard /> : <RoleDashboard />;
}
