import type { ComponentId, Workload, BusinessProcess } from "@/data/schema";

// ============================================================
// Forward blast radius
// ============================================================
// Walk dependencies upward from `startId`: every component whose
// dependency chain eventually reaches `startId` is affected.
// Edge convention: `from` (higher layer) depends on `to` (lower layer),
// so consumers of X are nodes where some edge has toId === X.
export function forwardBlastRadius(
  workload: Workload,
  startId: ComponentId
): {
  affectedComponents: ComponentId[];
  affectedProcesses: ComponentId[];
  totalRevenueAtRiskUsdPerHour: number;
} {
  const visited = new Set<ComponentId>();
  const queue: ComponentId[] = [startId];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const dep of workload.dependencies) {
      if (dep.toId === cur && !visited.has(dep.fromId)) {
        visited.add(dep.fromId);
        queue.push(dep.fromId);
      }
    }
  }
  visited.delete(startId);

  const affectedComponents = Array.from(visited);
  const processIds = new Set(workload.processes.map((p) => p.id));
  const affectedProcesses = affectedComponents.filter((id) =>
    processIds.has(id)
  );

  let totalRevenueAtRiskUsdPerHour = 0;
  for (const pid of affectedProcesses) {
    const p = workload.processes.find((x) => x.id === pid) as
      | BusinessProcess
      | undefined;
    if (!p) continue;
    if (p.revenueAtRisk.unit === "USD/hr") {
      totalRevenueAtRiskUsdPerHour += p.revenueAtRisk.value;
    } else if (p.revenueAtRisk.unit === "USD/day") {
      totalRevenueAtRiskUsdPerHour += p.revenueAtRisk.value / 24;
    }
  }

  return { affectedComponents, affectedProcesses, totalRevenueAtRiskUsdPerHour };
}

// ============================================================
// Reverse dependencies
// ============================================================
// Walk dependencies downward from `processId`: every component the
// process transitively relies on.
export function reverseDependencies(
  workload: Workload,
  processId: ComponentId
): ComponentId[] {
  const visited = new Set<ComponentId>();
  const queue: ComponentId[] = [processId];
  while (queue.length) {
    const cur = queue.shift()!;
    for (const dep of workload.dependencies) {
      if (dep.fromId === cur && !visited.has(dep.toId)) {
        visited.add(dep.toId);
        queue.push(dep.toId);
      }
    }
  }
  visited.delete(processId);
  return Array.from(visited);
}

// ============================================================
// Causal path (BFS shortest path along the directed graph,
// trying both downward (from→to) and upward (to→from) edges).
// ============================================================
export function causalPath(
  workload: Workload,
  fromId: ComponentId,
  toId: ComponentId
): ComponentId[] {
  if (fromId === toId) return [fromId];
  const prev = new Map<ComponentId, ComponentId>();
  const visited = new Set<ComponentId>([fromId]);
  const queue: ComponentId[] = [fromId];

  while (queue.length) {
    const cur = queue.shift()!;
    if (cur === toId) {
      // reconstruct
      const path: ComponentId[] = [cur];
      let p = prev.get(cur);
      while (p) {
        path.unshift(p);
        p = prev.get(p);
      }
      return path;
    }
    for (const dep of workload.dependencies) {
      const neighbor =
        dep.fromId === cur
          ? dep.toId
          : dep.toId === cur
          ? dep.fromId
          : null;
      if (!neighbor || visited.has(neighbor)) continue;
      visited.add(neighbor);
      prev.set(neighbor, cur);
      queue.push(neighbor);
    }
  }
  return [];
}

// ============================================================
// Helpers retained from Phase 1 for Phase 3+ pages
// ============================================================

// Backward-compat shim used by topology blade and propagation cards.
export interface BlastRadius {
  forwardIds: ComponentId[];
  reverseIds: ComponentId[];
}

export function blastRadius(
  workload: Workload,
  seed: ComponentId
): BlastRadius {
  return {
    forwardIds: forwardBlastRadius(workload, seed).affectedComponents,
    reverseIds: reverseDependencies(workload, seed),
  };
}

export function findComponent(workload: Workload, id: ComponentId) {
  return (
    workload.processes.find((p) => p.id === id) ||
    workload.applicationComponents.find((p) => p.id === id) ||
    workload.infrastructureResources.find((p) => p.id === id) ||
    null
  );
}
