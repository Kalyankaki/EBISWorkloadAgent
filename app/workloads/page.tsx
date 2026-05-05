"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Breadcrumb } from "@/components/shell/Breadcrumb";
import { Card } from "@/components/primitives/Card";
import { HealthPill, Pill } from "@/components/primitives/Pill";
import { WORKLOAD_LIST } from "@/data/workloads";
import { getScenarioState } from "@/data/scenarios";
import { useWvi } from "@/store/useWvi";
import { workloadOverallHealth, processesAtRisk } from "@/lib/health";
import { formatUsd } from "@/lib/format";

export default function WorkloadsListPage() {
  const stepId = useWvi((s) => s.stepId);

  return (
    <div>
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Workload Virtual Instance" }]} />

      <div className="px-5 pt-3 pb-3 flex items-center justify-between">
        <div>
          <div className="text-[22px] font-light text-ax-text">All workloads</div>
          <div className="text-[12px] text-ax-textMute">
            2 workloads · scoped to Contoso · last refresh 90s ago
          </div>
        </div>
        <Link
          href="/workloads/ebs-prod/onboarding"
          className="inline-flex items-center gap-1.5 bg-ax-accentDim hover:bg-ax-accent text-white text-[12px] px-3 h-8 rounded-ax"
        >
          <Plus size={13} />
          Onboard new workload
        </Link>
      </div>

      <div className="px-5 pb-10">
        <Card noPadding>
          <table className="w-full text-[12px]">
            <thead className="bg-ax-panel2 text-ax-textMute uppercase text-[11px]">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">Name</th>
                <th className="text-left px-3 py-2 font-semibold">Archetype</th>
                <th className="text-left px-3 py-2 font-semibold">Tier</th>
                <th className="text-left px-3 py-2 font-semibold">Health</th>
                <th className="text-left px-3 py-2 font-semibold">Active incidents</th>
                <th className="text-right px-3 py-2 font-semibold">Cost / mo</th>
                <th className="text-right px-3 py-2 font-semibold">Processes at risk</th>
                <th className="text-left px-3 py-2 font-semibold">Owner</th>
              </tr>
            </thead>
            <tbody>
              {WORKLOAD_LIST.map((w) => {
                const state = getScenarioState(w.id, stepId);
                const health = workloadOverallHealth(w, state.signals);
                const par = processesAtRisk(w, state);
                return (
                  <tr
                    key={w.id}
                    className="border-t border-ax-border hover:bg-ax-panel2 cursor-pointer"
                  >
                    <td className="px-3 py-2">
                      <Link
                        href={`/workloads/${w.id}`}
                        className="text-ax-accent hover:text-white"
                      >
                        {w.name}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-ax-textDim">
                      {w.archetype.name}
                      {w.archetypeVersionApplied !== w.archetype.latestVersion ? (
                        <span className="ml-1 text-ax-warn text-[10px]">
                          ({w.archetypeVersionApplied} → {w.archetype.latestVersion})
                        </span>
                      ) : (
                        <span className="ml-1 text-ax-good text-[10px]">
                          ({w.archetypeVersionApplied})
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Pill tone={w.tier === 1 ? "bad" : w.tier === 2 ? "warn" : "info"} small>
                        Tier {w.tier}
                      </Pill>
                    </td>
                    <td className="px-3 py-2">
                      <HealthPill status={health} />
                    </td>
                    <td className="px-3 py-2 text-ax-textDim">
                      {state.activeIncidentIds.length === 0 ? (
                        <span className="text-ax-textMute">None</span>
                      ) : (
                        state.activeIncidentIds.map((id) => (
                          <span key={id} className="text-ax-bad font-semibold">
                            {id}
                          </span>
                        ))
                      )}
                    </td>
                    <td className="px-3 py-2 text-right text-ax-textDim">
                      {formatUsd(w.monthlyCostUsd)}
                    </td>
                    <td className="px-3 py-2 text-right text-ax-textDim">
                      {par > 0 ? (
                        <span className="text-ax-bad font-semibold">{par}</span>
                      ) : (
                        "0"
                      )}
                    </td>
                    <td className="px-3 py-2 text-ax-textDim">{w.ownerEmail}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}
