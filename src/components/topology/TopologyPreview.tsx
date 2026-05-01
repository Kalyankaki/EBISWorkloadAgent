"use client";

import Link from "next/link";
import { Maximize2 } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { HealthDot } from "@/components/primitives/Pill";
import { useWvi } from "@/store/useWvi";
import { getWorkload } from "@/data/workloads";
import { getScenarioState } from "@/data/scenarios";

// Compact 3-lane preview rendered in pure CSS (no React Flow) for speed.
export function TopologyPreview() {
  const stepId = useWvi((s) => s.stepId);
  const workloadId = useWvi((s) => s.currentWorkloadId);
  const workload = getWorkload(workloadId);
  const state = getScenarioState(workloadId, stepId);

  const lanes: { label: string; items: { id: string; name: string }[] }[] = [
    {
      label: "Business processes",
      items: workload.processes.map((p) => ({ id: p.id, name: p.name })),
    },
    {
      label: "Application",
      items: workload.applicationComponents
        .filter((a) => a.kind !== "integration")
        .map((p) => ({ id: p.id, name: p.name })),
    },
    {
      label: "Infrastructure",
      items: workload.infrastructureResources
        .slice(0, 8)
        .map((p) => ({ id: p.id, name: p.name })),
    },
  ];

  return (
    <Card
      title="Workload topology"
      right={
        <Link
          href={`/workloads/${workloadId}/topology`}
          className="text-ax-accent hover:text-white text-[11px] flex items-center gap-1"
        >
          <Maximize2 size={11} /> Open full topology
        </Link>
      }
    >
      <div className="space-y-3">
        {lanes.map((lane, i) => (
          <div key={i}>
            <div className="text-[10px] uppercase tracking-wider font-semibold text-ax-textMute mb-1.5">
              {lane.label}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {lane.items.map((it) => {
                const sig = state.signals[it.id];
                return (
                  <div
                    key={it.id}
                    className={
                      "flex items-center gap-1.5 border bg-ax-panel2 rounded-ax px-2 py-1 text-[11px] text-ax-textDim " +
                      (sig?.health === "critical"
                        ? "border-ax-bad/60"
                        : sig?.health === "warning"
                        ? "border-ax-warn/60"
                        : "border-ax-border")
                    }
                  >
                    <HealthDot status={sig?.health ?? "healthy"} pulse />
                    {it.name}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
