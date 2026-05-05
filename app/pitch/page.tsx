import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  Boxes,
  Server,
  Sparkles,
  Cpu,
  Network as NetIcon,
  Database,
  Shield,
  DollarSign,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Target,
  Megaphone,
} from "lucide-react";
import { Breadcrumb } from "@/components/shell/Breadcrumb";
import { Card } from "@/components/primitives/Card";
import { Pill } from "@/components/primitives/Pill";

// Static, fixture-derived. Numbers mirror the EBS Prod demo so the
// pitch never drifts from what gets shown on stage.

export default function PitchPage() {
  return (
    <div className="pb-16">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Workload Virtual Instance", href: "/workloads" },
          { label: "Exec overview & pitch" },
        ]}
      />

      <div className="px-5 pt-3 pb-2 flex items-center gap-3">
        <div className="w-12 h-12 rounded-ax bg-gradient-to-br from-[#003a85] to-[#0078d4] grid place-items-center shrink-0">
          <Megaphone size={22} className="text-white" />
        </div>
        <div>
          <div className="text-[22px] font-light text-ax-text">
            Workload Virtual Instance — Executive overview
          </div>
          <div className="text-[12px] text-ax-textMute">
            A pitch for Microsoft leadership · why this matters for Azure ·
            why now
          </div>
        </div>
      </div>

      <div className="px-5 max-w-[1320px] space-y-4">

        {/* ============================================================ */}
        {/* HERO — one-line value prop + 4 KPIs                          */}
        {/* ============================================================ */}
        <Card>
          <div className="text-[15px] text-ax-text leading-relaxed mb-4">
            <span className="text-ax-accent font-semibold">
              Workload Virtual Instance (WVI)
            </span>{" "}
            binds Azure infrastructure → enterprise application components →
            customer business processes into a single graph.{" "}
            <span className="text-ax-text">Workload IQ</span> propagates
            signals across the graph so every persona — CSA to FinOps to the
            CFO — sees the same truth through their own lens. Today no Azure
            surface ties these layers. WVI does.
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiBlock
              Icon={Clock}
              tone="info"
              label="Time-to-correlate"
              value="2 min"
              sub="vs hours on current tools"
            />
            <KpiBlock
              Icon={DollarSign}
              tone="bad"
              label="Revenue surfaced"
              value="$4.2M/day"
              sub="GL Period Close at risk"
            />
            <KpiBlock
              Icon={TrendingUp}
              tone="good"
              label="MTTR reduction"
              value="−38 min"
              sub="per incident · AI Agent pre-staged"
            />
            <KpiBlock
              Icon={Target}
              tone="good"
              label="FinOps recovery"
              value="$14K/mo"
              sub="standby Exadata reuse · 1 click"
            />
          </div>
        </Card>

        {/* ============================================================ */}
        {/* PROBLEM                                                       */}
        {/* ============================================================ */}
        <Card title="The problem">
          <div className="text-[13px] text-ax-textDim leading-relaxed mb-4">
            Customers running enterprise workloads (Oracle EBS, SAP,
            mission-critical custom apps) live in three fragmented universes.
            They are owned by different teams, monitored by different tools,
            and their signals never meet.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Universe
              Icon={Briefcase}
              color="#7b61ff"
              label="Business process"
              who="Finance, Revenue, HR, Supply Chain"
              sees="Did GL close on time? Are orders going out?"
              tool="Spreadsheets · status calls"
            />
            <Universe
              Icon={Boxes}
              color="#2899f5"
              label="Application"
              who="EBS Admin · DBA · Workflow"
              sees="Concurrent Manager queue depth · log file sync"
              tool="OEM · custom dashboards"
            />
            <Universe
              Icon={Server}
              color="#5db85d"
              label="Infrastructure"
              who="SRE · Platform · SecOps"
              sees="Disk IOPS · VM CPU · NSG rules"
              tool="Azure Monitor · Defender · 3rd-party APM"
            />
          </div>
          <div className="mt-4 border border-ax-bad/30 bg-ax-bad/5 rounded-ax px-3 py-2.5 flex items-start gap-3 text-[13px]">
            <AlertTriangle size={14} className="text-ax-bad shrink-0 mt-0.5" />
            <div className="text-ax-textDim">
              <span className="text-ax-bad font-semibold">
                When the inevitable incident happens
              </span>{" "}
              — a redo-storage IOPS throttle — the SRE sees an Azure alert,
              the DBA sees Oracle wait events, the App Admin sees a queue
              depth growing, and{" "}
              <span className="text-ax-text">Finance only learns there's a problem when the close batch fails to complete.</span>{" "}
              Each persona is reasoning over a fragment of the same reality.
            </div>
          </div>
        </Card>

        {/* ============================================================ */}
        {/* WEDGE                                                         */}
        {/* ============================================================ */}
        <Card title="The wedge — one graph, one truth, many lenses">
          <div className="text-[13px] text-ax-textDim leading-relaxed mb-4">
            WVI is the unification layer. It declares a workload (Oracle EBS
            in this demo), binds it to a canonical archetype, and surfaces a
            single graph that <span className="text-ax-text">propagates infrastructure signals up to business-process impact</span>{" "}
            — surfaced differently for each persona.
          </div>
          <div className="border border-ax-border bg-ax-panel2 rounded-ax p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
              <Stage
                Icon={Server}
                title="Infra signal"
                body="Premium SSD v1 redo storage hits 20k IOPS sustained · throttle engages"
                color="#5db85d"
              />
              <ArrowAcross />
              <Stage
                Icon={Boxes}
                title="App signal"
                body="Oracle log file sync waits jump 4% → 72% · Concurrent Manager queue 320 → 4,210"
                color="#2899f5"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center mt-3">
              <ArrowDown />
              <Stage
                Icon={Briefcase}
                title="Business signal"
                body="GL Period Close projected to miss 8h SLO · $4.2M/day revenue at risk"
                color="#7b61ff"
              />
              <Stage
                Icon={Sparkles}
                title="What WVI does"
                body="Auto-pages DBA + App Admin + Biz Ops + FinOps · stages runbook RB-217 · drafts CFO message"
                color="#2899f5"
              />
            </div>
          </div>
          <div className="text-[12px] text-ax-textMute mt-3">
            Same graph, re-projected through 9 personas: CSA · App Admin · DBA
            · Platform · SRE · Biz Ops · FinOps · SecOps · AI Agent.
          </div>
        </Card>

        {/* ============================================================ */}
        {/* DIFFERENTIATOR                                                */}
        {/* ============================================================ */}
        <Card title="Why only Azure can do this credibly">
          <div className="text-[13px] text-ax-textDim leading-relaxed mb-4">
            WVI sits on top of differentiated capabilities <span className="text-ax-text font-semibold">no other cloud can replicate</span>.
            This is not a feature — it's a wedge that makes Azure the only
            cloud that understands enterprise workloads as workloads, not as
            resources.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Differentiator
              Icon={Database}
              title="Oracle Database@Azure"
              body="The only cloud Oracle co-engineers with. Lets WVI reach into Oracle wait events, Data Guard state, and RAC topology natively — and prove the pattern that matters most to enterprise customers."
            />
            <Differentiator
              Icon={Activity}
              title="Microsoft Fabric IQ stack"
              body="OneLake mirror of EBS data feeds the WVI graph with business-process telemetry without standing up parallel ETL. Fabric is the analytics layer that closes the loop."
            />
            <Differentiator
              Icon={NetIcon}
              title="Azure Monitor + Defender for Cloud"
              body="Unified signal substrate covering infra + identity + posture. WVI consumes these as native sources, not as integrations."
            />
            <Differentiator
              Icon={DollarSign}
              title="Cost Management"
              body="The only cloud cost system that already attributes spend at resource granularity — WVI rolls it up to business processes for the FinOps killer view."
            />
            <Differentiator
              Icon={Shield}
              title="Entra ID + PIM"
              body="Identity for cross-workload trust, audit trails, and just-in-time approvals on AI Agent autonomous actions."
            />
            <Differentiator
              Icon={Cpu}
              title="Archetype catalog (co-engineered)"
              body="Workload reference architectures co-engineered with workload owners (Oracle for EBS, SAP, internal for custom). The catalog is a moat."
            />
          </div>
        </Card>

        {/* ============================================================ */}
        {/* BEFORE / AFTER                                                */}
        {/* ============================================================ */}
        <Card title="What changes for customers">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="border border-ax-bad/30 bg-ax-bad/5 rounded-ax p-3">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-ax-bad mb-2">
                Before WVI
              </div>
              <ul className="text-[12px] text-ax-textDim space-y-1.5">
                <li>· Azure alert at T+00m — SRE only</li>
                <li>· DBA pulled in at T+12m via chat ping</li>
                <li>· App Admin pulled in at T+25m</li>
                <li>· Finance learns at T+90m (close batch fails)</li>
                <li>· Recommendations and incidents live in different tools</li>
                <li>· Cost is by resource, not by business process</li>
                <li>· Post-mortem hand-written over 3–5 days</li>
              </ul>
            </div>
            <div className="border border-ax-good/30 bg-ax-good/5 rounded-ax p-3">
              <div className="text-[11px] uppercase tracking-wider font-semibold text-ax-good mb-2">
                With WVI
              </div>
              <ul className="text-[12px] text-ax-textDim space-y-1.5">
                <li>· Pattern detected at T-08m, runbook pre-staged</li>
                <li>· DBA, App Admin, Biz Ops, FinOps auto-paged at T+02m</li>
                <li>· Causal chain rendered for every persona at T+02m</li>
                <li>· CFO message auto-drafted at T+12m with revenue at risk</li>
                <li>· Recommendations ranked by tier-1 process impact</li>
                <li>· Cost rolled up to GL Close, O2C, P2P, …</li>
                <li>· Post-mortem auto-drafted with contributing factors at T+45m</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* ============================================================ */}
        {/* QUANTIFIED VALUE                                              */}
        {/* ============================================================ */}
        <Card title="Quantified value · Oracle EBS demo (INC-4471)">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <Quantified label="Revenue at risk surfaced" value="$4.2M" sub="per day · in 2 min" tone="bad" />
            <Quantified label="MTTR" value="45 min" sub="vs ~3h baseline" tone="good" />
            <Quantified label="Personas auto-paged" value="5" sub="DBA · App Admin · SRE · Biz Ops · FinOps" tone="info" />
            <Quantified label="Contributing factor traced" value="9 days" sub="deferred recommendation R-2271" tone="warn" />
            <Quantified label="FinOps recovery" value="$14K/mo" sub="repurposing standby Exadata" tone="good" />
            <Quantified label="Drift items detected" value="6" sub="1 critical · 4 warnings · 1 info" tone="warn" />
            <Quantified label="Conformance score" value="91%" sub="vs archetype v2.4" tone="info" />
            <Quantified label="Auto-actions / month" value="47" sub="44 auto-approved · 0 reverted" tone="good" />
          </div>
          <div className="text-[12px] text-ax-textMute italic">
            All numbers above are produced by a single fixture and drive the
            full demo at <Link href="/workloads/ebs-prod" className="text-ax-accent hover:text-white">/workloads/ebs-prod</Link>.
            Switch the persona in the top bar; same data, different lens.
          </div>
        </Card>

        {/* ============================================================ */}
        {/* DEMO FLOW                                                     */}
        {/* ============================================================ */}
        <Card title="The 6-minute live demo">
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[12px] text-ax-textDim list-decimal list-inside">
            <li>Land on workloads list · scrub to T-30m steady · open Oracle EBS Production</li>
            <li>Persona = CSA · show conformance, drift, persona lens</li>
            <li>Open Onboarding tab · walk the 6 of 8 completed steps</li>
            <li>Scrub to T-08m · switch to DBA · AI Agent flags precursor pattern</li>
            <li>Scrub to T+00m · switch to SRE · causal chain renders on Overview</li>
            <li>Open Active Incident · show RB-217 + paged personas</li>
            <li>Scrub to T+15m · switch to Biz Ops · same incident as $4.2M/day Finance message</li>
            <li>Switch to CSA · open Recommendations · show R-2271 deferred 9 days ago</li>
            <li>Switch to FinOps · open Cost Map · show standby Exadata reuse</li>
            <li>Scrub to T+45m · switch to SRE · resolved + post-mortem auto-drafted</li>
          </ol>
        </Card>

        {/* ============================================================ */}
        {/* THE ASK                                                       */}
        {/* ============================================================ */}
        <Card title="The ask">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Ask
              tone="info"
              title="Promote to Public Preview"
              body="Build 2026 keynote slot. Anchor the announcement on Oracle EBS to make the Oracle-on-Azure co-engineering story land."
            />
            <Ask
              tone="info"
              title="Co-engineer the catalog"
              body="Fund archetype builds with workload owners — SAP S/4HANA, PeopleSoft, Dynamics, custom mission-critical. The catalog is the moat."
            />
            <Ask
              tone="info"
              title="Bind into Defender + Cost Mgmt"
              body="WVI as the workload-context layer for Defender for Cloud and the FinOps roll-up surface for Cost Management."
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/workloads/ebs-prod"
              className="inline-flex items-center gap-1.5 bg-ax-accentDim hover:bg-ax-accent text-white text-[12px] px-4 h-8 rounded-ax"
            >
              Run the live demo <ArrowRight size={12} />
            </Link>
            <Link
              href="/workloads"
              className="inline-flex items-center gap-1.5 bg-ax-panel2 hover:bg-ax-panelHi border border-ax-border text-ax-textDim text-[12px] px-3 h-8 rounded-ax"
            >
              Open all workloads
            </Link>
            <span className="text-[11px] text-ax-textMute italic">
              Tip: drive the demo via the scenario scrubber + persona switcher in the top bar.
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ===== sub-components =====

function KpiBlock({
  Icon,
  tone,
  label,
  value,
  sub,
}: {
  Icon: typeof Clock;
  tone: "info" | "good" | "warn" | "bad";
  label: string;
  value: string;
  sub: string;
}) {
  const color =
    tone === "good"
      ? "#5db85d"
      : tone === "warn"
      ? "#f0a020"
      : tone === "bad"
      ? "#e35454"
      : "#2899f5";
  return (
    <div className="border border-ax-border bg-ax-panel2 rounded-ax px-4 py-3">
      <div
        className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-semibold mb-1"
        style={{ color }}
      >
        <Icon size={12} />
        {label}
      </div>
      <div className="text-[26px] font-light text-ax-text leading-tight">
        {value}
      </div>
      <div className="text-[11px] text-ax-textMute">{sub}</div>
    </div>
  );
}

function Universe({
  Icon,
  color,
  label,
  who,
  sees,
  tool,
}: {
  Icon: typeof Server;
  color: string;
  label: string;
  who: string;
  sees: string;
  tool: string;
}) {
  return (
    <div className="border border-ax-border bg-ax-panel2 rounded-ax p-3">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} style={{ color }} />
        <span className="text-[13px] font-semibold text-ax-text">{label}</span>
      </div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-ax-textMute">
        Who
      </div>
      <div className="text-[12px] text-ax-textDim mb-2">{who}</div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-ax-textMute">
        Sees
      </div>
      <div className="text-[12px] text-ax-textDim mb-2">{sees}</div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-ax-textMute">
        Tool
      </div>
      <div className="text-[12px] text-ax-textDim">{tool}</div>
    </div>
  );
}

function Stage({
  Icon,
  title,
  body,
  color,
}: {
  Icon: typeof Server;
  title: string;
  body: string;
  color: string;
}) {
  return (
    <div className="border border-ax-border bg-ax-panel rounded-ax p-3">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Icon size={14} style={{ color }} />
        <span className="text-[12px] font-semibold text-ax-text">{title}</span>
      </div>
      <div className="text-[11px] text-ax-textDim leading-relaxed">{body}</div>
    </div>
  );
}

function ArrowAcross() {
  return (
    <div className="hidden md:flex items-center justify-center text-ax-textMute">
      <ArrowRight size={20} />
    </div>
  );
}

function ArrowDown() {
  return (
    <div className="hidden md:flex items-center justify-center text-ax-textMute">
      <ArrowRight size={20} className="rotate-90" />
    </div>
  );
}

function Differentiator({
  Icon,
  title,
  body,
}: {
  Icon: typeof Database;
  title: string;
  body: string;
}) {
  return (
    <div className="border border-ax-border bg-ax-panel2 rounded-ax p-3 flex gap-3">
      <Icon size={16} className="text-ax-accent shrink-0 mt-0.5" />
      <div>
        <div className="text-[13px] font-semibold text-ax-text mb-1">
          {title}
        </div>
        <div className="text-[12px] text-ax-textDim leading-relaxed">{body}</div>
      </div>
    </div>
  );
}

function Quantified({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "info" | "good" | "warn" | "bad";
}) {
  const color =
    tone === "good"
      ? "#5db85d"
      : tone === "warn"
      ? "#f0a020"
      : tone === "bad"
      ? "#e35454"
      : "#2899f5";
  return (
    <div className="border border-ax-border bg-ax-panel2 rounded-ax p-3">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-ax-textMute mb-1">
        {label}
      </div>
      <div className="text-[20px] font-light leading-none" style={{ color }}>
        {value}
      </div>
      <div className="text-[11px] text-ax-textMute mt-1">{sub}</div>
    </div>
  );
}

function Ask({
  tone,
  title,
  body,
}: {
  tone: "info" | "good" | "warn" | "bad";
  title: string;
  body: string;
}) {
  return (
    <div className="border border-ax-accent/30 bg-ax-accent/5 rounded-ax p-3">
      <div className="flex items-center gap-2 mb-1">
        <CheckCircle2 size={14} className="text-ax-accent" />
        <Pill tone={tone} small>
          ask
        </Pill>
        <span className="text-[13px] font-semibold text-ax-text">{title}</span>
      </div>
      <div className="text-[12px] text-ax-textDim leading-relaxed">{body}</div>
    </div>
  );
}
