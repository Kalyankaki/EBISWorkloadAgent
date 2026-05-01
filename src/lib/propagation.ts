import type { ComponentId, Workload } from "@/data/schema";

export interface BlastRadius {
  forwardIds: ComponentId[]; // upstream consumers (processes that depend on the seed)
  reverseIds: ComponentId[]; // downstream dependencies (infra the seed relies on)
}

export function blastRadius(
  workload: Workload,
  seed: ComponentId
): BlastRadius {
  // Forward: walk fromId where toId === seed (i.e. who depends on seed)
  const forward = new Set<ComponentId>();
  const reverse = new Set<ComponentId>();

  const queueF: ComponentId[] = [seed];
  while (queueF.length) {
    const cur = queueF.shift()!;
    for (const dep of workload.dependencies) {
      if (dep.toId === cur && !forward.has(dep.fromId)) {
        forward.add(dep.fromId);
        queueF.push(dep.fromId);
      }
    }
  }

  const queueR: ComponentId[] = [seed];
  while (queueR.length) {
    const cur = queueR.shift()!;
    for (const dep of workload.dependencies) {
      if (dep.fromId === cur && !reverse.has(dep.toId)) {
        reverse.add(dep.toId);
        queueR.push(dep.toId);
      }
    }
  }

  forward.delete(seed);
  reverse.delete(seed);

  return {
    forwardIds: Array.from(forward),
    reverseIds: Array.from(reverse),
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
