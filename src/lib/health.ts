import type { HealthStatus, ScenarioState, Workload } from "@/data/schema";

const order: HealthStatus[] = ["unknown", "healthy", "warning", "critical"];

export function worse(a: HealthStatus, b: HealthStatus): HealthStatus {
  return order.indexOf(a) > order.indexOf(b) ? a : b;
}

export function rollupHealth(workload: Workload, state: ScenarioState): HealthStatus {
  let h: HealthStatus = "healthy";
  for (const id of Object.keys(state.signals)) {
    h = worse(h, state.signals[id]?.health ?? "unknown");
  }
  return h;
}

export function processesAtRisk(workload: Workload, state: ScenarioState): number {
  return workload.processes.filter((p) => {
    const sig = state.signals[p.id];
    return sig?.health === "warning" || sig?.health === "critical";
  }).length;
}

export function conformancePct(workload: Workload): number {
  const items = [
    ...workload.applicationComponents,
    ...workload.infrastructureResources,
  ];
  const matching = workload.infrastructureResources.filter((r) => r.matchesReference).length;
  const totalInfra = workload.infrastructureResources.length;
  return Math.round((matching / Math.max(1, totalInfra)) * 100);
}
