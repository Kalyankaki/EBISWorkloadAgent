import type {
  ApplicationComponent,
  BusinessProcess,
  Dependency,
  InfrastructureResource,
  Workload,
} from "../schema";

// Smaller scale UAT workload — same archetype, mostly healthy in all scenarios.

const processes: BusinessProcess[] = [
  {
    id: "u-gl-close",
    layer: "process",
    name: "GL Period Close (UAT)",
    ebsModule: "GL",
    ownerOrg: "Finance/UAT",
    criticality: "Medium",
    revenueAtRisk: { value: 0, unit: "compliance" },
    slo: "Complete within 12h",
    tags: ["close", "uat"],
  },
  {
    id: "u-o2c",
    layer: "process",
    name: "Order-to-Cash (UAT)",
    ebsModule: "OM/AR",
    ownerOrg: "Revenue/UAT",
    criticality: "Medium",
    revenueAtRisk: { value: 0, unit: "compliance" },
    slo: "p95 < 4s · 99% availability",
    tags: ["o2c", "uat"],
  },
];

const applicationComponents: ApplicationComponent[] = [
  {
    id: "u-cm",
    layer: "application",
    name: "Concurrent Manager",
    kind: "ebs-runtime",
    runtimeProperties: { Workers: "8", Version: "EBS R12.2.10" },
  },
  {
    id: "u-gl",
    layer: "application",
    name: "GL",
    kind: "ebs-module",
  },
  {
    id: "u-om",
    layer: "application",
    name: "OM",
    kind: "ebs-module",
  },
  {
    id: "u-ar",
    layer: "application",
    name: "AR",
    kind: "ebs-module",
  },
];

const infrastructureResources: InfrastructureResource[] = [
  {
    id: "u-odba-rac",
    layer: "infrastructure",
    name: "Oracle DB@Azure (UAT)",
    kind: "Database",
    azureResourceType:
      "Microsoft.OracleDatabase/cloudExadataInfrastructures",
    sku: "Exadata X11M · 1 node",
    region: "eastus2",
    zoneRedundancy: 1,
    matchesReference: false,
    driftReason: "Single node — acceptable for UAT",
  },
  {
    id: "u-vmss-apps",
    layer: "infrastructure",
    name: "Apps Tier VMSS (UAT)",
    kind: "Compute",
    azureResourceType: "Microsoft.Compute/virtualMachineScaleSets",
    sku: "VMSS · 2 × D4s_v5",
    region: "eastus2",
    zoneRedundancy: 1,
    matchesReference: false,
  },
  {
    id: "u-vnet",
    layer: "infrastructure",
    name: "Hub-Spoke VNet (UAT)",
    kind: "Network",
    azureResourceType: "Microsoft.Network/virtualNetworks",
    sku: "Standard",
    region: "eastus2",
    zoneRedundancy: 3,
    matchesReference: true,
  },
];

const dependencies: Dependency[] = [
  { id: "ud-gl-cm", fromId: "u-gl-close", toId: "u-cm", kind: "uses", weight: 1 },
  { id: "ud-gl-gl", fromId: "u-gl-close", toId: "u-gl", kind: "uses", weight: 1 },
  { id: "ud-o2c-om", fromId: "u-o2c", toId: "u-om", kind: "uses", weight: 1 },
  { id: "ud-o2c-ar", fromId: "u-o2c", toId: "u-ar", kind: "uses", weight: 1 },
  { id: "ud-cm-rac", fromId: "u-cm", toId: "u-odba-rac", kind: "stores-in", weight: 1 },
  { id: "ud-gl-rac", fromId: "u-gl", toId: "u-odba-rac", kind: "stores-in", weight: 1 },
  { id: "ud-om-rac", fromId: "u-om", toId: "u-odba-rac", kind: "stores-in", weight: 1 },
  { id: "ud-ar-rac", fromId: "u-ar", toId: "u-odba-rac", kind: "stores-in", weight: 1 },
  { id: "ud-cm-vmss", fromId: "u-cm", toId: "u-vmss-apps", kind: "uses", weight: 1 },
  { id: "ud-rac-vnet", fromId: "u-odba-rac", toId: "u-vnet", kind: "communicates-with", weight: 1 },
];

export const ebsUat: Workload = {
  id: "ebs-uat",
  name: "Oracle EBS UAT",
  archetype: {
    id: "ebs-r1222-on-oracledb-azure",
    name: "Oracle EBS R12.2 on Oracle DB@Azure",
    latestVersion: "v2.4",
  },
  archetypeVersionApplied: "v2.4",
  ownerEmail: "ebs-platform@contoso.com",
  subscription: "Contoso Non-Prod",
  subscriptionId: "1a2b3c4d-5e6f-7a8b-9c0d-e1f2a3b4c5d6",
  resourceGroup: "rg-ebs-uat-eastus2",
  region: "East US 2",
  tier: 3,
  iqActivated: true,
  onboardingProgress: { stepsTotal: 8, stepsComplete: 8 },
  processes,
  applicationComponents,
  infrastructureResources,
  dependencies,
  monthlyCostUsd: 24_800,
  slos: [
    {
      id: "u-slo-gl",
      processId: "u-gl-close",
      name: "GL UAT close",
      target: "Complete within 12h",
      current: 1,
      errorBudgetRemaining: 1,
    },
  ],
};
