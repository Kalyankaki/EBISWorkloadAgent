# Workload Virtual Index — Master Build Prompt

> **For Claude Code.** This document is the master spec for building the Workload Virtual Index (WVI) demo experience for Azure portal. It is meant to be pasted into Claude Code as the source of truth, then executed phase by phase.

---

## 1. Mission

Build a working demo of **Workload Virtual Index** — a new Azure portal experience that lets a customer declare a workload (Oracle EBS in this demo), bind it to a canonical model of business processes + reference infrastructure, and surfaces a single graph that propagates infrastructure signals up to business-process impact, surfaced differently for each persona.

The demo must:
1. Look indistinguishable from real Azure portal chrome (Segoe UI, dark theme by default, blade pattern, command bar, breadcrumb, left rail).
2. Tell a complete narrative: deploy → onboard → activate Workload IQ → run steady state → live incident → resolution → optimization.
3. Re-project the same underlying WVI graph through 8 personas, where each persona sees a tailored dashboard but reads from the same data.
4. Use Oracle EBS R12.2 on Oracle Database@Azure as the canonical example workload.
5. Be entirely fixture-driven (no backend) — every state transition must be deterministic and replayable.

**The differentiator to demonstrate**: cross-stack causal propagation. An infra signal (storage IOPS throttle) becomes an app signal (Concurrent Manager queue saturation) becomes a business signal (GL period close at risk → $4.2M/day delay impact). Today no Azure surface ties these layers. WVI does.

---

## 2. Tech Stack

- **Next.js 14** (App Router) + **TypeScript (strict)**
- **Fluent UI React v9** (`@fluentui/react-components`) with Azure portal dark theme tokens
- **Tailwind CSS** for layout (utility-only)
- **React Flow** (`@xyflow/react`) for topology graphs
- **Recharts** for time-series and pillar score charts
- **Zustand** for global state (persona, scenario step, current workload)
- **Framer Motion** for blade slide-in animations and incident pulse effects
- **Lucide React** for icons
- **No backend.** Everything is fixture-driven via TypeScript modules under `src/data/`.

See the original brief for full tech-stack and visual-design details. The fixture is Oracle EBS Production on Oracle Database@Azure plus a smaller Oracle EBS UAT.

The 5 scenario steps are deterministic: `steady` (T-30m) → `early` (T-08m) → `incident` (T+00m) → `impact` (T+15m) → `resolved` (T+45m).

The 8+1 personas: csa, appadmin, dba, infra, sre, bizops, finops, secops, aiagent.
