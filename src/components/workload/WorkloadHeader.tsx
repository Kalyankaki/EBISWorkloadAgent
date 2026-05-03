"use client";

import { Layers, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Pill, HealthPill } from "@/components/primitives/Pill";
import type { Workload } from "@/data/schema";
import { workloadOverallHealth } from "@/lib/health";
import { getScenarioState } from "@/data/scenarios";
import { useWvi } from "@/store/useWvi";

export function WorkloadHeader({ workload }: { workload: Workload }) {
  const stepId = useWvi((s) => s.stepId);
  const state = getScenarioState(workload.id, stepId);
  const health = workloadOverallHealth(workload, state.signals);
  const archetypeStale =
    workload.archetypeVersionApplied !== workload.archetype.latestVersion;

  return (
    <div className="px-5 pt-3 pb-3 flex items-center gap-4">
      <div className="w-12 h-12 rounded-ax bg-gradient-to-br from-[#003a85] to-[#0078d4] grid place-items-center shrink-0">
        <Layers size={22} className="text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-[20px] font-light text-ax-text truncate">
            {workload.name}
          </div>
          <Pill tone={workload.tier === 1 ? "bad" : workload.tier === 2 ? "warn" : "info"}>
            Tier {workload.tier}
          </Pill>
          {workload.iqActivated ? (
            <Pill tone="info">
              <Sparkles size={10} />
              <span>Workload IQ active</span>
            </Pill>
          ) : (
            <Pill tone="neutral">Workload IQ off</Pill>
          )}
          <HealthPill status={health} />
          {archetypeStale && (
            <Pill tone="warn">
              <AlertTriangle size={10} />
              {workload.archetypeVersionApplied} → {workload.archetype.latestVersion}
            </Pill>
          )}
        </div>
        <div className="text-[12px] text-ax-textMute flex items-center flex-wrap gap-x-3 gap-y-0.5">
          <span>{workload.archetype.name}</span>
          <span>·</span>
          <span>{workload.subscription}</span>
          <span>·</span>
          <span>{workload.resourceGroup}</span>
          <span>·</span>
          <span>{workload.region}</span>
          <span>·</span>
          <span>{workload.ownerEmail}</span>
        </div>
      </div>
      {state.activeIncidentIds.length > 0 ? (
        <div className="flex items-center gap-1 text-ax-bad text-[12px] font-semibold animate-pulse">
          <AlertTriangle size={13} />
          {state.activeIncidentIds.join(", ")}
        </div>
      ) : (
        <div className="flex items-center gap-1 text-ax-good text-[12px]">
          <CheckCircle2 size={13} />
          No active incidents
        </div>
      )}
    </div>
  );
}
