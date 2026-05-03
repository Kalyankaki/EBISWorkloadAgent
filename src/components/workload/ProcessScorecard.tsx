"use client";

import { Card } from "@/components/primitives/Card";
import { HealthPill, Pill } from "@/components/primitives/Pill";
import { useWvi } from "@/store/useWvi";
import { getWorkload } from "@/data/workloads";
import { getScenarioState } from "@/data/scenarios";
import { formatRevenueAtRisk } from "@/lib/format";

export function ProcessScorecard() {
  const stepId = useWvi((s) => s.stepId);
  const workloadId = useWvi((s) => s.currentWorkloadId);
  const workload = getWorkload(workloadId)!;
  const state = getScenarioState(workloadId, stepId);

  return (
    <Card title="Business process scorecard" noPadding>
      <table className="w-full text-[12px]">
        <thead className="bg-ax-panel2 text-ax-textMute uppercase text-[11px]">
          <tr>
            <th className="text-left px-3 py-2 font-semibold">Process</th>
            <th className="text-left px-3 py-2 font-semibold">Module</th>
            <th className="text-left px-3 py-2 font-semibold">Owner</th>
            <th className="text-left px-3 py-2 font-semibold">Criticality</th>
            <th className="text-left px-3 py-2 font-semibold">Health</th>
            <th className="text-left px-3 py-2 font-semibold">SLO</th>
            <th className="text-right px-3 py-2 font-semibold">
              Revenue at risk
            </th>
          </tr>
        </thead>
        <tbody>
          {workload.processes.map((p) => {
            const sig = state.signals[p.id];
            const tone =
              p.criticality === "Critical"
                ? "bad"
                : p.criticality === "High"
                ? "warn"
                : p.criticality === "Medium"
                ? "info"
                : "neutral";
            return (
              <tr key={p.id} className="border-t border-ax-border">
                <td className="px-3 py-2 text-ax-text">{p.name}</td>
                <td className="px-3 py-2 text-ax-textDim">{p.ebsModule}</td>
                <td className="px-3 py-2 text-ax-textDim">{p.ownerOrg}</td>
                <td className="px-3 py-2">
                  <Pill tone={tone} small>
                    {p.criticality}
                  </Pill>
                </td>
                <td className="px-3 py-2">
                  <HealthPill status={sig?.health ?? "healthy"} />
                </td>
                <td className="px-3 py-2 text-ax-textMute truncate max-w-[260px]">
                  {p.slo}
                </td>
                <td className="px-3 py-2 text-right text-ax-textDim">
                  {formatRevenueAtRisk(p.revenueAtRisk)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
