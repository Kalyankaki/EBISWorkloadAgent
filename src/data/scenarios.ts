import type {
  ComponentSignal,
  ScenarioState,
  ScenarioStepId,
  SignalSnapshot,
  WorkloadId,
} from "./schema";
import { getWorkload } from "./workloads";

// Build a deterministic time series based on (componentId, stepId, length).
function tsFor(componentId: string, stepId: ScenarioStepId, baseline: number, peak: number, length = 30): { t: number; v: number }[] {
  const seed = hash(componentId + stepId);
  const arr: { t: number; v: number }[] = [];
  for (let i = 0; i < length; i++) {
    const ramp =
      stepId === "incident" || stepId === "impact"
        ? Math.min(1, i / 10)
        : stepId === "early"
        ? Math.min(0.5, i / 30)
        : stepId === "resolved"
        ? Math.max(0, 1 - i / 20)
        : 0;
    const noise = ((seed + i * 7) % 100) / 100 - 0.5;
    const v = baseline + ramp * (peak - baseline) + noise * (peak - baseline) * 0.06;
    arr.push({ t: i, v: Math.max(0, v) });
  }
  return arr;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function getScenarioState(
  workloadId: WorkloadId,
  stepId: ScenarioStepId
): ScenarioState {
  const workload = getWorkload(workloadId);
  const signals: SignalSnapshot = {};

  // Default healthy
  for (const c of [
    ...workload.processes,
    ...workload.applicationComponents,
    ...workload.infrastructureResources,
  ]) {
    signals[c.id] = { componentId: c.id, health: "healthy" };
  }

  if (workloadId !== "ebs-prod") {
    return { stepId, signals, activeIncidentIds: [] };
  }

  // Inject scenario-specific signals for ebs-prod
  switch (stepId) {
    case "steady":
      signals["i-stg-redo"] = {
        componentId: "i-stg-redo",
        health: "healthy",
        note: "Write latency P95 4ms · IOPS 2,100/5,000",
        unit: "ms",
        series: tsFor("i-stg-redo", "steady", 4, 4),
      };
      signals["i-odba-rac"] = {
        componentId: "i-odba-rac",
        health: "healthy",
        note: "Cache hit 99.2% · log file sync 4%",
        unit: "%",
        series: tsFor("i-odba-rac", "steady", 4, 4),
      };
      signals["a-cm"] = {
        componentId: "a-cm",
        health: "healthy",
        note: "Queue 320 · throughput 4,200/hr",
        unit: "depth",
        series: tsFor("a-cm", "steady", 320, 320),
      };
      break;

    case "early":
      signals["i-stg-redo"] = {
        componentId: "i-stg-redo",
        health: "warning",
        note: "Write latency P95 climbing · 4ms → 9ms · IOPS 4,100/5,000",
        unit: "ms",
        series: tsFor("i-stg-redo", "early", 4, 9),
      };
      signals["i-odba-rac"] = {
        componentId: "i-odba-rac",
        health: "warning",
        note: "log file sync wait class trending up · 4% → 18%",
        unit: "%",
        series: tsFor("i-odba-rac", "early", 4, 18),
      };
      signals["a-cm"] = {
        componentId: "a-cm",
        health: "warning",
        note: "Queue depth climbing · 320 → 1,820",
        unit: "depth",
        series: tsFor("a-cm", "early", 320, 1820),
      };
      break;

    case "incident":
      signals["i-stg-redo"] = {
        componentId: "i-stg-redo",
        health: "critical",
        note: "IOPS throttled at 5,000 · write latency P95 18ms",
        unit: "ms",
        series: tsFor("i-stg-redo", "incident", 4, 18),
      };
      signals["i-odba-rac"] = {
        componentId: "i-odba-rac",
        health: "warning",
        note: "log file sync 72% · node 2 at risk",
        unit: "%",
        series: tsFor("i-odba-rac", "incident", 4, 72),
      };
      signals["a-cm"] = {
        componentId: "a-cm",
        health: "critical",
        note: "Queue 4,210 · workers stalled on log file sync",
        unit: "depth",
        series: tsFor("a-cm", "incident", 320, 4210),
      };
      signals["a-gl"] = {
        componentId: "a-gl",
        health: "warning",
        note: "GL_INTERFACE backlog 18,400 rows",
      };
      signals["p-gl-close"] = {
        componentId: "p-gl-close",
        health: "warning",
        note: "Close trajectory at risk vs 8h SLO",
      };
      signals["p-ap-import"] = {
        componentId: "p-ap-import",
        health: "warning",
        note: "AP import lag 22 min vs 30 min target",
      };
      break;

    case "impact":
      signals["i-stg-redo"] = {
        componentId: "i-stg-redo",
        health: "critical",
        note: "IOPS bump in flight · write latency 22ms",
        unit: "ms",
        series: tsFor("i-stg-redo", "impact", 4, 22),
      };
      signals["i-odba-rac"] = {
        componentId: "i-odba-rac",
        health: "critical",
        note: "Node 2 evicted · running on node 1 only",
        unit: "%",
        series: tsFor("i-odba-rac", "impact", 4, 88),
      };
      signals["a-cm"] = {
        componentId: "a-cm",
        health: "critical",
        note: "Workers reduced to 12 · queue 4,800",
        unit: "depth",
        series: tsFor("a-cm", "impact", 320, 4800),
      };
      signals["a-gl"] = {
        componentId: "a-gl",
        health: "critical",
        note: "Close batch lagging 38 min behind plan",
      };
      signals["p-gl-close"] = {
        componentId: "p-gl-close",
        health: "critical",
        note: "$4.2M/day revenue at risk · Finance comms drafted",
      };
      signals["p-financial-close"] = {
        componentId: "p-financial-close",
        health: "warning",
        note: "Day 5 close window narrowing",
      };
      signals["p-ap-import"] = {
        componentId: "p-ap-import",
        health: "warning",
        note: "AP import lag 27 min",
      };
      break;

    case "resolved":
      signals["i-stg-redo"] = {
        componentId: "i-stg-redo",
        health: "healthy",
        note: "Premium SSD v2 applied · IOPS 2,700/7,500 · latency 4ms",
        unit: "ms",
        series: tsFor("i-stg-redo", "resolved", 4, 4),
      };
      signals["i-odba-rac"] = {
        componentId: "i-odba-rac",
        health: "healthy",
        note: "Both nodes online · log file sync back to 5%",
        unit: "%",
        series: tsFor("i-odba-rac", "resolved", 4, 4),
      };
      signals["a-cm"] = {
        componentId: "a-cm",
        health: "warning",
        note: "Catching up · queue 1,100 draining",
        unit: "depth",
        series: tsFor("a-cm", "resolved", 320, 1100),
      };
      signals["a-gl"] = {
        componentId: "a-gl",
        health: "warning",
        note: "Backlog 4,200 rows · processing",
      };
      signals["p-gl-close"] = {
        componentId: "p-gl-close",
        health: "warning",
        note: "Projected 7h 42m completion · within 8h SLO",
      };
      break;
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
