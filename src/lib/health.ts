import type {
  ComponentId,
  HealthStatus,
  ScenarioState,
  SignalSnapshot,
  Workload,
} from "@/data/schema";
import { reverseDependencies } from "./propagation";

const ORDER: HealthStatus[] = ["unknown", "healthy", "warning", "critical"];

// Worst-wins rollup of an arbitrary list of statuses.
export function rollupHealth(statuses: HealthStatus[]): HealthStatus {
  if (statuses.length === 0) return "unknown";
  let worst: HealthStatus = "healthy";
  for (const s of statuses) {
    if (ORDER.indexOf(s) > ORDER.indexOf(worst)) worst = s;
  }
  return worst;
}

export function worse(a: HealthStatus, b: HealthStatus): HealthStatus {
  return ORDER.indexOf(a) > ORDER.indexOf(b) ? a : b;
}

// Workload-wide health = worst across all process healths.
export function workloadOverallHealth(
  workload: Workload,
  signals: SignalSnapshot
): HealthStatus {
  return rollupHealth(
    workload.processes.map((p) => processHealth(workload, p.id, signals))
  );
}

// Process health = worst of (the process's own signal) ∪ (rollup of every component it depends on).
export function processHealth(
  workload: Workload,
  processId: ComponentId,
  signals: SignalSnapshot
): HealthStatus {
  const direct = signals[processId]?.health ?? "healthy";
  const deps = reverseDependencies(workload, processId);
  const depHealths = deps.map((id) => signals[id]?.health ?? "healthy");
  return rollupHealth([direct, ...depHealths]);
}

export function HEALTH_LABEL(s: HealthStatus): string {
  return s === "healthy"
    ? "Healthy"
    : s === "warning"
    ? "Warning"
    : s === "critical"
    ? "Critical"
    : "Unknown";
}

export function HEALTH_COLOR(s: HealthStatus): string {
  return s === "healthy"
    ? "#5db85d"
    : s === "warning"
    ? "#f0a020"
    : s === "critical"
    ? "#e35454"
    : "#a19f9d";
}

// Convenience used by Phase 3+ pages.
export function processesAtRisk(
  workload: Workload,
  state: ScenarioState
): number {
  return workload.processes.filter((p) => {
    const h = processHealth(workload, p.id, state.signals);
    return h === "warning" || h === "critical";
  }).length;
}

export function conformancePct(workload: Workload): number {
  const matching = workload.infrastructureResources.filter(
    (r) => r.matchesReference
  ).length;
  const total = workload.infrastructureResources.length;
  return Math.round((matching / Math.max(1, total)) * 100);
}
