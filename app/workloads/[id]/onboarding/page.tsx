"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  Database,
  Boxes,
  Briefcase,
  Network,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
} from "lucide-react";
import { Card, SectionTitle } from "@/components/primitives/Card";
import { Pill } from "@/components/primitives/Pill";
import { useWvi } from "@/store/useWvi";
import { getWorkload } from "@/data/workloads";

const STEPS = [
  { id: 1, label: "Choose archetype", desc: "Pick a workload archetype to bind to your resources." },
  { id: 2, label: "Discover resources", desc: "Auto-discover Azure resources matching the archetype." },
  { id: 3, label: "Map application components", desc: "Bind discovered resources to EBS modules and runtimes." },
  { id: 4, label: "Map business processes", desc: "Drag EBS modules into business process buckets." },
  { id: 5, label: "Configure SLOs", desc: "Set the SLO for each tier-1/tier-2 process." },
  { id: 6, label: "Activate Workload IQ", desc: "Turn on cross-stack signal propagation." },
  { id: 7, label: "Run chaos drill (optional)", desc: "Validate runbook automation with a controlled fault." },
  { id: 8, label: "Wire ownership and on-call", desc: "Bind processes and components to teams + on-call rotations." },
];

const ARCHETYPES_GALLERY = [
  { id: "ebs-r1222-on-oracledb-azure", name: "Oracle EBS R12.2 on Oracle DB@Azure", subtitle: "Selected", recommended: true },
  { id: "sap-s4hana", name: "SAP S/4HANA on Azure", subtitle: "v1.8" },
  { id: "peoplesoft", name: "PeopleSoft 9.2", subtitle: "v1.2" },
  { id: "custom", name: "Custom workload", subtitle: "Define your own" },
];

export default function OnboardingPage() {
  const workloadId = useWvi((s) => s.currentWorkloadId);
  const workload = getWorkload(workloadId)!;
  const completed = workload.onboardingProgress.stepsComplete;
  const [activeStep, setActiveStep] = useState<number>(completed + 1);

  return (
    <motion.div
      initial={{ x: 8, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="px-5 pt-4 pb-12 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4"
    >
      <Card title={`Onboarding · ${completed} of ${STEPS.length} steps complete`}>
        <ol className="space-y-1">
          {STEPS.map((s) => {
            const done = s.id <= completed;
            const active = s.id === activeStep;
            return (
              <li
                key={s.id}
                onClick={() => setActiveStep(s.id)}
                className={
                  "flex items-start gap-2 px-2 py-1.5 rounded-ax cursor-pointer " +
                  (active
                    ? "bg-ax-panelHi"
                    : "hover:bg-ax-panel2")
                }
              >
                {done ? (
                  <CheckCircle2 size={14} className="text-ax-good shrink-0 mt-0.5" />
                ) : (
                  <Circle size={14} className={active ? "text-ax-accent shrink-0 mt-0.5" : "text-ax-textMute shrink-0 mt-0.5"} />
                )}
                <div className="min-w-0">
                  <div className={"text-[12px] " + (active ? "text-ax-text font-semibold" : "text-ax-textDim")}>
                    Step {s.id}: {s.label}
                  </div>
                  {active && (
                    <div className="text-[11px] text-ax-textMute mt-0.5">{s.desc}</div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </Card>

      <Card
        title={`Step ${activeStep}: ${STEPS[activeStep - 1].label}`}
        right={
          <button
            disabled={activeStep >= STEPS.length}
            onClick={() => setActiveStep((s) => Math.min(STEPS.length, s + 1))}
            className="text-[11px] inline-flex items-center gap-1 text-ax-accent hover:text-white disabled:opacity-50"
          >
            Continue <ArrowRight size={11} />
          </button>
        }
      >
        {activeStep === 1 && (
          <div>
            <div className="text-[12px] text-ax-textDim mb-3">
              Pick a workload archetype. Each archetype is a curated reference architecture maintained by Microsoft + the workload owner.
            </div>
            <div className="grid grid-cols-2 gap-3">
              {ARCHETYPES_GALLERY.map((a, i) => (
                <div
                  key={a.id}
                  className={
                    "border rounded-ax p-3 cursor-pointer " +
                    (i === 0
                      ? "border-ax-accent bg-ax-accent/5"
                      : "border-ax-border bg-ax-panel2 hover:bg-ax-panelHi")
                  }
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Database size={14} className="text-ax-accent" />
                    <div className="text-[13px] font-semibold text-ax-text">{a.name}</div>
                  </div>
                  <div className="text-[11px] text-ax-textMute">{a.subtitle}</div>
                  {a.recommended && <Pill tone="info" small>Selected</Pill>}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div>
            <div className="text-[12px] text-ax-textDim mb-3">
              Auto-discovered {workload.infrastructureResources.length} resources matching the archetype.
            </div>
            <div className="space-y-1">
              {workload.infrastructureResources.map((r) => (
                <label
                  key={r.id}
                  className="flex items-center gap-2 border border-ax-border bg-ax-panel2 rounded-ax px-2 py-1.5 cursor-pointer"
                >
                  <input type="checkbox" defaultChecked className="accent-ax-accent" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] text-ax-text truncate">{r.name}</div>
                    <div className="text-[10px] text-ax-textMute truncate">{r.azureResourceType} · {r.sku}</div>
                  </div>
                  <Pill tone="neutral" small>{r.kind}</Pill>
                </label>
              ))}
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div>
            <div className="text-[12px] text-ax-textDim mb-3">
              Bind discovered resources to EBS modules. WVI suggests a default mapping based on tags and resource types.
            </div>
            <div className="space-y-1">
              {workload.applicationComponents.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-2 border border-ax-border bg-ax-panel2 rounded-ax px-2 py-1.5"
                >
                  <Boxes size={13} className="text-[#7b61ff]" />
                  <div className="flex-1 text-[12px] text-ax-text">{a.name}</div>
                  <Pill tone="info" small>auto-mapped</Pill>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeStep === 4 && (
          <div>
            <div className="text-[12px] text-ax-textDim mb-3">
              Drag EBS modules into business process buckets. WVI uses your finance org's process catalog to seed the layout.
            </div>
            <div className="space-y-3">
              {workload.processes.map((p) => {
                const modules = workload.dependencies
                  .filter((d) => d.fromId === p.id)
                  .map((d) => workload.applicationComponents.find((a) => a.id === d.toId))
                  .filter(Boolean);
                return (
                  <div key={p.id} className="border border-ax-border bg-ax-panel2 rounded-ax p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase size={13} className="text-ax-accent" />
                      <div className="text-[12px] font-semibold text-ax-text">{p.name}</div>
                      <Pill tone={p.criticality === "Critical" ? "bad" : p.criticality === "High" ? "warn" : "info"} small>
                        {p.criticality}
                      </Pill>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {modules.map((m: any) => (
                        <Pill key={m.id} tone="neutral" small>
                          {m.name}
                        </Pill>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeStep === 5 && (
          <div>
            <div className="text-[12px] text-ax-textDim mb-3">
              Configure SLOs for each tier-1/tier-2 process. WVI enforces these via Workload IQ alerts.
            </div>
            <div className="space-y-2">
              {workload.slos.map((slo) => {
                const p = workload.processes.find((pp) => pp.id === slo.processId);
                return (
                  <div
                    key={slo.id}
                    className="border border-ax-border bg-ax-panel2 rounded-ax p-3"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase size={13} className="text-ax-accent" />
                      <div className="text-[12px] font-semibold text-ax-text">{p?.name}</div>
                    </div>
                    <div className="text-[12px] text-ax-textDim">
                      <span className="font-semibold">{slo.name}</span>: {slo.target}
                    </div>
                    <div className="text-[11px] text-ax-textMute mt-1">
                      Current: {(slo.current * 100).toFixed(2)}% · Error budget: {(slo.errorBudgetRemaining * 100).toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeStep === 6 && (
          <div>
            <div className="text-[12px] text-ax-textDim mb-3">
              Workload IQ activates cross-stack signal propagation. Once on, infra signals flow up to processes and personas see relevant lenses.
            </div>
            <div className="border border-ax-good/40 bg-ax-good/5 rounded-ax p-3 flex items-start gap-3">
              <Sparkles size={14} className="text-ax-good mt-0.5 shrink-0" />
              <div>
                <div className="text-[13px] font-semibold text-ax-good">Workload IQ active</div>
                <div className="text-[12px] text-ax-textDim">
                  Telemetry from Azure Monitor, Defender for Cloud, Oracle DB@Azure, and EBS Concurrent Manager is now correlated via the WVI graph.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeStep === 7 && (
          <div>
            <div className="text-[12px] text-ax-textDim mb-3">
              Run a controlled fault to validate runbook automation and signal propagation. Recommended: simulate a DB Node 2 patch window.
            </div>
            <div className="border border-ax-border bg-ax-panel2 rounded-ax p-3 grid grid-cols-2 gap-2 mb-3">
              <div>
                <div className="text-[10px] uppercase font-semibold text-ax-textMute">Fault</div>
                <div className="text-[12px] text-ax-text">DB node 2 unavailable for 15 min</div>
              </div>
              <div>
                <div className="text-[10px] uppercase font-semibold text-ax-textMute">Window</div>
                <div className="text-[12px] text-ax-text">Sat 02:00–02:15 UTC</div>
              </div>
            </div>
            <button className="bg-ax-accentDim hover:bg-ax-accent text-white text-[12px] h-8 px-3 rounded-ax">
              Schedule chaos drill
            </button>
          </div>
        )}

        {activeStep === 8 && (
          <div>
            <div className="text-[12px] text-ax-textDim mb-3">
              Wire ownership and on-call rotations to processes and components. WVI uses these for auto-paging during incidents.
            </div>
            <div className="border border-ax-warn/40 bg-ax-warn/5 rounded-ax p-3 flex items-start gap-3">
              <ShieldCheck size={14} className="text-ax-warn mt-0.5 shrink-0" />
              <div className="text-[12px] text-ax-textDim">
                Pending: connect to PagerDuty / Splunk On-Call. WVI will auto-page based on impacted-process criticality.
              </div>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}
