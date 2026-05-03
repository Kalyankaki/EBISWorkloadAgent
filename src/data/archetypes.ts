import type { WorkloadArchetype } from "./schema";

export const ARCHETYPES_LIST: WorkloadArchetype[] = [
  {
    id: "ebs-r1222-on-oracledb-azure",
    name: "Oracle EBS R12.2 on Oracle DB@Azure",
    version: "v2.4",
    description:
      "Reference deployment for Oracle E-Business Suite R12.2 on Oracle Database@Azure with Data Guard standby, multi-AZ apps tier, ExpressRoute, and Microsoft Fabric integration.",
    referenceComponents: [
      { layer: "infrastructure", role: "primary database",   expectedSku: "Exadata X11M · 2 nodes",       expectedZoneRedundancy: 2 },
      { layer: "infrastructure", role: "standby database",   expectedSku: "Exadata X11M · 1 node",        expectedZoneRedundancy: 1 },
      { layer: "infrastructure", role: "apps tier pool",     expectedSku: "E32ds_v5 · 6 VMs",             expectedZoneRedundancy: 3 },
      { layer: "infrastructure", role: "concurrent mgr",     expectedSku: "E16ds_v5 · 4 VMs",             expectedZoneRedundancy: 2 },
      { layer: "infrastructure", role: "redo storage",       expectedSku: "Premium SSD v2 · 32k IOPS",    expectedZoneRedundancy: 1 },
      { layer: "infrastructure", role: "load balancer",      expectedSku: "Standard LB · zone-redundant", expectedZoneRedundancy: 3 },
      { layer: "infrastructure", role: "express route",      expectedSku: "Premium · 4 Gbps · dual",      expectedZoneRedundancy: 3 },
      { layer: "infrastructure", role: "key vault",          expectedSku: "Premium HSM",                  expectedZoneRedundancy: 3 },
      { layer: "infrastructure", role: "log analytics",      expectedSku: "Pay-as-you-go · 90d",          expectedZoneRedundancy: 3 },
      { layer: "infrastructure", role: "defender for cloud", expectedSku: "Servers P2 · DB · Storage",    expectedZoneRedundancy: 3 },
      { layer: "infrastructure", role: "fabric mirror",      expectedSku: "F64 · OneLake mirror of EBS",  expectedZoneRedundancy: 3 },
    ],
    wellArchitected: { reliability: 92, security: 95, cost: 86, operations: 90, performance: 88 },
    iaCRepoUrl: "https://github.com/azure/wvi-archetypes/ebs-r1222",
  },
];

export const ARCHETYPES: Record<string, WorkloadArchetype> = Object.fromEntries(
  ARCHETYPES_LIST.map((a) => [a.id, a])
);

export function getArchetype(id: string): WorkloadArchetype | undefined {
  return ARCHETYPES[id];
}

export const SCENARIO_STEPS = [
  { id: "steady",   label: "Steady",          time: "T-30m", description: "All processes green, baseline operations" },
  { id: "early",    label: "Early signal",    time: "T-08m", description: "Redo write latency rising, AI agent flags pattern" },
  { id: "incident", label: "Incident",        time: "T+00m", description: "RAC log waits, CM saturation, GL at risk" },
  { id: "impact",   label: "Business impact", time: "T+15m", description: "$4.2M/day revenue at risk, finance comms drafted" },
  { id: "resolved", label: "Resolved",        time: "T+45m", description: "Mitigation applied, processes catching up, post-mortem drafted" },
] as const;
