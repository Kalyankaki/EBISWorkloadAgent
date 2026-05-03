import type {
  ComponentSignal,
  HealthStatus,
  ScenarioState,
  ScenarioStepId,
  SignalSnapshot,
  WorkloadId,
} from "./schema";
import { getWorkload } from "./workloads";

const SERIES_LEN = 300;

// Deterministic seeded sin wave + per-step modulation.
function seededSeries(
  componentId: string,
  stepId: ScenarioStepId,
  baseline: number,
  peak: number
): { t: number; v: number }[] {
  const seed = hash(componentId + ":" + stepId);
  const arr: { t: number; v: number }[] = [];
  for (let i = 0; i < SERIES_LEN; i++) {
    const ramp =
      stepId === "incident" || stepId === "impact"
        ? Math.min(1, i / 60)
        : stepId === "early"
        ? Math.min(0.5, i / 200)
        : stepId === "resolved"
        ? Math.max(0, 1 - i / 100)
        : 0;
    const wave = 0.5 + 0.5 * Math.sin((i + seed % 50) * 0.13);
    const noise = (((seed * 9301 + 49297 + i * 7) % 233280) / 233280 - 0.5);
    const span = peak - baseline;
    const v = baseline + ramp * span + (wave * 0.04 + noise * 0.05) * span;
    arr.push({ t: i, v: Math.max(0, v) });
  }
  return arr;
}

function hash(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h;
}

function allHealthyState(
  workload: ReturnType<typeof getWorkload>,
  stepId: ScenarioStepId
): ScenarioState {
  const signals: SignalSnapshot = {};
  if (!workload) return { stepId, signals, activeIncidentIds: [] };
  for (const c of [
    ...workload.processes,
    ...workload.applicationComponents,
    ...workload.infrastructureResources,
  ]) {
    signals[c.id] = { componentId: c.id, health: "healthy" };
  }
  return { stepId, signals, activeIncidentIds: [] };
}

function ebsProdScenarioState(
  workload: NonNullable<ReturnType<typeof getWorkload>>,
  stepId: ScenarioStepId
): ScenarioState {
  const signals: SignalSnapshot = {};

  // Default healthy for everything
  for (const c of [
    ...workload.processes,
    ...workload.applicationComponents,
    ...workload.infrastructureResources,
  ]) {
    signals[c.id] = { componentId: c.id, health: "healthy" };
  }

  const set = (sig: ComponentSignal) => {
    signals[sig.componentId] = sig;
  };

  switch (stepId) {
    case "steady": {
      set({
        componentId: "stg-redo",
        health: "healthy",
        note: "Write latency P95 4ms · IOPS 8.4k/20k",
        unit: "ms",
        series: seededSeries("stg-redo", "steady", 4, 4),
      });
      set({
        componentId: "odba-rac",
        health: "healthy",
        note: "Cache hit 99.2% · log file sync 4%",
        unit: "%",
        series: seededSeries("odba-rac", "steady", 4, 4),
      });
      set({
        componentId: "cm",
        health: "healthy",
        note: "Queue 320 · throughput 4,200/hr",
        unit: "depth",
        series: seededSeries("cm", "steady", 320, 320),
      });
      break;
    }

    case "early": {
      set({
        componentId: "stg-redo",
        health: "warning",
        note: "Write latency P95 climbing · 4ms → 9ms · IOPS 16k/20k",
        unit: "ms",
        series: seededSeries("stg-redo", "early", 4, 9),
      });
      set({
        componentId: "odba-rac",
        health: "warning",
        note: "log file sync wait class trending up · 4% → 18%",
        unit: "%",
        series: seededSeries("odba-rac", "early", 4, 18),
      });
      set({
        componentId: "cm",
        health: "warning",
        note: "Queue depth climbing · 320 → 1,820",
        unit: "depth",
        series: seededSeries("cm", "early", 320, 1820),
      });
      break;
    }

    case "incident": {
      set({
        componentId: "stg-redo",
        health: "critical",
        note: "IOPS throttled at 20k · write latency P95 18ms",
        unit: "ms",
        series: seededSeries("stg-redo", "incident", 4, 18),
      });
      set({
        componentId: "odba-rac",
        health: "warning",
        note: "log file sync 72% · node 2 at risk",
        unit: "%",
        series: seededSeries("odba-rac", "incident", 4, 72),
      });
      set({
        componentId: "cm",
        health: "critical",
        note: "Queue 4,210 · workers stalled on log file sync",
        unit: "depth",
        series: seededSeries("cm", "incident", 320, 4210),
      });
      set({
        componentId: "gl",
        health: "warning",
        note: "GL_INTERFACE backlog 18,400 rows",
      });
      set({
        componentId: "wf",
        health: "warning",
        note: "Deferred queue climbing · approval routing slowed",
      });
      set({
        componentId: "gl-close",
        health: "warning",
        note: "Close trajectory at risk vs 8h SLO",
      });
      set({
        componentId: "ap-val",
        health: "warning",
        note: "AP validation lag 22 min vs 30 min target",
      });
      set({
        componentId: "cm-batch",
        health: "warning",
        note: "Throughput 1,800/hr vs 4,200/hr baseline",
      });
      break;
    }

    case "impact": {
      set({
        componentId: "stg-redo",
        health: "critical",
        note: "IOPS bump in flight · write latency 22ms",
        unit: "ms",
        series: seededSeries("stg-redo", "impact", 4, 22),
      });
      set({
        componentId: "odba-rac",
        health: "critical",
        note: "Node 2 evicted · running on node 1 only",
        unit: "%",
        series: seededSeries("odba-rac", "impact", 4, 88),
      });
      set({
        componentId: "cm",
        health: "critical",
        note: "Workers reduced to 12 · queue 4,800",
        unit: "depth",
        series: seededSeries("cm", "impact", 320, 4800),
      });
      set({ componentId: "gl", health: "critical", note: "Close batch lagging 38 min behind plan" });
      set({ componentId: "wf", health: "warning", note: "Deferred queue 4,100 · catching up" });
      set({
        componentId: "gl-close",
        health: "critical",
        note: "$4.2M/day revenue at risk · Finance comms drafted",
      });
      set({ componentId: "fin-report", health: "warning", note: "Day 5 close window narrowing" });
      set({ componentId: "ap-val", health: "warning", note: "AP validation lag 27 min" });
      set({ componentId: "cm-batch", health: "critical", note: "Throughput 1,200/hr · backlog growing" });
      set({ componentId: "mrp", health: "warning", note: "Tonight's MRP run paused to free CM workers" });
      break;
    }

    case "resolved": {
      set({
        componentId: "stg-redo",
        health: "healthy",
        note: "Premium SSD v2 applied · IOPS 9.2k/32k · latency 4ms",
        unit: "ms",
        series: seededSeries("stg-redo", "resolved", 4, 4),
      });
      set({
        componentId: "odba-rac",
        health: "healthy",
        note: "Both nodes online · log file sync back to 5%",
        unit: "%",
        series: seededSeries("odba-rac", "resolved", 4, 4),
      });
      set({
        componentId: "cm",
        health: "warning",
        note: "Catching up · queue 1,100 draining",
        unit: "depth",
        series: seededSeries("cm", "resolved", 320, 1100),
      });
      set({ componentId: "gl", health: "warning", note: "Backlog 4,200 rows · processing" });
      set({
        componentId: "gl-close",
        health: "warning",
        note: "Projected 7h 42m completion · within 8h SLO",
      });
      break;
    }
  }

  return {
    stepId,
    signals,
    activeIncidentIds:
      stepId === "incident" || stepId === "impact" || stepId === "resolved"
        ? ["INC-4471"]
        : [],
  };
}

export function getScenarioState(
  workloadId: WorkloadId,
  stepId: ScenarioStepId
): ScenarioState {
  const wl = getWorkload(workloadId);
  if (!wl) return { stepId, signals: {}, activeIncidentIds: [] };

  if (workloadId === "ebs-uat") return allHealthyState(wl, stepId);
  if (workloadId === "ebs-prod") return ebsProdScenarioState(wl, stepId);

  return allHealthyState(wl, stepId);
}

// Re-export SCENARIO_STEPS from archetypes for back-compat with Phase 1 imports.
export { SCENARIO_STEPS } from "./archetypes";
