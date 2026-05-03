// ============================================================
// IDS & ENUMS
// ============================================================

export type WorkloadId = string;
export type ComponentId = string;

export type HealthStatus = "healthy" | "warning" | "critical" | "unknown";
export type Criticality = "Critical" | "High" | "Medium" | "Low";
export type ComponentLayer = "process" | "application" | "infrastructure";

export type ResourceKind =
  | "Database"
  | "Compute"
  | "Network"
  | "Storage"
  | "Security"
  | "Observability"
  | "Identity"
  | "Integration";

export type ScenarioStepId =
  | "steady"
  | "early"
  | "incident"
  | "impact"
  | "resolved";

export type PersonaId =
  | "csa"
  | "appadmin"
  | "dba"
  | "infra"
  | "sre"
  | "bizops"
  | "finops"
  | "secops"
  | "aiagent";

// ============================================================
// WORKLOAD
// ============================================================

export interface Workload {
  id: WorkloadId;
  name: string;
  archetype: WorkloadArchetypeRef;
  archetypeVersionApplied: string;
  ownerEmail: string;
  subscription: string;
  subscriptionId: string;
  resourceGroup: string;
  region: string;
  tier: 1 | 2 | 3;
  iqActivated: boolean;
  onboardingProgress: { stepsTotal: number; stepsComplete: number };
  processes: BusinessProcess[];
  applicationComponents: ApplicationComponent[];
  infrastructureResources: InfrastructureResource[];
  dependencies: Dependency[];
  monthlyCostUsd: number;
  slos: WorkloadSlo[];
}

export interface WorkloadArchetypeRef {
  id: string;
  name: string;
  latestVersion: string;
}

// ============================================================
// COMPONENTS — three layers
// ============================================================

export interface BusinessProcess {
  id: ComponentId;
  layer: "process";
  name: string;
  ebsModule: string;
  ownerOrg: string;
  criticality: Criticality;
  revenueAtRisk: {
    value: number;
    unit: "USD/hr" | "USD/day" | "compliance" | "foundation";
  };
  slo: string;
  tags: string[];
}

export interface ApplicationComponent {
  id: ComponentId;
  layer: "application";
  name: string;
  kind: "ebs-module" | "ebs-runtime" | "integration";
  description?: string;
  runtimeProperties?: Record<string, string>;
}

export interface InfrastructureResource {
  id: ComponentId;
  layer: "infrastructure";
  name: string;
  kind: ResourceKind;
  azureResourceType: string;
  sku: string;
  region: string;
  zoneRedundancy: 1 | 2 | 3;
  matchesReference: boolean;
  driftReason?: string;
}

// ============================================================
// DEPENDENCIES — the edges
// ============================================================

export interface Dependency {
  id: string;
  fromId: ComponentId;
  toId: ComponentId;
  kind: "uses" | "stores-in" | "communicates-with" | "monitored-by";
  weight: number;
}

// ============================================================
// SLO
// ============================================================

export interface WorkloadSlo {
  id: string;
  processId: ComponentId;
  name: string;
  target: string;
  current: number;
  errorBudgetRemaining: number;
}

// ============================================================
// SIGNAL (per-component health snapshot per scenario step)
// ============================================================

export interface ComponentSignal {
  componentId: ComponentId;
  health: HealthStatus;
  note?: string;
  series?: { t: number; v: number }[];
  unit?: string;
}

export type SignalSnapshot = Record<ComponentId, ComponentSignal>;

// ============================================================
// INCIDENT
// ============================================================

export interface Incident {
  id: string;
  workloadId: WorkloadId;
  severity: "P1" | "P2" | "P3" | "P4";
  status: "active" | "mitigating" | "resolved";
  title: string;
  startedAt: string;
  causalChain: CausalChainNode[];
  recommendedRunbookId: string | null;
  pagedPersonaIds: PersonaId[];
  businessImpactDraftMd: string;
  postMortemDraftMd?: string;
  runbookSteps?: RunbookStep[];
}

export interface CausalChainNode {
  componentId: ComponentId;
  layer: ComponentLayer;
  observedAt: string;
  summary: string;
  health: HealthStatus;
}

export interface RunbookStep {
  id: string;
  title: string;
  description: string;
  componentId?: ComponentId;
  estimatedMinutes: number;
  destructive?: boolean;
}

// ============================================================
// RECOMMENDATION
// ============================================================

export interface Recommendation {
  id: string;
  workloadId: WorkloadId;
  category:
    | "Reliability"
    | "Security"
    | "Cost"
    | "Operations"
    | "Performance"
    | "Architecture";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  rationale: string;
  affectedProcesses: ComponentId[];
  affectedResources: ComponentId[];
  estimatedCostDeltaUsdPerMonth?: number;
  estimatedRiskReductionPct?: number;
  iaCPullRequest?: string;
  status: "open" | "applied" | "deferred" | "dismissed";
  flaggedAt: string;
}

// ============================================================
// PERSONA
// ============================================================

export interface Persona {
  id: PersonaId;
  name: string;
  short: string;
  initials: string;
  color: string;
  iconKey: string;
  tagline: string;
  primaryTabs: string[];
  lensFn: PersonaLensFn;
}

export interface PersonaPanelItem {
  tone: "critical" | "warn" | "good" | "info";
  title: string;
  body: string;
  metric?: string;
  metricSub?: string;
  cta?: string;
  target?: string; // tab id to navigate to on click
}

export type PersonaLensFn = (
  workload: Workload,
  scenario: ScenarioState,
  allRecs: Recommendation[]
) => PersonaPanelItem[];

// ============================================================
// SCENARIO
// ============================================================

export interface ScenarioStep {
  id: ScenarioStepId;
  label: string;
  time: string;
  description: string;
}

export interface ScenarioState {
  stepId: ScenarioStepId;
  signals: SignalSnapshot;
  activeIncidentIds: string[];
}

// ============================================================
// ARCHETYPE (reference architecture)
// ============================================================

export interface WorkloadArchetype {
  id: string;
  name: string;
  version: string;
  description: string;
  referenceComponents: {
    layer: ComponentLayer;
    role: string;
    expectedSku: string;
    expectedZoneRedundancy: number;
  }[];
  wellArchitected: {
    reliability: number;
    security: number;
    cost: number;
    operations: number;
    performance: number;
  };
  iaCRepoUrl: string;
}

// ============================================================
// DRIFT
// ============================================================

export interface DriftItem {
  id: string;
  workloadId: WorkloadId;
  componentId: ComponentId;
  property: string;
  actual: string;
  expected: string;
  severity: "critical" | "warning" | "info";
  detectedAt: string;
  impact: string;
}

// ============================================================
// COPILOT
// ============================================================

export interface CopilotTurn {
  role: "user" | "assistant";
  text: string;
  citations?: { componentId: ComponentId; label: string }[];
}
