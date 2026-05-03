"use client";

import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Network,
} from "lucide-react";
import { KpiTile } from "@/components/workload/KpiTile";
import { PersonaLensPanel } from "@/components/persona/PersonaLensPanel";
import { TopologyPreview } from "@/components/topology/TopologyPreview";
import { CausalChainPreview } from "@/components/incidents/CausalChainPreview";
import { ProcessScorecard } from "@/components/workload/ProcessScorecard";
import { useWvi } from "@/store/useWvi";
import { getWorkload } from "@/data/workloads";
import { getScenarioState } from "@/data/scenarios";
import { workloadOverallHealth, processesAtRisk, conformancePct } from "@/lib/health";
import { formatUsd } from "@/lib/format";
import { ARCHETYPES } from "@/data/archetypes";
import { motion } from "framer-motion";

export default function OverviewPage() {
  const stepId = useWvi((s) => s.stepId);
  const workloadId = useWvi((s) => s.currentWorkloadId);
  const workload = getWorkload(workloadId)!;
  const state = getScenarioState(workloadId, stepId);

  const health = workloadOverallHealth(workload, state.signals);
  const par = processesAtRisk(workload, state);
  const conformance = conformancePct(workload);
  const arche = ARCHETYPES[workload.archetype.id];
  const wa = arche
    ? Math.round(
        (arche.wellArchitected.reliability +
          arche.wellArchitected.security +
          arche.wellArchitected.cost +
          arche.wellArchitected.operations +
          arche.wellArchitected.performance) /
          5
      )
    : 0;

  return (
    <motion.div
      initial={{ x: 8, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="px-5 pt-4 space-y-4"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiTile
          Icon={CheckCircle2}
          label="Workload health"
          value={
            health === "healthy"
              ? "Healthy"
              : health === "warning"
              ? "Warning"
              : health === "critical"
              ? "Critical"
              : "Unknown"
          }
          trend="rolled up across all components"
          tone={
            health === "healthy"
              ? "good"
              : health === "warning"
              ? "warn"
              : "bad"
          }
        />
        <KpiTile
          Icon={AlertTriangle}
          label="Processes at risk"
          value={`${par}/${workload.processes.length}`}
          trend={par === 0 ? "all green" : "tier-1 process affected"}
          tone={par === 0 ? "good" : "bad"}
        />
        <KpiTile
          Icon={Network}
          label="Conformance"
          value={`${conformance}%`}
          trend={`archetype ${workload.archetypeVersionApplied}${
            workload.archetypeVersionApplied !==
            workload.archetype.latestVersion
              ? ` → ${workload.archetype.latestVersion} avail.`
              : ""
          }`}
          tone={conformance > 90 ? "good" : conformance > 75 ? "warn" : "bad"}
        />
        <KpiTile
          Icon={Activity}
          label="Well-Architected"
          value={`${wa}`}
          trend="averaged across 5 pillars"
          tone="info"
        />
        <KpiTile
          Icon={DollarSign}
          label="Run-rate"
          value={formatUsd(workload.monthlyCostUsd)}
          trend="trending −3% MoM"
          tone="info"
        />
      </div>

      {(stepId === "incident" || stepId === "impact" || stepId === "resolved") && (
        <CausalChainPreview />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TopologyPreview />
        <PersonaLensPanel />
      </div>

      <ProcessScorecard />
    </motion.div>
  );
}
