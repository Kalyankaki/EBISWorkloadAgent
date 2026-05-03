import type {
  ApplicationComponent,
  BusinessProcess,
  Dependency,
  DriftItem,
  Incident,
  InfrastructureResource,
  Recommendation,
  Workload,
} from "../schema";
import { DEMO_NOW, daysAgo, hoursAgo } from "../demoNow";

// ============================================================
// BUSINESS PROCESSES (8)
// ============================================================
// Required IDs (Phase 2 validation): gl-close, ap-val, mrp, cm-batch

const processes: BusinessProcess[] = [
  {
    id: "gl-close",
    layer: "process",
    name: "GL Period Close",
    ebsModule: "GL",
    ownerOrg: "Finance",
    criticality: "Critical",
    revenueAtRisk: { value: 4_200_000, unit: "USD/day" },
    slo: "Complete within 8h, monthly, with zero financial posting errors",
    tags: ["close", "monthly", "finance", "tier-1"],
  },
  {
    id: "o2c",
    layer: "process",
    name: "Order-to-Cash",
    ebsModule: "OM/AR",
    ownerOrg: "Revenue",
    criticality: "Critical",
    revenueAtRisk: { value: 180_000, unit: "USD/hr" },
    slo: "p95 < 2s for order entry · 99.9% availability",
    tags: ["o2c", "revenue", "tier-1"],
  },
  {
    id: "p2p",
    layer: "process",
    name: "Procure-to-Pay",
    ebsModule: "PO/AP",
    ownerOrg: "Operations",
    criticality: "High",
    revenueAtRisk: { value: 80_000, unit: "USD/day" },
    slo: "Invoice import within 30 min of submission · 99.5% availability",
    tags: ["p2p", "operations", "tier-2"],
  },
  {
    id: "ap-val",
    layer: "process",
    name: "AP Invoice Validation",
    ebsModule: "AP",
    ownerOrg: "Finance",
    criticality: "High",
    revenueAtRisk: { value: 32_000, unit: "USD/day" },
    slo: "Validate 5,000 invoices/hr · < 30 min lag",
    tags: ["ap", "finance", "tier-2"],
  },
  {
    id: "mrp",
    layer: "process",
    name: "Material Requirements Planning",
    ebsModule: "INV",
    ownerOrg: "Supply Chain",
    criticality: "Medium",
    revenueAtRisk: { value: 0, unit: "compliance" },
    slo: "Nightly batch within 4h window",
    tags: ["mrp", "supply-chain", "tier-3"],
  },
  {
    id: "cm-batch",
    layer: "process",
    name: "Concurrent Manager Batch (ad-hoc)",
    ebsModule: "CM",
    ownerOrg: "EBS Platform",
    criticality: "Medium",
    revenueAtRisk: { value: 0, unit: "foundation" },
    slo: "Throughput 4,200 reports/hr · queue depth < 500",
    tags: ["cm", "batch", "platform"],
  },
  {
    id: "payroll",
    layer: "process",
    name: "Payroll Run",
    ebsModule: "HR",
    ownerOrg: "HR",
    criticality: "Critical",
    revenueAtRisk: { value: 0, unit: "compliance" },
    slo: "Bi-weekly · zero late paychecks · SOX-compliant audit trail",
    tags: ["payroll", "hr", "tier-1", "compliance"],
  },
  {
    id: "fin-report",
    layer: "process",
    name: "Financial Reporting",
    ebsModule: "GL/Hyperion",
    ownerOrg: "Finance",
    criticality: "High",
    revenueAtRisk: { value: 0, unit: "compliance" },
    slo: "Day 5 close · SOX-compliant evidence",
    tags: ["close", "reporting", "tier-2", "compliance"],
  },
];

// ============================================================
// APPLICATION COMPONENTS (13)
// ============================================================
// Required IDs (validation): gl, cm, wf

const applicationComponents: ApplicationComponent[] = [
  {
    id: "cm",
    layer: "application",
    name: "Concurrent Manager",
    kind: "ebs-runtime",
    description:
      "EBS batch scheduler that runs concurrent programs (reports, interfaces, period close batches).",
    runtimeProperties: {
      Workers: "32",
      "Queue depth (baseline)": "320",
      "Throughput baseline": "4,200/hr",
      Version: "EBS R12.2.10",
      "Patch level": "April 2026 CPU",
    },
  },
  {
    id: "wf",
    layer: "application",
    name: "Workflow Engine",
    kind: "ebs-runtime",
    description:
      "Oracle Workflow / Notification Mailer. Runs background processes for approvals, notifications, deferred routing.",
    runtimeProperties: {
      "Background engines": "4",
      "Notifications/hr": "9,400",
      "Deferred queue baseline": "120",
    },
  },
  {
    id: "forms",
    layer: "application",
    name: "Forms / Self-Service",
    kind: "ebs-runtime",
    description:
      "Oracle Forms server and self-service web tier for end-user transactions.",
    runtimeProperties: {
      "Form sessions (peak)": "1,800",
      "OAF sessions": "4,200",
      "Apache instances": "6",
    },
  },
  {
    id: "gl",
    layer: "application",
    name: "GL (General Ledger)",
    kind: "ebs-module",
    description: "Posting, period close, allocations, financial statements.",
    runtimeProperties: {
      "Active sets of books": "4",
      Currencies: "USD, EUR, GBP, JPY",
    },
  },
  {
    id: "ap",
    layer: "application",
    name: "AP (Payables)",
    kind: "ebs-module",
    description: "Invoice import, validation, payment, expense reports.",
    runtimeProperties: { "Avg invoices/day": "12,400" },
  },
  {
    id: "ar",
    layer: "application",
    name: "AR (Receivables)",
    kind: "ebs-module",
    description: "Customer invoicing, collections, cash application.",
    runtimeProperties: { "Avg invoices/day": "8,800" },
  },
  {
    id: "om",
    layer: "application",
    name: "OM (Order Management)",
    kind: "ebs-module",
    description: "Order entry, fulfillment, returns.",
    runtimeProperties: { "Avg orders/day": "22,100" },
  },
  {
    id: "po",
    layer: "application",
    name: "PO (Purchasing)",
    kind: "ebs-module",
  },
  {
    id: "inv",
    layer: "application",
    name: "INV (Inventory)",
    kind: "ebs-module",
  },
  {
    id: "hr",
    layer: "application",
    name: "HR (Human Resources)",
    kind: "ebs-module",
  },
  {
    id: "int-sf",
    layer: "application",
    name: "Salesforce Bridge",
    kind: "integration",
    description: "Bi-directional sync of accounts, contacts, opportunities to OM.",
    runtimeProperties: { Direction: "Bi-directional", "Last sync": "90s ago" },
  },
  {
    id: "int-wd",
    layer: "application",
    name: "Workday Bridge",
    kind: "integration",
    description: "Inbound HR master data feed.",
    runtimeProperties: { Direction: "Inbound", "Sync frequency": "15 min" },
  },
  {
    id: "int-snow",
    layer: "application",
    name: "ServiceNow Bridge",
    kind: "integration",
    description: "Outbound incident creation for EBS-managed assets.",
  },
];

// ============================================================
// INFRASTRUCTURE RESOURCES (15)
// ============================================================
// Required IDs (validation): odba-rac, vm-cm, vm-apps-1, stg-redo, lb

const infrastructureResources: InfrastructureResource[] = [
  {
    id: "odba-rac",
    layer: "infrastructure",
    name: "Oracle DB@Azure RAC (primary)",
    kind: "Database",
    azureResourceType:
      "Microsoft.OracleDatabase/cloudExadataInfrastructures",
    sku: "Exadata X11M · 2 nodes",
    region: "eastus",
    zoneRedundancy: 2,
    matchesReference: true,
  },
  {
    id: "odba-dg",
    layer: "infrastructure",
    name: "Oracle DB@Azure Data Guard standby",
    kind: "Database",
    azureResourceType:
      "Microsoft.OracleDatabase/cloudExadataInfrastructures",
    sku: "Exadata X11M · 1 node",
    region: "centralus",
    zoneRedundancy: 1,
    matchesReference: false,
    driftReason:
      "Data Guard mode set to maximum performance · expected maximum availability",
  },
  {
    id: "stg-redo",
    layer: "infrastructure",
    name: "Redo / Archive Storage",
    kind: "Storage",
    azureResourceType: "Microsoft.Compute/disks",
    sku: "Premium SSD v1 · 20k IOPS budget",
    region: "eastus",
    zoneRedundancy: 1,
    matchesReference: false,
    driftReason:
      "Premium SSD v1 · expected Premium SSD v2 with 32k IOPS budget",
  },
  {
    id: "vm-apps-1",
    layer: "infrastructure",
    name: "Apps Tier VM 1",
    kind: "Compute",
    azureResourceType: "Microsoft.Compute/virtualMachines",
    sku: "E32ds_v5 · zone 1",
    region: "eastus",
    zoneRedundancy: 1,
    matchesReference: false,
    driftReason: "Apps tier deployed in 1 zone · expected 3-zone spread",
  },
  {
    id: "vm-apps-2",
    layer: "infrastructure",
    name: "Apps Tier VM 2",
    kind: "Compute",
    azureResourceType: "Microsoft.Compute/virtualMachines",
    sku: "E32ds_v5 · zone 1",
    region: "eastus",
    zoneRedundancy: 1,
    matchesReference: false,
    driftReason: "Apps tier deployed in 1 zone · expected 3-zone spread",
  },
  {
    id: "vm-cm",
    layer: "infrastructure",
    name: "Concurrent Manager VMs",
    kind: "Compute",
    azureResourceType: "Microsoft.Compute/virtualMachineScaleSets",
    sku: "E16ds_v5 · 4 VMs",
    region: "eastus",
    zoneRedundancy: 2,
    matchesReference: true,
  },
  {
    id: "lb",
    layer: "infrastructure",
    name: "Apps Load Balancer",
    kind: "Network",
    azureResourceType: "Microsoft.Network/loadBalancers",
    sku: "Standard LB · zone-redundant",
    region: "eastus",
    zoneRedundancy: 3,
    matchesReference: true,
  },
  {
    id: "vnet",
    layer: "infrastructure",
    name: "Hub-Spoke VNet",
    kind: "Network",
    azureResourceType: "Microsoft.Network/virtualNetworks",
    sku: "Hub-spoke · ER 4 Gbps",
    region: "eastus",
    zoneRedundancy: 3,
    matchesReference: true,
  },
  {
    id: "nsg-db",
    layer: "infrastructure",
    name: "DB NSG",
    kind: "Network",
    azureResourceType: "Microsoft.Network/networkSecurityGroups",
    sku: "Standard NSG · 14 rules",
    region: "eastus",
    zoneRedundancy: 3,
    matchesReference: false,
    driftReason:
      "Inbound 1521 source range 10.0.0.0/8 · expected 10.10.0.0/16",
  },
  {
    id: "er",
    layer: "infrastructure",
    name: "ExpressRoute Circuit",
    kind: "Network",
    azureResourceType: "Microsoft.Network/expressRouteCircuits",
    sku: "Premium · 4 Gbps · dual primary/secondary",
    region: "eastus",
    zoneRedundancy: 3,
    matchesReference: true,
  },
  {
    id: "kv",
    layer: "infrastructure",
    name: "Key Vault (HSM)",
    kind: "Security",
    azureResourceType: "Microsoft.KeyVault/vaults",
    sku: "Premium · HSM-backed",
    region: "eastus",
    zoneRedundancy: 3,
    matchesReference: false,
    driftReason:
      "Diagnostic settings missing · expected diagnostics → Log Analytics",
  },
  {
    id: "monitor",
    layer: "infrastructure",
    name: "Log Analytics Workspace",
    kind: "Observability",
    azureResourceType: "Microsoft.OperationalInsights/workspaces",
    sku: "Pay-as-you-go · 90d retention",
    region: "eastus",
    zoneRedundancy: 3,
    matchesReference: true,
  },
  {
    id: "defender",
    layer: "infrastructure",
    name: "Defender for Cloud",
    kind: "Security",
    azureResourceType: "Microsoft.Security/pricings",
    sku: "Defender for Servers P2 · DB · Storage · Key Vault",
    region: "eastus",
    zoneRedundancy: 3,
    matchesReference: true,
  },
  {
    id: "entra",
    layer: "infrastructure",
    name: "Entra ID + PIM",
    kind: "Identity",
    azureResourceType: "Microsoft.AAD",
    sku: "P2 · PIM · CA policies · MFA",
    region: "global",
    zoneRedundancy: 3,
    matchesReference: true,
  },
  {
    id: "fabric",
    layer: "infrastructure",
    name: "Microsoft Fabric (analytics mirror)",
    kind: "Integration",
    azureResourceType: "Microsoft.Fabric/capacities",
    sku: "F64 capacity · OneLake mirror of EBS",
    region: "eastus",
    zoneRedundancy: 3,
    matchesReference: true,
  },
];

// ============================================================
// DEPENDENCIES — process → app, app → app, app → infra, infra → infra
// ============================================================

const dependencies: Dependency[] = [
  // Processes → application
  { id: "d-glclose-gl",      fromId: "gl-close",   toId: "gl",   kind: "uses", weight: 1 },
  { id: "d-glclose-cm",      fromId: "gl-close",   toId: "cm",   kind: "uses", weight: 1 },
  { id: "d-glclose-wf",      fromId: "gl-close",   toId: "wf",   kind: "uses", weight: 0.7 },

  { id: "d-o2c-om",          fromId: "o2c",        toId: "om",   kind: "uses", weight: 1 },
  { id: "d-o2c-ar",          fromId: "o2c",        toId: "ar",   kind: "uses", weight: 1 },
  { id: "d-o2c-forms",       fromId: "o2c",        toId: "forms", kind: "uses", weight: 1 },
  { id: "d-o2c-sf",          fromId: "o2c",        toId: "int-sf", kind: "uses", weight: 0.6 },

  { id: "d-p2p-po",          fromId: "p2p",        toId: "po",   kind: "uses", weight: 1 },
  { id: "d-p2p-ap",          fromId: "p2p",        toId: "ap",   kind: "uses", weight: 1 },
  { id: "d-p2p-inv",         fromId: "p2p",        toId: "inv",  kind: "uses", weight: 0.5 },

  { id: "d-apval-ap",        fromId: "ap-val",     toId: "ap",   kind: "uses", weight: 1 },
  { id: "d-apval-cm",        fromId: "ap-val",     toId: "cm",   kind: "uses", weight: 1 },
  { id: "d-apval-wf",        fromId: "ap-val",     toId: "wf",   kind: "uses", weight: 0.5 },

  { id: "d-mrp-cm",          fromId: "mrp",        toId: "cm",   kind: "uses", weight: 1 },
  { id: "d-mrp-inv",         fromId: "mrp",        toId: "inv",  kind: "uses", weight: 1 },

  { id: "d-cmb-cm",          fromId: "cm-batch",   toId: "cm",   kind: "uses", weight: 1 },

  { id: "d-payroll-hr",      fromId: "payroll",    toId: "hr",   kind: "uses", weight: 1 },
  { id: "d-payroll-cm",      fromId: "payroll",    toId: "cm",   kind: "uses", weight: 1 },
  { id: "d-payroll-wd",      fromId: "payroll",    toId: "int-wd", kind: "uses", weight: 0.5 },

  { id: "d-fr-gl",           fromId: "fin-report", toId: "gl",   kind: "uses", weight: 1 },
  { id: "d-fr-wf",           fromId: "fin-report", toId: "wf",   kind: "uses", weight: 0.5 },
  { id: "d-fr-fabric-app",   fromId: "fin-report", toId: "int-snow", kind: "uses", weight: 0.2 }, // outbound notify

  // Application → infrastructure (modules store in DB; runtimes use VMs)
  { id: "d-cm-rac",   fromId: "cm",    toId: "odba-rac",  kind: "stores-in", weight: 1 },
  { id: "d-cm-vmcm",  fromId: "cm",    toId: "vm-cm",     kind: "uses",      weight: 1 },
  { id: "d-wf-rac",   fromId: "wf",    toId: "odba-rac",  kind: "stores-in", weight: 1 },
  { id: "d-wf-vmcm",  fromId: "wf",    toId: "vm-cm",     kind: "uses",      weight: 0.6 },
  { id: "d-forms-vm1", fromId: "forms", toId: "vm-apps-1", kind: "uses",     weight: 1 },
  { id: "d-forms-vm2", fromId: "forms", toId: "vm-apps-2", kind: "uses",     weight: 1 },
  { id: "d-gl-rac",   fromId: "gl",    toId: "odba-rac",  kind: "stores-in", weight: 1 },
  { id: "d-gl-vm1",   fromId: "gl",    toId: "vm-apps-1", kind: "uses",      weight: 1 },
  { id: "d-ap-rac",   fromId: "ap",    toId: "odba-rac",  kind: "stores-in", weight: 1 },
  { id: "d-ap-vm1",   fromId: "ap",    toId: "vm-apps-1", kind: "uses",      weight: 1 },
  { id: "d-ar-rac",   fromId: "ar",    toId: "odba-rac",  kind: "stores-in", weight: 1 },
  { id: "d-ar-vm1",   fromId: "ar",    toId: "vm-apps-1", kind: "uses",      weight: 1 },
  { id: "d-om-rac",   fromId: "om",    toId: "odba-rac",  kind: "stores-in", weight: 1 },
  { id: "d-om-vm1",   fromId: "om",    toId: "vm-apps-1", kind: "uses",      weight: 1 },
  { id: "d-po-rac",   fromId: "po",    toId: "odba-rac",  kind: "stores-in", weight: 1 },
  { id: "d-po-vm1",   fromId: "po",    toId: "vm-apps-1", kind: "uses",      weight: 1 },
  { id: "d-inv-rac",  fromId: "inv",   toId: "odba-rac",  kind: "stores-in", weight: 1 },
  { id: "d-inv-vm1",  fromId: "inv",   toId: "vm-apps-1", kind: "uses",      weight: 1 },
  { id: "d-hr-rac",   fromId: "hr",    toId: "odba-rac",  kind: "stores-in", weight: 1 },
  { id: "d-hr-vm1",   fromId: "hr",    toId: "vm-apps-1", kind: "uses",      weight: 1 },

  { id: "d-sf-vnet",   fromId: "int-sf",   toId: "vnet", kind: "communicates-with", weight: 1 },
  { id: "d-wd-vnet",   fromId: "int-wd",   toId: "vnet", kind: "communicates-with", weight: 1 },
  { id: "d-snow-vnet", fromId: "int-snow", toId: "vnet", kind: "communicates-with", weight: 1 },

  // Infrastructure → infrastructure
  { id: "d-rac-stg",     fromId: "odba-rac",   toId: "stg-redo", kind: "stores-in",        weight: 1 },
  { id: "d-rac-dg",      fromId: "odba-rac",   toId: "odba-dg",  kind: "communicates-with", weight: 1 },
  { id: "d-rac-vnet",    fromId: "odba-rac",   toId: "vnet",     kind: "communicates-with", weight: 1 },
  { id: "d-rac-nsg",     fromId: "odba-rac",   toId: "nsg-db",   kind: "monitored-by",     weight: 1 },
  { id: "d-rac-kv",      fromId: "odba-rac",   toId: "kv",       kind: "uses",             weight: 0.6 },
  { id: "d-rac-monitor", fromId: "odba-rac",   toId: "monitor",  kind: "monitored-by",     weight: 1 },
  { id: "d-rac-defender", fromId: "odba-rac",  toId: "defender", kind: "monitored-by",     weight: 0.7 },
  { id: "d-rac-entra",   fromId: "odba-rac",   toId: "entra",    kind: "uses",             weight: 1 },
  { id: "d-rac-fabric",  fromId: "odba-rac",   toId: "fabric",   kind: "communicates-with", weight: 0.5 },

  { id: "d-vm1-lb",      fromId: "vm-apps-1",  toId: "lb",       kind: "communicates-with", weight: 1 },
  { id: "d-vm2-lb",      fromId: "vm-apps-2",  toId: "lb",       kind: "communicates-with", weight: 1 },
  { id: "d-vm1-vnet",    fromId: "vm-apps-1",  toId: "vnet",     kind: "communicates-with", weight: 1 },
  { id: "d-vm2-vnet",    fromId: "vm-apps-2",  toId: "vnet",     kind: "communicates-with", weight: 1 },
  { id: "d-vmcm-vnet",   fromId: "vm-cm",      toId: "vnet",     kind: "communicates-with", weight: 1 },
  { id: "d-vm1-monitor", fromId: "vm-apps-1",  toId: "monitor",  kind: "monitored-by",     weight: 1 },
  { id: "d-vm2-monitor", fromId: "vm-apps-2",  toId: "monitor",  kind: "monitored-by",     weight: 1 },
  { id: "d-vmcm-monitor", fromId: "vm-cm",     toId: "monitor",  kind: "monitored-by",     weight: 1 },

  { id: "d-vnet-er",     fromId: "vnet",       toId: "er",       kind: "communicates-with", weight: 1 },
];

// ============================================================
// DRIFT (6) — first one is the post-mortem hero
// ============================================================

export const ebsProdDrift: DriftItem[] = [
  {
    id: "drift-iops",
    workloadId: "ebs-prod",
    componentId: "stg-redo",
    property: "Premium SSD v2 IOPS budget",
    actual: "Premium SSD v1 · 20k IOPS",
    expected: "Premium SSD v2 · 32k IOPS",
    severity: "critical",
    detectedAt: daysAgo(9),
    impact:
      "Insufficient IOPS headroom for log file sync during heavy CM batch periods (e.g. period close).",
  },
  {
    id: "drift-zones",
    workloadId: "ebs-prod",
    componentId: "vm-apps-1",
    property: "Apps tier zone redundancy",
    actual: "All apps VMs in zone 1",
    expected: "Spread across 3 zones",
    severity: "warning",
    detectedAt: daysAgo(25),
    impact:
      "Loss of single zone takes apps tier offline during the period close window.",
  },
  {
    id: "drift-nsg",
    workloadId: "ebs-prod",
    componentId: "nsg-db",
    property: "NSG inbound 1521 source range",
    actual: "10.0.0.0/8",
    expected: "10.10.0.0/16",
    severity: "warning",
    detectedAt: daysAgo(13),
    impact:
      "Broader-than-expected DB exposure surface inside the corporate network.",
  },
  {
    id: "drift-dg",
    workloadId: "ebs-prod",
    componentId: "odba-dg",
    property: "Data Guard mode",
    actual: "Maximum performance",
    expected: "Maximum availability",
    severity: "warning",
    detectedAt: daysAgo(34),
    impact: "Higher RPO than committed (15 min target) under primary site failure.",
  },
  {
    id: "drift-kv",
    workloadId: "ebs-prod",
    componentId: "kv",
    property: "Diagnostic settings",
    actual: "No diagnostic settings configured",
    expected: "Diagnostics → Log Analytics workspace",
    severity: "warning",
    detectedAt: daysAgo(21),
    impact:
      "Audit gap: Key Vault access events not centrally logged. SOX evidence weakened.",
  },
  {
    id: "drift-untagged",
    workloadId: "ebs-prod",
    componentId: "vm-apps-2",
    property: "Resource tags",
    actual: "Missing workload + costcenter tags",
    expected: "workload, owner, costcenter tags required",
    severity: "info",
    detectedAt: daysAgo(8),
    impact:
      "Resource not attributable to a workload — distorts FinOps cost-per-process roll-up.",
  },
];

// ============================================================
// RECOMMENDATIONS (9) — ranked by criticality of affected processes
// ============================================================

export const ebsProdRecommendations: Recommendation[] = [
  {
    id: "rec-2271",
    workloadId: "ebs-prod",
    category: "Reliability",
    severity: "critical",
    title: "Bump redo storage to Premium SSD v2 (32k IOPS)",
    rationale:
      "Redo volume on Premium SSD v1 with 20k IOPS budget. Period close batches have shown sustained spikes to 19k IOPS with no headroom — log file sync waits become bottleneck under load. Premium SSD v2 provides 32k IOPS with burst capability and matches archetype v2.4.",
    affectedProcesses: ["gl-close", "ap-val", "fin-report", "payroll"],
    affectedResources: ["stg-redo", "odba-rac"],
    estimatedCostDeltaUsdPerMonth: 380,
    estimatedRiskReductionPct: 64,
    iaCPullRequest: "PR-4471",
    status: "deferred",
    flaggedAt: daysAgo(9),
  },
  {
    id: "rec-3801",
    workloadId: "ebs-prod",
    category: "Reliability",
    severity: "high",
    title: "Spread apps-tier VMs across 3 availability zones",
    rationale:
      "Apps tier VMs deployed in zone 1 only. Loss of zone takes form/self-service offline. Archetype v2.4 specifies spread across 3 zones (2 instances per zone). No SKU change required.",
    affectedProcesses: ["o2c", "gl-close", "p2p"],
    affectedResources: ["vm-apps-1", "vm-apps-2"],
    estimatedCostDeltaUsdPerMonth: 0,
    estimatedRiskReductionPct: 38,
    iaCPullRequest: "PR-4472",
    status: "open",
    flaggedAt: daysAgo(25),
  },
  {
    id: "rec-3914",
    workloadId: "ebs-prod",
    category: "Security",
    severity: "high",
    title: "Tighten NSG inbound 1521 source range",
    rationale:
      "DB NSG allows inbound 1521 from 10.0.0.0/8. Apps tier sits in 10.10.0.0/16. Reduce blast radius and meet archetype baseline.",
    affectedProcesses: ["gl-close", "o2c", "p2p", "ap-val"],
    affectedResources: ["nsg-db"],
    estimatedRiskReductionPct: 22,
    iaCPullRequest: "PR-4473",
    status: "open",
    flaggedAt: daysAgo(13),
  },
  {
    id: "rec-4012",
    workloadId: "ebs-prod",
    category: "Reliability",
    severity: "medium",
    title: "Switch Data Guard to maximum availability",
    rationale:
      "Standby is in maximum performance mode (async). RPO commitment is 15 min — maximum availability mode achieves lower RPO without performance impact in current network conditions.",
    affectedProcesses: ["gl-close", "fin-report"],
    affectedResources: ["odba-dg"],
    estimatedRiskReductionPct: 18,
    iaCPullRequest: "PR-4474",
    status: "open",
    flaggedAt: daysAgo(34),
  },
  {
    id: "rec-4101",
    workloadId: "ebs-prod",
    category: "Cost",
    severity: "medium",
    title: "Repurpose 30% of standby Exadata for read-only reporting",
    rationale:
      "Active Data Guard is enabled but not used for reporting. Re-pointing Hyperion and Fabric mirror to standby recovers 30% of standby capacity for paid use. Estimated $14K/mo savings.",
    affectedProcesses: ["fin-report"],
    affectedResources: ["odba-dg", "fabric"],
    estimatedCostDeltaUsdPerMonth: -14_000,
    estimatedRiskReductionPct: 0,
    status: "open",
    flaggedAt: daysAgo(18),
  },
  {
    id: "rec-4202",
    workloadId: "ebs-prod",
    category: "Operations",
    severity: "medium",
    title: "Enable diagnostic settings on Key Vault",
    rationale:
      "Key Vault has no diagnostic export. SOX audit trail incomplete. Configure diagnostic settings → Log Analytics workspace.",
    affectedProcesses: ["fin-report", "payroll"],
    affectedResources: ["kv", "monitor"],
    estimatedRiskReductionPct: 8,
    iaCPullRequest: "PR-4475",
    status: "open",
    flaggedAt: daysAgo(21),
  },
  {
    id: "rec-4303",
    workloadId: "ebs-prod",
    category: "Cost",
    severity: "low",
    title: "Rightsize apps-tier VMs during off-peak",
    rationale:
      "Apps tier averages 38% utilization. Auto-scale rule can shrink to 4 instances overnight (22:00–06:00 UTC) and recover $3K/mo.",
    affectedProcesses: ["o2c"],
    affectedResources: ["vm-apps-1", "vm-apps-2"],
    estimatedCostDeltaUsdPerMonth: -3_000,
    status: "open",
    flaggedAt: daysAgo(15),
  },
  {
    id: "rec-4404",
    workloadId: "ebs-prod",
    category: "Cost",
    severity: "low",
    title: "Move > 90d archive logs to cold tier",
    rationale:
      "Archive log retention > 90 days served from hot tier. Cold tier saves $2K/mo with no operational impact.",
    affectedProcesses: ["fin-report"],
    affectedResources: ["stg-redo"],
    estimatedCostDeltaUsdPerMonth: -2_000,
    status: "open",
    flaggedAt: daysAgo(14),
  },
  {
    id: "rec-4505",
    workloadId: "ebs-prod",
    category: "Operations",
    severity: "low",
    title: "Tag untagged apps tier VM",
    rationale:
      "vm-apps-2 missing workload + costcenter tags — distorts FinOps cost-per-process. Apply tags.",
    affectedProcesses: [],
    affectedResources: ["vm-apps-2"],
    status: "open",
    flaggedAt: daysAgo(8),
  },
];

// ============================================================
// INCIDENT — INC-4471
// ============================================================

export const ebsProdIncident: Incident = {
  id: "INC-4471",
  workloadId: "ebs-prod",
  severity: "P1",
  status: "active",
  title:
    "GL Period Close at risk · log file sync waits driven by storage IOPS throttle",
  startedAt: hoursAgo(0),
  pagedPersonaIds: ["dba", "appadmin", "sre", "bizops", "finops"],
  recommendedRunbookId: "RB-217",
  causalChain: [
    {
      componentId: "stg-redo",
      layer: "infrastructure",
      observedAt: "T-08m",
      summary:
        "Redo storage approaching 20k IOPS budget · Premium SSD v1 cannot burst.",
      health: "warning",
    },
    {
      componentId: "stg-redo",
      layer: "infrastructure",
      observedAt: "T+00m",
      summary:
        "Redo storage IOPS sustained at 20k · throttle engaged · write latency P95 18ms vs 4ms baseline.",
      health: "critical",
    },
    {
      componentId: "odba-rac",
      layer: "infrastructure",
      observedAt: "T+02m",
      summary:
        "Oracle RAC log file sync wait class jumps to 72% of total · gc cr block 2-way also climbing.",
      health: "critical",
    },
    {
      componentId: "odba-rac",
      layer: "infrastructure",
      observedAt: "T+04m",
      summary:
        "RAC node 2 evicted from cluster · log file sync waits exceeded 90s threshold. Now running on node 1 only.",
      health: "critical",
    },
    {
      componentId: "cm",
      layer: "application",
      observedAt: "T+05m",
      summary:
        "Concurrent Manager queue depth 4,210 (10× baseline) · 32 workers stalled on log file sync.",
      health: "critical",
    },
    {
      componentId: "gl",
      layer: "application",
      observedAt: "T+08m",
      summary:
        "GL period close batch lagging · GL_INTERFACE backlog 18,400 rows · projected to miss 8h SLO.",
      health: "warning",
    },
    {
      componentId: "gl-close",
      layer: "process",
      observedAt: "T+12m",
      summary:
        "GL Period Close projected completion 11h vs 8h SLO. $4.2M/day revenue at risk if close slips a business day.",
      health: "critical",
    },
  ],
  runbookSteps: [
    {
      id: "rb-217-1",
      title: "Acknowledge incident and freeze new CM job submissions",
      description:
        "Pause Concurrent Manager queue intake for non-critical jobs (planning, MRP, ad-hoc reports). Critical period-close batches continue.",
      componentId: "cm",
      estimatedMinutes: 1,
    },
    {
      id: "rb-217-2",
      title: "Engage DBA — capture AWR snapshot & wait events",
      description:
        "Snapshot AWR for the 30-minute window. Validate log file sync as primary wait event.",
      componentId: "odba-rac",
      estimatedMinutes: 3,
    },
    {
      id: "rb-217-3",
      title: "Hold non-essential CM workers, focus on close batches",
      description:
        "Reduce CM worker count from 32 → 12 to prioritize close throughput while storage is constrained.",
      componentId: "cm",
      estimatedMinutes: 2,
    },
    {
      id: "rb-217-4",
      title: "Bump redo storage to Premium SSD v2 (CSA approval required)",
      description:
        "Apply IaC PR-4471: change redo disk SKU from Premium SSD v1 → v2 (32k IOPS budget). Online operation, no downtime.",
      componentId: "stg-redo",
      estimatedMinutes: 7,
      destructive: false,
    },
    {
      id: "rb-217-5",
      title: "Re-add RAC node 2 to cluster",
      description:
        "Once write latency normalizes, srvctl start instance and re-balance services across 2 nodes.",
      componentId: "odba-rac",
      estimatedMinutes: 3,
    },
    {
      id: "rb-217-6",
      title: "Drain CM backlog and re-open intake",
      description:
        "Restore CM workers to 32, resume non-critical job intake, validate close-batch trajectory.",
      componentId: "cm",
      estimatedMinutes: 2,
    },
  ],
  businessImpactDraftMd: `**To:** CFO, Controller, Close DL
**From:** Workload IQ on behalf of SRE
**Re:** GL Period Close — at-risk window detected and mitigated

We detected an at-risk condition on tonight's GL Period Close batch at **T+00m**. Root cause is a storage IOPS throttle on the redo log volume that propagated up through the database tier and into the Concurrent Manager batch queue.

**Current trajectory (without mitigation):** Close completion **~11h**, exceeding the 8h SLO. Revenue at risk: **$4.2M/day** delayed recognition if close slips one business day.

**Mitigation in progress:**
- Non-critical batch jobs paused (T+05m)
- Storage IOPS budget being raised from 20k → 32k via online SKU change (T+12m)
- RAC node 2 to be re-added once storage normalizes (T+18m)

**Expected close completion:** **7h 42m** post-mitigation — within SLO. **No data loss. No financial posting at risk.** Audit trail intact and SOX evidence package will be generated post-close.

A full post-mortem and a contributing-factor review (a related recommendation was deferred 9 days ago) will follow.

— Workload IQ`,
  postMortemDraftMd: `# Post-mortem · INC-4471 · GL Period Close at risk

**Severity:** P1 · **Resolved:** T+45m · **MTTR:** 45 min · **Customer impact:** none (mitigated within SLO)

## Summary
Premium SSD v1 redo storage hit its 20k IOPS sustained budget during the period-close batch window. Storage write latency tripled (4ms → 18ms P95), which propagated into the Oracle RAC tier as log file sync waits, evicted node 2, saturated the Concurrent Manager queue, and put the GL Period Close on a trajectory to miss its 8h SLO with **$4.2M/day** of revenue at risk.

## Causal chain
\`Premium SSD v1 IOPS throttle\` → \`Oracle RAC log file sync waits\` → \`RAC node 2 eviction\` → \`Concurrent Manager queue saturation\` → \`GL_INTERFACE backlog\` → \`GL Period Close at risk\`.

## What went well
- WVI correlated infra → app → process within 2 min of the first signal.
- RB-217 was auto-staged from the early-warning pattern at T-08m.
- Comms to Finance leadership were drafted automatically and shipped within 8 min of P1 declaration.

## What didn't go well
**Recommendation R-2271 ("Bump redo storage to Premium SSD v2") was flagged 9 days ago and auto-deferred** by policy P-4 (cost-impacting changes deferred to monthly review). The auto-defer policy did not weight the criticality of the affected process (Tier-1, GL Period Close).

## Action items
1. **Apply IaC PR-4471** (already executed during incident) — redo storage now Premium SSD v2 / 32k IOPS budget. **Owner:** DBA. **Done.**
2. **Re-evaluate auto-defer policy P-4.** Never auto-defer recommendations affecting Tier-1 processes. **Owner:** SRE + CSA.
3. **Add proactive capacity check** to weekly review: storage IOPS headroom for redo volume across all Tier-1 workloads. **Owner:** Platform.
4. **Apply rec-3801** (apps tier zone redundancy) to remove the secondary risk surfaced during this incident. **Owner:** Platform.

## Lessons
The signal was not new — it had been flagged 9 days earlier. The gap was in the **policy** that decided what to act on. WVI's contribution here is that we can now trace contributing factors back through the recommendation history and demonstrate that the architecture has knowledge that, had it been acted on, would have prevented the incident entirely.
`,
};

// ============================================================
// WORKLOAD AGGREGATE
// ============================================================

export const ebsProd: Workload = {
  id: "ebs-prod",
  name: "Oracle EBS Production",
  archetype: {
    id: "ebs-r1222-on-oracledb-azure",
    name: "Oracle EBS R12.2 on Oracle DB@Azure",
    latestVersion: "v2.4",
  },
  archetypeVersionApplied: "v2.3",
  ownerEmail: "ebs-platform@contoso.com",
  subscription: "Contoso Production",
  subscriptionId: "9d3a7f1e-2b6c-4f9d-8a01-1c4e7e0a8a23",
  resourceGroup: "rg-ebs-prod-eastus",
  region: "East US",
  tier: 1,
  iqActivated: true,
  onboardingProgress: { stepsTotal: 8, stepsComplete: 6 },
  processes,
  applicationComponents,
  infrastructureResources,
  dependencies,
  monthlyCostUsd: 187_400,
  slos: [
    {
      id: "slo-gl-close",
      processId: "gl-close",
      name: "GL Period Close completion",
      target: "Complete within 8h, monthly",
      current: 0.998,
      errorBudgetRemaining: 0.62,
    },
    {
      id: "slo-o2c",
      processId: "o2c",
      name: "O2C availability",
      target: "99.9% over 30d",
      current: 0.9994,
      errorBudgetRemaining: 0.78,
    },
    {
      id: "slo-p2p",
      processId: "p2p",
      name: "P2P availability",
      target: "99.5% over 30d",
      current: 0.9989,
      errorBudgetRemaining: 0.92,
    },
    {
      id: "slo-ap-val",
      processId: "ap-val",
      name: "AP invoice validation lag",
      target: "< 30 min",
      current: 0.997,
      errorBudgetRemaining: 0.85,
    },
    {
      id: "slo-payroll",
      processId: "payroll",
      name: "Payroll on-time",
      target: "100% on bi-weekly schedule",
      current: 1,
      errorBudgetRemaining: 1,
    },
    {
      id: "slo-fin-report",
      processId: "fin-report",
      name: "Financial reporting",
      target: "Day 5 close",
      current: 1,
      errorBudgetRemaining: 1,
    },
  ],
};

export { DEMO_NOW };
