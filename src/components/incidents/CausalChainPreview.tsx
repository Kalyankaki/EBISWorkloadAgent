"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { HealthDot, Pill } from "@/components/primitives/Pill";
import { useWvi } from "@/store/useWvi";
import { getWorkload, getIncidentFor } from "@/data/workloads";
import { findComponent } from "@/lib/propagation";

export function CausalChainPreview() {
  const stepId = useWvi((s) => s.stepId);
  const workloadId = useWvi((s) => s.currentWorkloadId);
  const incident = getIncidentFor(workloadId, stepId);
  const workload = getWorkload(workloadId);

  if (!incident) return null;

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-ax-bad" />
          Causal chain · {incident.id}
          <Pill tone={incident.severity === "P1" ? "bad" : "warn"}>
            {incident.severity}
          </Pill>
        </span>
      }
      right={
        <Link
          href={`/workloads/${workloadId}/incidents`}
          className="text-ax-accent hover:text-white text-[11px] flex items-center gap-1"
        >
          Open incident <ArrowRight size={11} />
        </Link>
      }
    >
      <div className="text-[12px] text-ax-textDim mb-3">{incident.title}</div>
      <div className="flex items-stretch gap-1 overflow-x-auto pb-1">
        {incident.causalChain.map((node, i) => {
          const comp = findComponent(workload, node.componentId);
          return (
            <div key={i} className="flex items-center gap-1 shrink-0">
              <div
                className={
                  "min-w-[160px] max-w-[200px] border bg-ax-panel2 rounded-ax px-2.5 py-2 " +
                  (node.health === "critical"
                    ? "border-ax-bad/60"
                    : node.health === "warning"
                    ? "border-ax-warn/60"
                    : "border-ax-border")
                }
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="text-[10px] uppercase font-semibold text-ax-textMute">
                    {node.observedAt}
                  </div>
                  <HealthDot status={node.health} />
                </div>
                <div className="text-[12px] text-ax-text font-semibold leading-tight mb-0.5 truncate">
                  {comp?.name ?? node.componentId}
                </div>
                <div className="text-[10px] uppercase tracking-wider text-ax-textMute mb-1">
                  {node.layer}
                </div>
                <div className="text-[11px] text-ax-textDim leading-tight">
                  {node.summary}
                </div>
              </div>
              {i < incident.causalChain.length - 1 && (
                <ArrowRight size={14} className="text-ax-textMute shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
