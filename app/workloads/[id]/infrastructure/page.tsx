"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { AlertTriangle, GitPullRequest } from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
} from "recharts";
import { Card, PropertyRow, SectionTitle } from "@/components/primitives/Card";
import { HealthPill, Pill } from "@/components/primitives/Pill";
import { Blade } from "@/components/primitives/Blade";
import { useWvi } from "@/store/useWvi";
import { getWorkload, getDriftFor } from "@/data/workloads";
import { getScenarioState } from "@/data/scenarios";
import { ARCHETYPES } from "@/data/archetypes";
import type { DriftItem, InfrastructureResource } from "@/data/schema";

export default function InfraIQPage() {
  const stepId = useWvi((s) => s.stepId);
  const workloadId = useWvi((s) => s.currentWorkloadId);
  const workload = getWorkload(workloadId)!;
  const state = getScenarioState(workloadId, stepId);
  const drift = getDriftFor(workloadId);
  const arche = ARCHETYPES[workload.archetype.id];

  const [selectedRes, setSelectedRes] = useState<InfrastructureResource | null>(null);
  const [selectedDrift, setSelectedDrift] = useState<DriftItem | null>(null);

  const wa = arche?.wellArchitected ?? null;
  const radarData = wa
    ? [
        { pillar: "Reliability", score: wa.reliability },
        { pillar: "Security", score: wa.security },
        { pillar: "Cost", score: wa.cost },
        { pillar: "Operations", score: wa.operations },
        { pillar: "Performance", score: wa.performance },
      ]
    : [];

  return (
    <motion.div
      initial={{ x: 8, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="px-5 pt-4 space-y-4 pb-12"
    >
      <Card title="Resource inventory" noPadding>
        <table className="w-full text-[12px]">
          <thead className="bg-ax-panel2 text-ax-textMute uppercase text-[11px]">
            <tr>
              <th className="text-left px-3 py-2 font-semibold">Name</th>
              <th className="text-left px-3 py-2 font-semibold">Kind</th>
              <th className="text-left px-3 py-2 font-semibold">SKU</th>
              <th className="text-left px-3 py-2 font-semibold">Region</th>
              <th className="text-center px-3 py-2 font-semibold">Zones</th>
              <th className="text-left px-3 py-2 font-semibold">Reference</th>
              <th className="text-left px-3 py-2 font-semibold">Health</th>
            </tr>
          </thead>
          <tbody>
            {workload.infrastructureResources.map((r) => {
              const sig = state.signals[r.id];
              return (
                <tr
                  key={r.id}
                  className="border-t border-ax-border hover:bg-ax-panel2 cursor-pointer"
                  onClick={() => setSelectedRes(r)}
                >
                  <td className="px-3 py-2 text-ax-text">{r.name}</td>
                  <td className="px-3 py-2 text-ax-textDim">{r.kind}</td>
                  <td className="px-3 py-2 text-ax-textDim">{r.sku}</td>
                  <td className="px-3 py-2 text-ax-textDim">{r.region}</td>
                  <td className="px-3 py-2 text-center text-ax-textDim">{r.zoneRedundancy}</td>
                  <td className="px-3 py-2">
                    {r.matchesReference ? (
                      <Pill tone="good" small>
                        Conforms
                      </Pill>
                    ) : (
                      <Pill tone="warn" small>
                        Drift
                      </Pill>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <HealthPill status={sig?.health ?? "healthy"} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card
          title={
            <span className="flex items-center gap-2">
              <AlertTriangle size={13} className="text-ax-warn" />
              Drift report · {drift.length} items
            </span>
          }
          className="lg:col-span-2"
          noPadding
        >
          <table className="w-full text-[12px]">
            <thead className="bg-ax-panel2 text-ax-textMute uppercase text-[11px]">
              <tr>
                <th className="text-left px-3 py-2 font-semibold">Severity</th>
                <th className="text-left px-3 py-2 font-semibold">Resource</th>
                <th className="text-left px-3 py-2 font-semibold">Property</th>
                <th className="text-left px-3 py-2 font-semibold">Impact</th>
              </tr>
            </thead>
            <tbody>
              {drift.map((d) => {
                const r = workload.infrastructureResources.find(
                  (x) => x.id === d.componentId
                );
                return (
                  <tr
                    key={d.id}
                    className="border-t border-ax-border hover:bg-ax-panel2 cursor-pointer"
                    onClick={() => setSelectedDrift(d)}
                  >
                    <td className="px-3 py-2">
                      <Pill
                        tone={
                          d.severity === "critical"
                            ? "bad"
                            : d.severity === "warning"
                            ? "warn"
                            : "info"
                        }
                        small
                      >
                        {d.severity}
                      </Pill>
                    </td>
                    <td className="px-3 py-2 text-ax-text">{r?.name ?? d.componentId}</td>
                    <td className="px-3 py-2 text-ax-textDim">{d.property}</td>
                    <td className="px-3 py-2 text-ax-textMute">{d.impact}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

        {wa && (
          <Card title={`Well-Architected · ${arche!.name}`}>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#3b3a39" />
                  <PolarAngleAxis dataKey="pillar" tick={{ fill: "#c8c6c4", fontSize: 11 }} />
                  <Radar
                    dataKey="score"
                    stroke="#2899f5"
                    fill="#2899f5"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-5 gap-1 mt-2 text-center">
              {radarData.map((p) => (
                <div key={p.pillar}>
                  <div className="text-[9px] uppercase tracking-wider text-ax-textMute">
                    {p.pillar}
                  </div>
                  <div className="text-[14px] text-ax-text">{p.score}</div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      <Blade
        open={!!selectedRes}
        onClose={() => setSelectedRes(null)}
        title={selectedRes?.name ?? ""}
        subtitle={selectedRes?.azureResourceType}
      >
        {selectedRes && (
          <div className="space-y-3">
            <HealthPill status={state.signals[selectedRes.id]?.health ?? "healthy"} />
            <div>
              <SectionTitle>Identity</SectionTitle>
              <PropertyRow label="Name" value={selectedRes.name} />
              <PropertyRow label="Kind" value={selectedRes.kind} />
              <PropertyRow label="Azure type" value={
                <code className="text-[10px]">{selectedRes.azureResourceType}</code>
              } />
              <PropertyRow label="SKU" value={selectedRes.sku} />
              <PropertyRow label="Region" value={selectedRes.region} />
              <PropertyRow label="Zones" value={String(selectedRes.zoneRedundancy)} />
              {!selectedRes.matchesReference && (
                <PropertyRow
                  label="Drift"
                  value={
                    <span className="flex items-start gap-2">
                      <Pill tone="warn" small>Yes</Pill>
                      <span className="text-[12px] text-ax-textDim">
                        {selectedRes.driftReason}
                      </span>
                    </span>
                  }
                />
              )}
            </div>
            {state.signals[selectedRes.id]?.series && (
              <div>
                <SectionTitle>Signal · {state.signals[selectedRes.id]?.unit}</SectionTitle>
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={state.signals[selectedRes.id]!.series}>
                    <XAxis dataKey="t" hide />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: "#252423",
                        border: "1px solid #3b3a39",
                        fontSize: 11,
                      }}
                    />
                    <Line type="monotone" dataKey="v" stroke="#2899f5" strokeWidth={1.6} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </Blade>

      <Blade
        open={!!selectedDrift}
        onClose={() => setSelectedDrift(null)}
        title={selectedDrift?.property ?? ""}
        subtitle={
          selectedDrift
            ? workload.infrastructureResources.find((x) => x.id === selectedDrift.componentId)?.name
            : ""
        }
      >
        {selectedDrift && (
          <div className="space-y-3">
            <Pill
              tone={
                selectedDrift.severity === "critical"
                  ? "bad"
                  : selectedDrift.severity === "warning"
                  ? "warn"
                  : "info"
              }
            >
              {selectedDrift.severity}
            </Pill>
            <div>
              <SectionTitle>Impact</SectionTitle>
              <div className="text-[12px] text-ax-textDim">{selectedDrift.impact}</div>
            </div>
            <div>
              <SectionTitle>Actual</SectionTitle>
              <pre className="text-[11px] bg-ax-panel2 border border-ax-border rounded-ax p-2 text-ax-warn">
                {JSON.stringify({ value: selectedDrift.actual }, null, 2)}
              </pre>
            </div>
            <div>
              <SectionTitle>Expected (reference)</SectionTitle>
              <pre className="text-[11px] bg-ax-panel2 border border-ax-border rounded-ax p-2 text-ax-good">
                {JSON.stringify({ value: selectedDrift.expected }, null, 2)}
              </pre>
            </div>
            <button className="w-full inline-flex items-center justify-center gap-1.5 bg-ax-accentDim hover:bg-ax-accent text-white text-[12px] h-8 rounded-ax">
              <GitPullRequest size={13} /> Open IaC PR
            </button>
          </div>
        )}
      </Blade>
    </motion.div>
  );
}
