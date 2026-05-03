"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Mail,
  Play,
  ShieldCheck,
  UserCheck,
  Bot,
} from "lucide-react";
import { Card, SectionTitle } from "@/components/primitives/Card";
import { HealthDot, HealthPill, Pill } from "@/components/primitives/Pill";
import { useWvi } from "@/store/useWvi";
import { getIncidentFor, getWorkload } from "@/data/workloads";
import { findComponent } from "@/lib/propagation";
import { personaById } from "@/data/personas";

export default function IncidentsPage() {
  const stepId = useWvi((s) => s.stepId);
  const workloadId = useWvi((s) => s.currentWorkloadId);
  const workload = getWorkload(workloadId)!;
  const incident = getIncidentFor(workloadId, stepId);

  if (!incident) {
    return (
      <motion.div
        initial={{ x: 8, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
        className="px-5 pt-4"
      >
        <Card title="Active incidents">
          <div className="flex items-center gap-3 text-ax-good text-[13px]">
            <CheckCircle2 size={16} />
            No active incidents. Last incident resolved 14 days ago.
          </div>
          <div className="mt-3 text-[12px] text-ax-textMute">
            Scrub the scenario to T+00m or T+15m to see the canonical demo
            incident (INC-4471).
          </div>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: 8, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="px-5 pt-4 pb-12 space-y-4"
    >
      <Card
        title={
          <span className="flex items-center gap-2">
            <AlertTriangle size={14} className="text-ax-bad" />
            {incident.id} · {incident.severity} ·{" "}
            <span className="text-ax-textDim font-normal">{incident.title}</span>
          </span>
        }
        right={
          <Pill tone={incident.status === "resolved" ? "good" : incident.status === "mitigating" ? "warn" : "bad"}>
            {incident.status}
          </Pill>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <KvBlock label="Started" value={incident.startedAt} />
          <KvBlock label="Recommended runbook" value={incident.recommendedRunbookId ?? "—"} />
          <KvBlock label="Personas paged" value={`${incident.pagedPersonaIds.length}`} />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card title="Causal chain timeline">
            <div className="relative pl-6">
              <div className="absolute left-2 top-1 bottom-1 w-px bg-ax-border" />
              {incident.causalChain.map((node, i) => {
                const comp = findComponent(workload, node.componentId);
                return (
                  <div key={i} className="relative pb-3 last:pb-0">
                    <div
                      className="absolute -left-[18px] top-1 w-3 h-3 rounded-full border-2 border-ax-bg"
                      style={{
                        background:
                          node.health === "critical"
                            ? "#e35454"
                            : node.health === "warning"
                            ? "#f0a020"
                            : "#5db85d",
                      }}
                    />
                    <div className="text-[10px] uppercase font-semibold text-ax-textMute">
                      {node.observedAt} · {node.layer}
                    </div>
                    <div className="text-[13px] font-semibold text-ax-text">
                      {comp?.name ?? node.componentId}
                    </div>
                    <div className="text-[12px] text-ax-textDim">
                      {node.summary}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {incident.runbookSteps && (
            <Card
              title={
                <span className="flex items-center gap-2">
                  <Play size={13} className="text-ax-accent" />
                  Runbook {incident.recommendedRunbookId} ·{" "}
                  {incident.runbookSteps.length} steps · est.{" "}
                  {incident.runbookSteps.reduce(
                    (a, b) => a + b.estimatedMinutes,
                    0
                  )}{" "}
                  min
                </span>
              }
            >
              <RunbookSteps incident={incident} />
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card title={<span className="flex items-center gap-1.5"><UserCheck size={13} className="text-ax-accent" />Auto-paged personas</span>}>
            <div className="space-y-2">
              {incident.pagedPersonaIds.map((pid) => {
                const p = personaById(pid);
                return (
                  <div
                    key={pid}
                    className="flex items-center justify-between border border-ax-border bg-ax-panel2 rounded-ax px-2.5 py-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full grid place-items-center text-[10px] font-semibold text-white"
                        style={{ background: p.color }}
                      >
                        {p.initials}
                      </span>
                      <span className="text-[12px] text-ax-text">{p.short}</span>
                    </div>
                    <Pill tone={incident.status === "resolved" ? "good" : "info"} small>
                      {incident.status === "resolved" ? "Acked" : "Active"}
                    </Pill>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card
            title={
              <span className="flex items-center gap-1.5">
                <Mail size={13} className="text-ax-accent" />
                Auto-drafted Finance message
              </span>
            }
            right={
              <button className="text-ax-accent hover:text-white text-[11px]">
                Edit & send
              </button>
            }
          >
            <div className="md text-[12px] text-ax-textDim leading-relaxed whitespace-pre-wrap max-h-72 overflow-y-auto pr-1">
              {incident.businessImpactDraftMd}
            </div>
          </Card>

          {stepId === "resolved" && incident.postMortemDraftMd && (
            <Card
              title={
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={13} className="text-ax-good" />
                  Auto-drafted post-mortem
                </span>
              }
              right={
                <Pill tone="info" small>
                  draft · awaits review
                </Pill>
              }
            >
              <div className="md text-[12px] text-ax-textDim leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto pr-1">
                {incident.postMortemDraftMd}
              </div>
            </Card>
          )}

          <Card
            title={
              <span className="flex items-center gap-1.5">
                <Bot size={13} className="text-ax-accent" />
                AI Agent actions
              </span>
            }
          >
            <ul className="text-[12px] text-ax-textDim space-y-1.5">
              <li>✓ Detected pattern at T-08m and pre-staged RB-217</li>
              <li>✓ Paged DBA + App Admin + SRE + Biz Ops + FinOps at T+02m</li>
              <li>✓ Drafted Finance close-call message at T+12m</li>
              {stepId === "resolved" ? (
                <>
                  <li>✓ Applied IaC PR-4471 (storage SKU bump) on CSA approval</li>
                  <li>✓ Re-added RAC node 2 at T+24m</li>
                  <li>✓ Drafted post-mortem with policy proposal</li>
                </>
              ) : (
                <li className="text-ax-warn">
                  ⏳ Awaiting CSA approval to apply IaC PR-4471 (storage SKU bump)
                </li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}

function KvBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-ax-border bg-ax-panel2 rounded-ax px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-ax-textMute">
        {label}
      </div>
      <div className="text-[14px] text-ax-text">{value}</div>
    </div>
  );
}

function RunbookSteps({
  incident,
}: {
  incident: ReturnType<typeof getIncidentFor> & object;
}) {
  const stepId = useWvi((s) => s.stepId);
  // Determine which steps are complete based on incident status
  const totalSteps = incident.runbookSteps?.length ?? 0;
  const initialDone =
    incident.status === "resolved"
      ? totalSteps
      : incident.status === "mitigating"
      ? Math.max(0, totalSteps - 2)
      : 1;

  const [doneSet, setDoneSet] = useState<Set<string>>(() => {
    const s = new Set<string>();
    incident.runbookSteps?.slice(0, initialDone).forEach((st) => s.add(st.id));
    return s;
  });

  return (
    <ol className="space-y-1.5">
      {incident.runbookSteps?.map((s, i) => {
        const done = doneSet.has(s.id);
        return (
          <li
            key={s.id}
            className={
              "flex items-start gap-2 border rounded-ax px-2.5 py-2 " +
              (done
                ? "border-ax-good/40 bg-ax-good/5"
                : "border-ax-border bg-ax-panel2")
            }
          >
            <button
              onClick={() => {
                setDoneSet((prev) => {
                  const next = new Set(prev);
                  if (next.has(s.id)) next.delete(s.id);
                  else next.add(s.id);
                  return next;
                });
              }}
              className={
                "mt-0.5 w-4 h-4 shrink-0 rounded-sm border " +
                (done
                  ? "bg-ax-good border-ax-good"
                  : "border-ax-border bg-ax-panel hover:border-ax-borderHi")
              }
            >
              {done && <CheckCircle2 size={14} className="text-ax-bg" />}
            </button>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] text-ax-text font-semibold">
                Step {i + 1}: {s.title}
              </div>
              <div className="text-[11px] text-ax-textDim">{s.description}</div>
              <div className="mt-1 flex items-center gap-2 text-[10px] text-ax-textMute">
                <span>est. {s.estimatedMinutes}m</span>
                {s.componentId && (
                  <Pill tone="neutral" small>
                    {s.componentId}
                  </Pill>
                )}
                {s.destructive && <Pill tone="warn" small>destructive</Pill>}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
