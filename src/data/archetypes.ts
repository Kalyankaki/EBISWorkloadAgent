import type { WorkloadArchetype } from "./schema";

export const ARCHETYPES: Record<string, WorkloadArchetype> = {
  "ebs-r1222-on-oracledb-azure": {
    id: "ebs-r1222-on-oracledb-azure",
    name: "Oracle EBS R12.2 on Oracle DB@Azure",
    version: "v2.4",
    description:
      "Reference architecture for Oracle E-Business Suite R12.2 deployed on Oracle Database@Azure (Exadata X11M) with Azure-native networking, identity, observability, and security controls.",
    referenceComponents: [
      {
        layer: "infrastructure",
        role: "primary database",
        expectedSku: "Exadata X11M · 2 nodes",
        expectedZoneRedundancy: 3,
      },
      {
        layer: "infrastructure",
        role: "redo storage",
        expectedSku: "Premium SSD v2 · 7,500 IOPS budget",
        expectedZoneRedundancy: 3,
      },
      {
        layer: "infrastructure",
        role: "apps tier",
        expectedSku: "VMSS · 6 D8s_v5 across 3 zones",
        expectedZoneRedundancy: 3,
      },
      {
        layer: "infrastructure",
        role: "network",
        expectedSku: "Hub-spoke · ER 4 Gbps · NSG ref-baseline",
        expectedZoneRedundancy: 3,
      },
    ],
    wellArchitected: {
      reliability: 78,
      security: 84,
      cost: 72,
      operations: 81,
      performance: 76,
    },
    iaCRepoUrl:
      "https://github.com/Azure/workload-archetypes/oracle-ebs-r1222",
  },
};

export const SCENARIO_STEPS = [
  { id: "steady", label: "Steady", time: "T-30m", description: "All processes green, baseline operations" },
  { id: "early", label: "Early signal", time: "T-08m", description: "Redo write latency rising, AI agent flags pattern" },
  { id: "incident", label: "Incident", time: "T+00m", description: "RAC log waits, CM saturation, GL at risk" },
  { id: "impact", label: "Business impact", time: "T+15m", description: "$4.2M/day revenue at risk, finance comms drafted" },
  { id: "resolved", label: "Resolved", time: "T+45m", description: "Mitigation applied, processes catching up, post-mortem drafted" },
] as const;
