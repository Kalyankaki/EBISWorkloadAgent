import type { Persona, PersonaPanelItem, ScenarioState, Workload } from "./schema";

export const PERSONAS: Persona[] = [
  {
    id: "csa",
    name: "Cloud Solution Architect",
    short: "CSA",
    initials: "CS",
    color: "#7b61ff",
    iconKey: "Network",
    tagline: "Architectural posture · drift · evolution",
    primaryTabs: ["overview", "topology", "recommendations"],
  },
  {
    id: "appadmin",
    name: "EBS Application Admin",
    short: "App Admin",
    initials: "AA",
    color: "#ff7a45",
    iconKey: "Server",
    tagline: "Modules, runtime queues, integrations",
    primaryTabs: ["application", "incidents"],
  },
  {
    id: "dba",
    name: "Database Admin",
    short: "DBA",
    initials: "DB",
    color: "#13c2c2",
    iconKey: "Database",
    tagline: "RAC, ASM, redo, backups, Data Guard",
    primaryTabs: ["infrastructure", "incidents"],
  },
  {
    id: "infra",
    name: "Infra / Platform",
    short: "Platform",
    initials: "IP",
    color: "#4096ff",
    iconKey: "Server",
    tagline: "VMs, networking, storage, capacity",
    primaryTabs: ["infrastructure", "topology"],
  },
  {
    id: "sre",
    name: "Site Reliability",
    short: "SRE",
    initials: "SR",
    color: "#52c41a",
    iconKey: "Activity",
    tagline: "Availability, error budgets, runbooks",
    primaryTabs: ["incidents", "topology"],
  },
  {
    id: "bizops",
    name: "Business Operations",
    short: "Biz Ops",
    initials: "BO",
    color: "#fa541c",
    iconKey: "TrendingUp",
    tagline: "Process health, revenue at risk, comms",
    primaryTabs: ["overview", "incidents"],
  },
  {
    id: "finops",
    name: "FinOps",
    short: "FinOps",
    initials: "FO",
    color: "#faad14",
    iconKey: "DollarSign",
    tagline: "Cost per process, waste, optimization",
    primaryTabs: ["cost", "recommendations"],
  },
  {
    id: "secops",
    name: "Security Ops",
    short: "SecOps",
    initials: "SO",
    color: "#eb2f96",
    iconKey: "Shield",
    tagline: "Posture, exposure, identity, audit",
    primaryTabs: ["recommendations", "infrastructure"],
  },
  {
    id: "aiagent",
    name: "AI Agent",
    short: "AI Agent",
    initials: "AI",
    color: "#2899f5",
    iconKey: "Bot",
    tagline: "Autonomous actions with approval gates",
    primaryTabs: ["overview", "incidents"],
  },
];

export const personaById = (id: string): Persona =>
  PERSONAS.find((p) => p.id === id) ?? PERSONAS[0];

// ============================================================
// LENS — produces 3 panel items per persona, scenario-aware
// ============================================================

export function personaLens(
  personaId: string,
  workload: Workload,
  state: ScenarioState
): PersonaPanelItem[] {
  const step = state.stepId;
  const isProd = workload.id === "ebs-prod";

  // Non-prod: keep mostly green for all personas
  if (!isProd) {
    return [
      {
        title: "Workload nominal",
        body: "All processes green. Last drift scan completed 4 hours ago, no findings.",
        tone: "good",
      },
      {
        title: "No active incidents",
        body: "0 P1/P2 incidents in last 30 days. Error budget intact for all SLOs.",
        tone: "good",
      },
      {
        title: "Reference architecture",
        body: "Conforms to archetype v2.4. 2 deferred recommendations, all low-severity.",
        tone: "info",
      },
    ];
  }

  switch (personaId) {
    case "csa":
      return csa(step);
    case "appadmin":
      return appadmin(step);
    case "dba":
      return dba(step);
    case "infra":
      return infra(step);
    case "sre":
      return sre(step);
    case "bizops":
      return bizops(step);
    case "finops":
      return finops(step);
    case "secops":
      return secops(step);
    case "aiagent":
      return aiagent(step);
    default:
      return [];
  }
}

const csa = (s: string): PersonaPanelItem[] => {
  if (s === "incident" || s === "impact") {
    return [
      {
        title: "Architecture under stress",
        body: "Reference archetype v2.4 not fully applied. Redo storage on Premium SSD v1 — drift flagged 9d ago.",
        tone: "bad",
        cta: "View drift report",
      },
      {
        title: "Conformance: 87%",
        body: "11 of 13 components match reference. Apps tier zone redundancy below target (1 of 3 zones in use).",
        tone: "warn",
      },
      {
        title: "Architectural action",
        body: "Apply archetype v2.4 IaC PR (PR-4471) to lift redo IOPS budget, expand zones. Estimated effort 6h.",
        tone: "info",
        cta: "Open PR-4471",
      },
    ];
  }
  return [
    {
      title: "Conformance score: 91%",
      body: "Reference architecture v2.3 deployed. v2.4 available — adds 3-zone apps tier and IOPS budget headroom.",
      tone: "info",
      cta: "Preview v2.4 diff",
    },
    {
      title: "6 drift items",
      body: "2 critical (redo storage tier, NSG inbound 1521), 3 warning, 1 info. None blocking close.",
      tone: "warn",
    },
    {
      title: "Well-Architected score",
      body: "Reliability 78 · Security 84 · Cost 72 · Operations 81 · Performance 76. Cost & Performance trending up.",
      tone: "good",
    },
  ];
};

const appadmin = (s: string): PersonaPanelItem[] => {
  if (s === "incident" || s === "impact") {
    return [
      {
        title: "Concurrent Manager saturated",
        body: "Queue depth 4,210 (10× baseline). 32 workers stalled on log file sync waits. GL_INTERFACE backlog 18,400 rows.",
        tone: "bad",
        cta: "Open Concurrent Manager",
      },
      {
        title: "Module impact: GL, AP",
        body: "GL Period Close at risk to miss 8h SLO. AP invoice import lagging 22 minutes behind submit time.",
        tone: "bad",
      },
      {
        title: "Recommended action",
        body: "Hold non-essential CM jobs (planning, MRP) until DB write latency normalizes. RB-217 step 3.",
        tone: "info",
        cta: "Run runbook step",
      },
    ];
  }
  if (s === "early") {
    return [
      {
        title: "Early signal: GL_INTERFACE",
        body: "Queue depth climbing — currently 1,820 vs baseline 320. Up 5.7×. Watching log file sync waits.",
        tone: "warn",
      },
      {
        title: "Modules nominal",
        body: "GL, AP, AR, INV, OM, PO all reporting healthy. No SLO breaches.",
        tone: "good",
      },
      {
        title: "Integrations",
        body: "EBS ↔ Salesforce ↔ Workday all green. Last sync 90s ago.",
        tone: "good",
      },
    ];
  }
  return [
    {
      title: "All modules healthy",
      body: "GL, AP, AR, INV, OM, PO, HR — all green. Concurrent Manager queue baseline 320, throughput 4,200/hr.",
      tone: "good",
    },
    {
      title: "Patch level",
      body: "EBS R12.2.10 · April 2026 CPU applied. Next CPU window: 2026-07-12 Sat 02:00 UTC.",
      tone: "info",
    },
    {
      title: "Integrations",
      body: "8 inbound, 4 outbound. Salesforce, Workday, ServiceNow, Concur all green.",
      tone: "good",
    },
  ];
};

const dba = (s: string): PersonaPanelItem[] => {
  if (s === "incident" || s === "impact") {
    return [
      {
        title: "RAC node 2 evicted",
        body: "Node 2 left cluster at T+04m due to log file sync waits exceeding 90s threshold. Now running on node 1 only.",
        tone: "bad",
        cta: "Open Oracle DB@Azure",
      },
      {
        title: "Wait events spiking",
        body: "log file sync 72% · log file parallel write 18% · gc cr block 2-way 6%. Baseline log file sync was 4%.",
        tone: "bad",
      },
      {
        title: "Storage backpressure",
        body: "Premium SSD v1 redo volume hit 5,200 IOPS sustained — throttle threshold 5,000. Throughput collapsed.",
        tone: "bad",
        cta: "Bump to Premium SSD v2",
      },
    ];
  }
  if (s === "early") {
    return [
      {
        title: "Redo write latency climbing",
        body: "P95 18ms vs baseline 4ms. Recommend pre-emptive checkpoint and review concurrent batch jobs.",
        tone: "warn",
      },
      {
        title: "RAC nodes nominal",
        body: "2 nodes online. CPU 38% · 41%. Cache hit ratio 99.2%. SCAN listener healthy.",
        tone: "good",
      },
      {
        title: "Backup status",
        body: "Last RMAN L0: 22h ago · L1: 4h ago. Data Guard apply lag 2s.",
        tone: "good",
      },
    ];
  }
  return [
    {
      title: "Database healthy",
      body: "Exadata X11M · 2 nodes · 19.21 · April 2026 CPU. Cache hit 99.2%, redo write P95 4ms.",
      tone: "good",
    },
    {
      title: "Data Guard",
      body: "Standby in maximum availability. Apply lag 2s. Switchover tested 2026-04-08.",
      tone: "good",
    },
    {
      title: "Backups",
      body: "RMAN L0 weekly Sun, L1 daily, archive every 15m. RPO 15m, RTO 90m.",
      tone: "good",
    },
  ];
};

const infra = (s: string): PersonaPanelItem[] => {
  if (s === "incident" || s === "impact") {
    return [
      {
        title: "Storage IOPS throttle",
        body: "Redo storage on Premium SSD v1 — 5,000 IOPS budget exhausted. Bursting unavailable on v1 tier.",
        tone: "bad",
      },
      {
        title: "App tier zone exposure",
        body: "VMSS apps-prod-vmss running in single zone (zone 1). 2 of 3 zones empty — capacity gap during incident.",
        tone: "warn",
      },
      {
        title: "Capacity reserve",
        body: "12 cores reserved, 4 free. Network egress nominal. Express Route circuit healthy.",
        tone: "good",
      },
    ];
  }
  return [
    {
      title: "Capacity nominal",
      body: "Apps tier 38% · DB tier 41% · network egress 18 Gbps of 100 Gbps. No throttling.",
      tone: "good",
    },
    {
      title: "Express Route",
      body: "Circuit healthy. Primary 4 Gbps, secondary failover tested 2026-03-20.",
      tone: "good",
    },
    {
      title: "Defender for Cloud",
      body: "Secure score 78%. 0 high alerts, 4 medium (NSG audit, diagnostics).",
      tone: "info",
    },
  ];
};

const sre = (s: string): PersonaPanelItem[] => {
  if (s === "incident") {
    return [
      {
        title: "INC-4471 active · P1",
        body: "GL Period Close at risk. Causal chain: Storage IOPS → RAC log waits → CM saturation → GL backlog.",
        tone: "bad",
        cta: "Open incident",
      },
      {
        title: "Runbook RB-217 ready",
        body: "Auto-recommended. 6 steps · est. 18 minutes. Bumps redo IOPS, holds non-critical CM jobs.",
        tone: "info",
        cta: "Run runbook",
      },
      {
        title: "Personas paged",
        body: "DBA, App Admin, Biz Ops, FinOps. Auto-paged at T+02m by WVI rule R-12.",
        tone: "info",
      },
    ];
  }
  if (s === "impact") {
    return [
      {
        title: "INC-4471 mitigating · P1",
        body: "Storage IOPS bumped at T+12m. Concurrent Manager unblocked. RAC re-converging.",
        tone: "warn",
      },
      {
        title: "Business impact recorded",
        body: "GL close at $4.2M/day delay risk. Auto-drafted finance comms in queue for review.",
        tone: "warn",
        cta: "Review comms",
      },
      {
        title: "Error budget",
        body: "GL Period Close SLO budget consumed: 38% this month. 62% remaining.",
        tone: "warn",
      },
    ];
  }
  if (s === "resolved") {
    return [
      {
        title: "INC-4471 resolved",
        body: "All processes catching up. GL close on track to complete within 8h SLO. Post-mortem auto-drafted.",
        tone: "good",
        cta: "Open post-mortem",
      },
      {
        title: "Action items",
        body: "1) Apply IaC PR-4471 redo IOPS bump. 2) Review auto-defer policy that suppressed flag 9d ago.",
        tone: "info",
      },
      {
        title: "Error budget",
        body: "GL Period Close: 47% consumed this month. AR/AP/Order Entry budgets intact.",
        tone: "warn",
      },
    ];
  }
  if (s === "early") {
    return [
      {
        title: "Early-warning rule fired",
        body: "Redo write P95 climbing — proactive page sent to DBA at T-08m. No customer impact yet.",
        tone: "warn",
      },
      {
        title: "0 active incidents",
        body: "All SLOs in budget. Last incident: 14 days ago (P3, resolved 9 min).",
        tone: "good",
      },
      {
        title: "Runbooks",
        body: "RB-217 staged based on telemetry pattern. Ready to execute on confirmation.",
        tone: "info",
      },
    ];
  }
  return [
    {
      title: "0 active incidents",
      body: "GL Period Close · O2C · P2P · all SLOs in budget. Error budget remaining 92%.",
      tone: "good",
    },
    {
      title: "MTTR last 90d",
      body: "P1: 22m · P2: 41m · P3: 18m. Auto-runbook coverage 78%.",
      tone: "good",
    },
    {
      title: "Chaos drill",
      body: "Last drill: 2026-04-15, simulated DB node failover. RTO 96s, target 120s.",
      tone: "info",
    },
  ];
};

const bizops = (s: string): PersonaPanelItem[] => {
  if (s === "incident") {
    return [
      {
        title: "GL Period Close — at risk",
        body: "Period close batch lagging. SLO 8h, current trajectory 11h. Finance close-out call at 17:00 UTC.",
        tone: "bad",
      },
      {
        title: "Revenue at risk",
        body: "Estimated $4.2M/day delayed recognition if close slips one business day. Tier-1 process.",
        tone: "bad",
      },
      {
        title: "Auto-drafted comms",
        body: "Message to CFO + close-call DL ready for review. References INC-4471 with ETA and mitigation.",
        tone: "info",
        cta: "Review & send",
      },
    ];
  }
  if (s === "impact") {
    return [
      {
        title: "Revenue at risk: $4.2M/day",
        body: "Close batch will exceed 8h SLO. Mitigation in progress, ETA T+45m. CFO update queued.",
        tone: "bad",
      },
      {
        title: "Downstream processes",
        body: "AP invoice import delayed 22m. AR collections nominal. Order Entry nominal.",
        tone: "warn",
      },
      {
        title: "Compliance",
        body: "SOX close evidence package will be generated post-close. Audit trail intact.",
        tone: "info",
      },
    ];
  }
  if (s === "resolved") {
    return [
      {
        title: "Close on track",
        body: "GL Period Close projecting 7h 42m — within 8h SLO. AP/AR/OE all green.",
        tone: "good",
      },
      {
        title: "Comms cycle",
        body: "Closeout email auto-drafted with timeline of incident and mitigation. Awaiting your sign-off.",
        tone: "info",
        cta: "Review",
      },
      {
        title: "Process scorecard",
        body: "GL · AP · AR · OE · P2P all back to green within 30 min of mitigation.",
        tone: "good",
      },
    ];
  }
  return [
    {
      title: "All processes green",
      body: "GL · AP · AR · OE · P2P · Inventory · HR — 7 processes, 0 at risk.",
      tone: "good",
    },
    {
      title: "Period close",
      body: "Next close window: month-end. Last close completed in 7h 12m, well within 8h SLO.",
      tone: "good",
    },
    {
      title: "Impact ledger",
      body: "0 process incidents this month. $0 revenue at risk YTD attributable to platform issues.",
      tone: "good",
    },
  ];
};

const finops = (s: string): PersonaPanelItem[] => {
  if (s === "impact") {
    return [
      {
        title: "Cost-to-serve impact",
        body: "Incident emergency overprovision +$1,840 today. Burst storage cost +$420. Pre-approved within budget.",
        tone: "warn",
      },
      {
        title: "Cost per process",
        body: "GL Close: $18K/mo · O2C: $61K/mo · P2P: $42K/mo. Top consumer: Exadata DB tier ($86K/mo).",
        tone: "info",
      },
      {
        title: "Optimization",
        body: "Repurposing 30% of standby Exadata for read-only reporting recovers $14K/mo. Apply post-incident.",
        tone: "info",
        cta: "Open recommendation",
      },
    ];
  }
  return [
    {
      title: "Monthly run-rate: $187K",
      body: "Trending −3% MoM. DB 46% · Apps 22% · Network 12% · Storage 10% · Other 10%.",
      tone: "info",
    },
    {
      title: "Cost per business process",
      body: "GL: $18K · AP: $11K · AR: $14K · OE: $61K · P2P: $42K · Inv: $27K · HR: $14K /mo.",
      tone: "info",
    },
    {
      title: "Optimization opportunities",
      body: "$14K/mo from standby Exadata reuse. $3K/mo from VMSS rightsizing. $2K/mo from cold-tier moves.",
      tone: "good",
      cta: "Review",
    },
  ];
};

const secops = (s: string): PersonaPanelItem[] => {
  if (s === "incident" || s === "impact") {
    return [
      {
        title: "No security alerts in incident",
        body: "Defender for Cloud + Oracle audit logs reviewed. No anomalous auth, no exfil signal correlated.",
        tone: "good",
      },
      {
        title: "Posture exposure",
        body: "NSG rule allows 1521 from broader range than reference (10.0.0.0/8 vs /16). Open finding 11d.",
        tone: "warn",
        cta: "Tighten NSG",
      },
      {
        title: "Audit trail",
        body: "All admin actions during incident window logged. SOX evidence package will include runbook executions.",
        tone: "info",
      },
    ];
  }
  return [
    {
      title: "Defender Secure Score: 78%",
      body: "+4 pts MoM. Top items: NSG audit (1521 inbound range), Key Vault diagnostic logs missing.",
      tone: "info",
    },
    {
      title: "Identity",
      body: "All EBS database & app admin accounts use Entra ID + PIM JIT. 0 standing privileges.",
      tone: "good",
    },
    {
      title: "Data classification",
      body: "GL · AR · AP datastores tagged Confidential. Encryption: TDE on, customer-managed keys via Key Vault HSM.",
      tone: "good",
    },
  ];
};

const aiagent = (s: string): PersonaPanelItem[] => {
  if (s === "early") {
    return [
      {
        title: "Pattern detected",
        body: "Redo write latency trend matches 'log file sync precursor' pattern (3 historical incidents). Confidence 84%.",
        tone: "warn",
      },
      {
        title: "Staged actions (await approval)",
        body: "1) Pre-stage RB-217 · 2) Page DBA · 3) Hold non-essential CM jobs. No auto-execute without DBA ack.",
        tone: "info",
        cta: "Approve stage",
      },
      {
        title: "Last 7 days",
        body: "47 actions taken (44 auto-approved low-risk · 3 awaited human approval). 0 reverted.",
        tone: "good",
      },
    ];
  }
  if (s === "incident" || s === "impact") {
    return [
      {
        title: "Active mitigation",
        body: "RB-217 step 1–3 executed. Step 4 (storage SKU change) requires CSA approval — sent at T+02m.",
        tone: "warn",
        cta: "Approve step 4",
      },
      {
        title: "Comms drafted",
        body: "Finance close-call message · post-mortem skeleton · IaC PR description — all awaiting your review.",
        tone: "info",
      },
      {
        title: "Confidence",
        body: "Root cause confidence 96% (storage IOPS throttle). Fix confidence 91% (IOPS budget bump).",
        tone: "info",
      },
    ];
  }
  if (s === "resolved") {
    return [
      {
        title: "Post-mortem drafted",
        body: "Includes timeline, causal chain, contributing factors (deferred recommendation R-2271), action items.",
        tone: "good",
        cta: "Review draft",
      },
      {
        title: "Policy proposal",
        body: "Auto-defer policy P-4 suppressed R-2271 9d ago. Recommend tightening: never auto-defer items affecting Tier-1.",
        tone: "info",
        cta: "Open policy",
      },
      {
        title: "Knowledge update",
        body: "Pattern catalog updated with 'Premium SSD v1 redo throttle' signature. Future detection: ~3 min earlier.",
        tone: "good",
      },
    ];
  }
  return [
    {
      title: "Idle · monitoring",
      body: "Watching 31 signals across 13 components. No anomalies. Last action 2h 14m ago (cost optimization).",
      tone: "good",
    },
    {
      title: "Auto-actions enabled",
      body: "Low-risk: log rotation · cost rebalance · index advise. Med/High-risk require human ack.",
      tone: "info",
    },
    {
      title: "Trust posture",
      body: "94% accept rate over last 30d. 0 reverts. Avg time-to-action saved: 38 min/incident.",
      tone: "good",
    },
  ];
};
