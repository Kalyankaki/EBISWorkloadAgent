"use client";

import { useState } from "react";
import { WORKLOAD_LIST, getRecommendationsFor, getIncidentFor } from "@/data/workloads";
import { getScenarioState } from "@/data/scenarios";
import { SCENARIO_STEPS } from "@/data/archetypes";
import {
  forwardBlastRadius,
  reverseDependencies,
} from "@/lib/propagation";
import {
  workloadOverallHealth,
  processHealth,
  HEALTH_LABEL,
  HEALTH_COLOR,
} from "@/lib/health";
import type { ScenarioStepId, WorkloadId } from "@/data/schema";

// Throwaway dev/spot-check page. Will be removed in Phase 10.
export default function DevPage() {
  const [workloadId, setWorkloadId] = useState<WorkloadId>("ebs-prod");
  const [stepId, setStepId] = useState<ScenarioStepId>("steady");

  const workload = WORKLOAD_LIST.find((w) => w.id === workloadId)!;
  const state = getScenarioState(workloadId, stepId);
  const recs = getRecommendationsFor(workloadId);
  const incident = getIncidentFor(workloadId, stepId);
  const overall = workloadOverallHealth(workload, state.signals);

  const fwd = forwardBlastRadius(workload, "stg-redo");
  const rev = reverseDependencies(workload, "gl-close");

  return (
    <div className="p-6 space-y-6 text-[12px] font-mono text-ax-text">
      <div className="space-y-2">
        <h1 className="text-[16px] font-semibold">WVI dev / spot-check</h1>
        <div className="text-ax-textMute">
          Throwaway page for validating the Phase 2 data layer. Removed in Phase 10.
        </div>
      </div>

      <section className="flex flex-wrap gap-4">
        <div>
          <div className="text-ax-textMute mb-1">Workload</div>
          <div className="flex gap-2">
            {WORKLOAD_LIST.map((w) => (
              <label key={w.id} className="flex items-center gap-1">
                <input
                  type="radio"
                  name="wl"
                  value={w.id}
                  checked={workloadId === w.id}
                  onChange={() => setWorkloadId(w.id)}
                />
                <span>{w.id}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <div className="text-ax-textMute mb-1">Scenario step</div>
          <div className="flex gap-1">
            {SCENARIO_STEPS.map((s) => (
              <button
                key={s.id}
                onClick={() => setStepId(s.id)}
                className={
                  "px-2 py-1 border rounded-ax " +
                  (stepId === s.id
                    ? "bg-ax-accent border-ax-accent text-white"
                    : "bg-ax-panel border-ax-border text-ax-textDim hover:bg-ax-panel2")
                }
              >
                {s.time} {s.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="border border-ax-border rounded-ax p-3">
        <div className="text-ax-textMute mb-1">Workload overall health</div>
        <div className="text-[14px]" style={{ color: HEALTH_COLOR(overall) }}>
          {HEALTH_LABEL(overall)} · {state.activeIncidentIds.length} active incident(s)
        </div>
      </section>

      <section className="border border-ax-border rounded-ax p-3">
        <div className="text-ax-textMute mb-2">All component healths</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
          {[
            ...workload.processes,
            ...workload.applicationComponents,
            ...workload.infrastructureResources,
          ].map((c) => {
            const h =
              c.layer === "process"
                ? processHealth(workload, c.id, state.signals)
                : state.signals[c.id]?.health ?? "unknown";
            return (
              <div
                key={c.id}
                className="flex items-center justify-between border border-ax-border rounded-ax px-2 py-1"
              >
                <span className="truncate">
                  <span className="text-ax-textMute">{c.layer[0]}</span>{" "}
                  <span className="text-ax-text">{c.id}</span>
                </span>
                <span style={{ color: HEALTH_COLOR(h) }}>{h}</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-ax-border rounded-ax p-3">
          <div className="text-ax-textMute mb-1">
            forwardBlastRadius(stg-redo)
          </div>
          <div>processes affected: {fwd.affectedProcesses.join(", ") || "—"}</div>
          <div>components: {fwd.affectedComponents.length}</div>
          <div>
            $/hr at risk: {fwd.totalRevenueAtRiskUsdPerHour.toFixed(0)}
          </div>
        </div>
        <div className="border border-ax-border rounded-ax p-3">
          <div className="text-ax-textMute mb-1">
            reverseDependencies(gl-close)
          </div>
          <div>{rev.join(", ") || "—"}</div>
        </div>
      </section>

      <section className="border border-ax-border rounded-ax p-3">
        <div className="text-ax-textMute mb-2">Recommendations ({recs.length})</div>
        <div className="space-y-1">
          {recs.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-2 border border-ax-border rounded-ax px-2 py-1"
            >
              <span
                className="px-1.5 py-0 rounded-ax text-[10px] font-semibold"
                style={{
                  background:
                    r.severity === "critical"
                      ? "rgba(227,84,84,0.2)"
                      : r.severity === "high"
                      ? "rgba(240,160,32,0.2)"
                      : r.severity === "medium"
                      ? "rgba(40,153,245,0.2)"
                      : "rgba(96,94,92,0.2)",
                  color:
                    r.severity === "critical"
                      ? "#e35454"
                      : r.severity === "high"
                      ? "#f0a020"
                      : r.severity === "medium"
                      ? "#2899f5"
                      : "#a19f9d",
                }}
              >
                {r.severity}
              </span>
              <span className="text-ax-textMute">{r.id}</span>
              <span className="truncate">{r.title}</span>
              <span className="ml-auto text-ax-textMute">{r.status}</span>
            </div>
          ))}
        </div>
      </section>

      {incident && (
        <section className="border border-ax-border rounded-ax p-3">
          <div className="text-ax-textMute mb-2">
            Incident {incident.id} · {incident.severity} · {incident.status}
          </div>
          <div className="space-y-1">
            {incident.causalChain.map((n, i) => (
              <div
                key={i}
                className="flex items-center gap-2 border border-ax-border rounded-ax px-2 py-1"
              >
                <span className="text-ax-textMute w-12">{n.observedAt}</span>
                <span style={{ color: HEALTH_COLOR(n.health) }}>{n.health}</span>
                <span className="text-ax-textMute">{n.layer}</span>
                <span>{n.componentId}</span>
                <span className="text-ax-textDim truncate">{n.summary}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border border-ax-border rounded-ax p-3">
        <div className="text-ax-textMute mb-2">Raw scenario state</div>
        <pre className="text-[10px] overflow-x-auto whitespace-pre-wrap">
          {JSON.stringify(
            {
              stepId: state.stepId,
              activeIncidentIds: state.activeIncidentIds,
              signals: Object.fromEntries(
                Object.entries(state.signals).map(([k, v]) => [
                  k,
                  { health: v.health, note: v.note ?? null, hasSeries: !!v.series },
                ])
              ),
            },
            null,
            2
          )}
        </pre>
      </section>
    </div>
  );
}
