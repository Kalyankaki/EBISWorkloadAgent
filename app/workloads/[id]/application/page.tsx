"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown, ChevronRight, Plug, Box } from "lucide-react";
import { Card, PropertyRow, SectionTitle } from "@/components/primitives/Card";
import { HealthDot, HealthPill, Pill } from "@/components/primitives/Pill";
import { Blade } from "@/components/primitives/Blade";
import { useWvi } from "@/store/useWvi";
import { getWorkload } from "@/data/workloads";
import { getScenarioState } from "@/data/scenarios";

export default function ApplicationIQPage() {
  const stepId = useWvi((s) => s.stepId);
  const workloadId = useWvi((s) => s.currentWorkloadId);
  const workload = getWorkload(workloadId);
  const state = getScenarioState(workloadId, stepId);

  const [openId, setOpenId] = useState<string | null>(null);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

  const modules = workload.applicationComponents.filter((a) => a.kind !== "integration");
  const integrations = workload.applicationComponents.filter((a) => a.kind === "integration");

  const selected = workload.applicationComponents.find((a) => a.id === selectedAppId);

  return (
    <motion.div
      initial={{ x: 8, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="px-5 pt-4 space-y-4 pb-12"
    >
      <Card title="EBS modules & runtimes">
        <div className="space-y-2">
          {modules.map((m) => {
            const sig = state.signals[m.id];
            const isOpen = openId === m.id;
            const dependents = workload.dependencies
              .filter((d) => d.toId === m.id)
              .map((d) => workload.processes.find((p) => p.id === d.fromId))
              .filter(Boolean);
            return (
              <div
                key={m.id}
                className="border border-ax-border bg-ax-panel2 rounded-ax"
              >
                <button
                  onClick={() => setOpenId(isOpen ? null : m.id)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-ax-panelHi"
                >
                  {isOpen ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                  <Box size={13} className="text-ax-accent" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-ax-text">
                      {m.name}
                    </div>
                    <div className="text-[11px] text-ax-textMute truncate">
                      {m.description ?? "—"}
                    </div>
                  </div>
                  <Pill tone="neutral" small>
                    {m.kind === "ebs-runtime" ? "Runtime" : "Module"}
                  </Pill>
                  <HealthDot status={sig?.health ?? "healthy"} pulse />
                </button>
                {isOpen && (
                  <div className="px-3 pb-3 border-t border-ax-border">
                    {m.runtimeProperties && (
                      <div className="pt-2">
                        <SectionTitle>Runtime properties</SectionTitle>
                        {Object.entries(m.runtimeProperties).map(([k, v]) => (
                          <PropertyRow key={k} label={k} value={v} />
                        ))}
                      </div>
                    )}
                    <div className="pt-3">
                      <SectionTitle>Business processes served</SectionTitle>
                      {dependents.length === 0 ? (
                        <div className="text-[12px] text-ax-textMute">—</div>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {dependents.map((p: any) => (
                            <Pill key={p.id} tone="info" small>
                              {p.name}
                            </Pill>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card title="Integration inventory" noPadding>
        <table className="w-full text-[12px]">
          <thead className="bg-ax-panel2 text-ax-textMute uppercase text-[11px]">
            <tr>
              <th className="text-left px-3 py-2 font-semibold">Integration</th>
              <th className="text-left px-3 py-2 font-semibold">Direction</th>
              <th className="text-left px-3 py-2 font-semibold">Frequency</th>
              <th className="text-left px-3 py-2 font-semibold">Health</th>
            </tr>
          </thead>
          <tbody>
            {integrations.map((it) => {
              const sig = state.signals[it.id];
              const dir = it.runtimeProperties?.Direction ?? "—";
              const freq =
                it.runtimeProperties?.["Sync frequency"] ??
                it.runtimeProperties?.["Last sync"] ??
                "—";
              return (
                <tr
                  key={it.id}
                  className="border-t border-ax-border hover:bg-ax-panel2 cursor-pointer"
                  onClick={() => setSelectedAppId(it.id)}
                >
                  <td className="px-3 py-2 flex items-center gap-2 text-ax-text">
                    <Plug size={12} className="text-ax-accent" />
                    {it.name}
                  </td>
                  <td className="px-3 py-2 text-ax-textDim">{dir}</td>
                  <td className="px-3 py-2 text-ax-textDim">{freq}</td>
                  <td className="px-3 py-2">
                    <HealthPill status={sig?.health ?? "healthy"} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>

      <Card title="Process → module matrix" noPadding>
        <div className="overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead className="bg-ax-panel2 text-ax-textMute uppercase text-[10px]">
              <tr>
                <th className="text-left px-3 py-2 font-semibold sticky left-0 bg-ax-panel2 z-10 min-w-[180px]">
                  Process
                </th>
                {modules.map((m) => (
                  <th key={m.id} className="text-center px-2 py-2 font-semibold">
                    {m.name.replace(" (", "\n(")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workload.processes.map((p) => (
                <tr key={p.id} className="border-t border-ax-border">
                  <td className="px-3 py-2 sticky left-0 bg-ax-panel z-10 text-ax-text">
                    {p.name}
                  </td>
                  {modules.map((m) => {
                    const dep = workload.dependencies.find(
                      (d) => d.fromId === p.id && d.toId === m.id
                    );
                    return (
                      <td key={m.id} className="text-center px-2 py-2">
                        {dep ? (
                          <span
                            className="inline-block w-2.5 h-2.5 rounded-full"
                            style={{
                              background:
                                dep.weight >= 1
                                  ? "#2899f5"
                                  : dep.weight >= 0.7
                                  ? "rgba(40,153,245,0.7)"
                                  : "rgba(40,153,245,0.4)",
                            }}
                            title={`weight ${dep.weight}`}
                          />
                        ) : (
                          <span className="text-ax-textMute">·</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Blade
        open={!!selected}
        onClose={() => setSelectedAppId(null)}
        title={selected?.name ?? ""}
        subtitle={selected?.kind}
      >
        {selected && (
          <div className="space-y-3">
            {selected.description && (
              <div className="text-[12px] text-ax-textDim">{selected.description}</div>
            )}
            {selected.runtimeProperties && (
              <div>
                <SectionTitle>Properties</SectionTitle>
                {Object.entries(selected.runtimeProperties).map(([k, v]) => (
                  <PropertyRow key={k} label={k} value={v} />
                ))}
              </div>
            )}
          </div>
        )}
      </Blade>
    </motion.div>
  );
}
