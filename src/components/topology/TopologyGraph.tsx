"use client";

import "@xyflow/react/dist/style.css";
import { useMemo, useState, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from "@xyflow/react";
import { nodeTypes, type WviNodeData } from "./nodes";
import type { Workload, ComponentId, HealthStatus } from "@/data/schema";
import { getScenarioState } from "@/data/scenarios";
import { ScenarioStepId } from "@/data/schema";
import { useWvi } from "@/store/useWvi";
import { Blade } from "@/components/primitives/Blade";
import { findComponent, blastRadius } from "@/lib/propagation";
import { ax } from "@/theme/tokens";
import { PropertyRow, SectionTitle } from "@/components/primitives/Card";
import { HealthPill, Pill } from "@/components/primitives/Pill";
import { LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip } from "recharts";

const LANE_HEIGHT = 220;
const NODE_WIDTH = 180;
const COL_GAP = 24;
const ROW_GAP = 14;

function laneY(layer: "process" | "application" | "infrastructure"): number {
  if (layer === "process") return 60;
  if (layer === "application") return 60 + LANE_HEIGHT;
  return 60 + LANE_HEIGHT * 2;
}

export function TopologyGraph({ workload }: { workload: Workload }) {
  const stepId = useWvi((s) => s.stepId);
  const state = getScenarioState(workload.id, stepId);
  const [selectedId, setSelectedId] = useState<ComponentId | null>(null);

  const { nodes, edges } = useMemo(() => {
    const ns: Node<WviNodeData>[] = [];
    const es: Edge[] = [];

    const placeRow = (
      ids: { id: string; name: string; sub?: string; kind?: string }[],
      layer: "process" | "application" | "infrastructure"
    ) => {
      const startX = 60;
      ids.forEach((c, i) => {
        const sig = state.signals[c.id];
        ns.push({
          id: c.id,
          type: layer,
          position: {
            x: startX + i * (NODE_WIDTH + COL_GAP),
            y: laneY(layer) + (i % 2 === 0 ? 0 : ROW_GAP * 4),
          },
          data: {
            label: c.name,
            sub: c.sub,
            kind: c.kind as any,
            layer,
            health: (sig?.health ?? "healthy") as HealthStatus,
            highlighted: false,
          },
        });
      });
    };

    placeRow(
      workload.processes.map((p) => ({ id: p.id, name: p.name, sub: p.criticality + " · " + p.ebsModule })),
      "process"
    );
    placeRow(
      workload.applicationComponents.map((p) => ({
        id: p.id,
        name: p.name,
        kind: p.kind,
      })),
      "application"
    );
    placeRow(
      workload.infrastructureResources.map((p) => ({
        id: p.id,
        name: p.name,
        sub: p.sku,
        kind: p.kind,
      })),
      "infrastructure"
    );

    for (const dep of workload.dependencies) {
      const fromHealth = state.signals[dep.fromId]?.health ?? "healthy";
      const toHealth = state.signals[dep.toId]?.health ?? "healthy";
      const cls =
        fromHealth === "critical" || toHealth === "critical"
          ? "unhealthy"
          : fromHealth === "warning" || toHealth === "warning"
          ? "warning"
          : "";
      es.push({
        id: dep.id,
        source: dep.fromId,
        target: dep.toId,
        className: cls,
        animated: false,
        style: { strokeWidth: 1.4 },
      });
    }

    return { nodes: ns, edges: es };
  }, [workload, state]);

  const onNodeClick = useCallback((_e: any, node: Node) => {
    setSelectedId(node.id);
  }, []);

  const selectedComp = selectedId ? findComponent(workload, selectedId) : null;
  const selectedSignal = selectedId ? state.signals[selectedId] : null;
  const blast = selectedId ? blastRadius(workload, selectedId) : null;

  return (
    <div className="relative" style={{ height: 720 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes as any}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.3}
        maxZoom={1.5}
        proOptions={{ hideAttribution: false }}
      >
        {/* lane labels via Background dotted */}
        <Background color={ax.border} gap={20} />
        <Controls position="bottom-right" />
        <MiniMap pannable zoomable maskColor="rgba(0,0,0,0.6)" nodeColor={() => "#605e5c"} />
        <LaneLabels />
      </ReactFlow>

      <Blade
        open={!!selectedComp}
        onClose={() => setSelectedId(null)}
        title={selectedComp?.name ?? ""}
        subtitle={
          selectedComp
            ? selectedComp.layer === "process"
              ? "Business process"
              : selectedComp.layer === "application"
              ? "Application component"
              : "Infrastructure resource"
            : ""
        }
      >
        {selectedComp && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <HealthPill status={selectedSignal?.health ?? "healthy"} />
              {selectedSignal?.note && (
                <span className="text-[12px] text-ax-textDim">
                  {selectedSignal.note}
                </span>
              )}
            </div>

            {selectedSignal?.series && (
              <div className="border border-ax-border bg-ax-panel2 rounded-ax p-2">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-ax-textMute mb-1">
                  Signal · {selectedSignal.unit ?? ""}
                </div>
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={selectedSignal.series}>
                    <XAxis dataKey="t" hide />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        background: "#252423",
                        border: "1px solid #3b3a39",
                        fontSize: 11,
                      }}
                      labelStyle={{ color: "#c8c6c4" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke="#2899f5"
                      strokeWidth={1.6}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            <div>
              <SectionTitle>Identity</SectionTitle>
              <PropertyRow label="ID" value={<code className="text-[11px]">{selectedComp.id}</code>} />
              <PropertyRow label="Layer" value={selectedComp.layer} />
              {selectedComp.layer === "process" && (
                <>
                  <PropertyRow label="EBS module" value={(selectedComp as any).ebsModule} />
                  <PropertyRow label="Owner" value={(selectedComp as any).ownerOrg} />
                  <PropertyRow label="Criticality" value={
                    <Pill tone={
                      (selectedComp as any).criticality === "Critical"
                        ? "bad"
                        : (selectedComp as any).criticality === "High"
                        ? "warn"
                        : "info"
                    } small>
                      {(selectedComp as any).criticality}
                    </Pill>
                  } />
                  <PropertyRow label="SLO" value={(selectedComp as any).slo} />
                </>
              )}
              {selectedComp.layer === "application" && (
                <>
                  <PropertyRow label="Kind" value={(selectedComp as any).kind} />
                  {(selectedComp as any).description && (
                    <PropertyRow label="Description" value={(selectedComp as any).description} />
                  )}
                </>
              )}
              {selectedComp.layer === "infrastructure" && (
                <>
                  <PropertyRow label="Azure type" value={
                    <code className="text-[10px]">{(selectedComp as any).azureResourceType}</code>
                  } />
                  <PropertyRow label="SKU" value={(selectedComp as any).sku} />
                  <PropertyRow label="Region" value={(selectedComp as any).region} />
                  <PropertyRow label="Zones" value={String((selectedComp as any).zoneRedundancy)} />
                  <PropertyRow label="Matches reference" value={
                    (selectedComp as any).matchesReference ? (
                      <Pill tone="good" small>Yes</Pill>
                    ) : (
                      <span className="flex items-start gap-2">
                        <Pill tone="warn" small>Drift</Pill>
                        <span className="text-[12px] text-ax-textDim">
                          {(selectedComp as any).driftReason}
                        </span>
                      </span>
                    )
                  } />
                </>
              )}
            </div>

            {selectedComp.layer === "application" &&
              (selectedComp as any).runtimeProperties && (
                <div>
                  <SectionTitle>Runtime properties</SectionTitle>
                  {Object.entries((selectedComp as any).runtimeProperties as Record<string, string>).map(([k, v]) => (
                    <PropertyRow key={k} label={k} value={v} />
                  ))}
                </div>
              )}

            {blast && (
              <>
                <div>
                  <SectionTitle>Forward blast radius (consumers)</SectionTitle>
                  {blast.forwardIds.length === 0 ? (
                    <div className="text-[12px] text-ax-textMute">None</div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {blast.forwardIds.map((id) => {
                        const c = findComponent(workload, id);
                        if (!c) return null;
                        const h = state.signals[id]?.health ?? "healthy";
                        return (
                          <span
                            key={id}
                            className={
                              "text-[11px] border bg-ax-panel2 rounded-ax px-1.5 py-0.5 " +
                              (h === "critical"
                                ? "border-ax-bad/60 text-ax-bad"
                                : h === "warning"
                                ? "border-ax-warn/60 text-ax-warn"
                                : "border-ax-border text-ax-textDim")
                            }
                          >
                            {c.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div>
                  <SectionTitle>Reverse blast radius (dependencies)</SectionTitle>
                  {blast.reverseIds.length === 0 ? (
                    <div className="text-[12px] text-ax-textMute">None</div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {blast.reverseIds.map((id) => {
                        const c = findComponent(workload, id);
                        if (!c) return null;
                        const h = state.signals[id]?.health ?? "healthy";
                        return (
                          <span
                            key={id}
                            className={
                              "text-[11px] border bg-ax-panel2 rounded-ax px-1.5 py-0.5 " +
                              (h === "critical"
                                ? "border-ax-bad/60 text-ax-bad"
                                : h === "warning"
                                ? "border-ax-warn/60 text-ax-warn"
                                : "border-ax-border text-ax-textDim")
                            }
                          >
                            {c.name}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </Blade>
    </div>
  );
}

function LaneLabels() {
  return (
    <div className="absolute left-2 top-2 pointer-events-none z-10 flex flex-col gap-0">
      {[
        { label: "Business processes", color: "#7b61ff" },
        { label: "Application", color: "#2899f5" },
        { label: "Infrastructure", color: "#5db85d" },
      ].map((l, i) => (
        <div
          key={i}
          className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 bg-ax-panel/70 border border-ax-border rounded-ax mb-2"
          style={{ color: l.color, marginTop: i === 0 ? 32 : LANE_HEIGHT - 24 }}
        >
          {l.label}
        </div>
      ))}
    </div>
  );
}

export type { ScenarioStepId };
