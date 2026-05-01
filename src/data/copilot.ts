import type { CopilotTurn, ScenarioStepId } from "./schema";

export const COPILOT_TURNS: Record<ScenarioStepId, CopilotTurn[]> = {
  steady: [
    {
      role: "user",
      text: "Anything I should know about Oracle EBS Production right now?",
    },
    {
      role: "assistant",
      text: "All 7 business processes are healthy. GL Period Close, O2C, P2P all in their SLOs. There are 6 open architecture drift items — 2 critical (redo storage tier, NSG inbound 1521). I can summarize them or open the most important one for you.",
      citations: [
        { componentId: "i-stg-redo", label: "Redo storage drift" },
        { componentId: "i-nsg-db", label: "DB NSG drift" },
      ],
    },
  ],
  early: [
    {
      role: "assistant",
      text: "I'm seeing a precursor pattern that has preceded 3 prior log file sync incidents on this cluster. Redo write P95 has climbed from 4ms to 9ms in the last 6 minutes. Concurrent Manager queue depth is up 5.7×. I have RB-217 staged and have proactively notified the DBA. No customer impact yet.",
      citations: [
        { componentId: "i-stg-redo", label: "Redo storage" },
        { componentId: "i-odba-rac", label: "Oracle DB@Azure RAC" },
        { componentId: "a-cm", label: "Concurrent Manager" },
      ],
    },
  ],
  incident: [
    {
      role: "assistant",
      text: "INC-4471 declared. Causal chain: storage IOPS throttle on Premium SSD v1 → Oracle log file sync waits → RAC node 2 evicted → Concurrent Manager saturation → GL Period Close at risk. Tier-1 process. I have paged DBA, App Admin, SRE, Biz Ops, FinOps. Recommended runbook RB-217 is staged.",
      citations: [
        { componentId: "i-stg-redo", label: "Storage" },
        { componentId: "i-odba-rac", label: "RAC" },
        { componentId: "a-cm", label: "Concurrent Manager" },
        { componentId: "p-gl-close", label: "GL Period Close" },
      ],
    },
  ],
  impact: [
    {
      role: "assistant",
      text: "Business impact: GL Period Close is on a trajectory to miss its 8h SLO with $4.2M/day of revenue at risk. I have drafted a Finance close-out message for your review and started executing RB-217 step 4 (storage SKU bump). RAC node 2 will be re-added once write latency normalizes.",
      citations: [
        { componentId: "p-gl-close", label: "GL Period Close" },
        { componentId: "i-stg-redo", label: "Storage SKU change" },
      ],
    },
  ],
  resolved: [
    {
      role: "assistant",
      text: "INC-4471 resolved at T+45m. Total customer impact: 0 — close projected to complete within SLO at 7h 42m. I have drafted the post-mortem with a contributing-factor finding: recommendation R-2271 was deferred 9 days ago by auto-defer policy P-4. I propose tightening P-4 to never auto-defer items affecting Tier-1 processes. Awaiting your review.",
      citations: [
        { componentId: "p-gl-close", label: "GL Period Close" },
      ],
    },
  ],
};

export const COPILOT_SUGGESTIONS: string[] = [
  "Why is GL Period Close at risk?",
  "Show me the blast radius of the redo storage volume",
  "Draft a Finance close-call message",
  "What was deferred 9 days ago?",
  "Summarize cost per business process",
];
