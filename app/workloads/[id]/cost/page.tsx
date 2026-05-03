"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { Sankey, ResponsiveContainer, Tooltip, Layer, Rectangle } from "recharts";
import { Card } from "@/components/primitives/Card";
import { Pill } from "@/components/primitives/Pill";
import { useWvi } from "@/store/useWvi";
import { getRecommendationsFor, getWorkload } from "@/data/workloads";
import { formatUsd } from "@/lib/format";

// Synthesize cost-per-process numbers (in $/mo). These mirror what FinOps lens shows.
const PROCESS_COST_USD: Record<string, number> = {
  "gl-close": 18_000,
  "o2c": 61_000,
  "p2p": 42_000,
  "ap-val": 11_000,
  "mrp": 27_000,
  "cm-batch": 6_000,
  "payroll": 14_000,
  "fin-report": 14_400,
};

// And per-infra cost (rough breakdown)
const INFRA_COST_USD: Record<string, number> = {
  "odba-rac": 86_000,
  "odba-dg": 22_000,
  "stg-redo": 8_000,
  "vm-apps-1": 21_000,
  "vm-apps-2": 20_000,
  "vm-cm": 18_000,
  "lb": 800,
  "vnet": 6_000,
  "er": 10_000,
  "kv": 1_400,
  "monitor": 3_500,
  "defender": 3_000,
  "fabric": 5_000,
  "nsg-db": 0,
  "entra": 0,
};

export default function CostMapPage() {
  const workloadId = useWvi((s) => s.currentWorkloadId);
  const workload = getWorkload(workloadId)!;
  const recs = getRecommendationsFor(workloadId).filter(
    (r) => r.estimatedCostDeltaUsdPerMonth != null && r.estimatedCostDeltaUsdPerMonth < 0
  );

  // Build nodes + links: infra → app modules → process
  const sankey = useMemo(() => {
    const nodes: { name: string; layer: string }[] = [];
    const idx = new Map<string, number>();
    const add = (name: string, layer: string, key: string) => {
      if (idx.has(key)) return idx.get(key)!;
      idx.set(key, nodes.length);
      nodes.push({ name, layer });
      return nodes.length - 1;
    };

    workload.infrastructureResources.forEach((r) => {
      if (INFRA_COST_USD[r.id]) add(r.name, "infra", r.id);
    });
    workload.applicationComponents.forEach((a) => add(a.name, "app", a.id));
    workload.processes.forEach((p) => add(p.name, "process", p.id));

    // Links infra → app: split each infra cost evenly across the app modules that use it
    const links: { source: number; target: number; value: number }[] = [];
    for (const infra of workload.infrastructureResources) {
      const cost = INFRA_COST_USD[infra.id];
      if (!cost) continue;
      const apps = workload.dependencies
        .filter((d) => d.toId === infra.id)
        .map((d) => workload.applicationComponents.find((a) => a.id === d.fromId))
        .filter(Boolean) as { id: string }[];
      if (apps.length === 0) continue;
      const per = cost / apps.length;
      for (const a of apps) {
        const s = idx.get(infra.id)!;
        const t = idx.get(a.id)!;
        links.push({ source: s, target: t, value: per });
      }
    }

    // Links app → process: split equally based on process dependencies
    for (const proc of workload.processes) {
      const apps = workload.dependencies
        .filter((d) => d.fromId === proc.id)
        .map((d) => workload.applicationComponents.find((a) => a.id === d.toId))
        .filter(Boolean) as { id: string }[];
      if (apps.length === 0) continue;
      const procBudget = PROCESS_COST_USD[proc.id] ?? 0;
      const per = procBudget / apps.length;
      for (const a of apps) {
        const s = idx.get(a.id)!;
        const t = idx.get(proc.id)!;
        links.push({ source: s, target: t, value: per });
      }
    }

    return { nodes, links };
  }, [workload]);

  return (
    <motion.div
      initial={{ x: 8, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="px-5 pt-4 space-y-4 pb-12 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4"
    >
      <div className="space-y-4">
        <Card title="Cost map · infrastructure → application → process" right="$/mo">
          <div className="h-[520px]">
            <ResponsiveContainer width="100%" height="100%">
              <Sankey
                data={sankey}
                node={(props: any) => <SankeyNode {...props} nodes={sankey.nodes} />}
                link={{ stroke: "#2899f5", strokeOpacity: 0.18 }}
                nodePadding={20}
                margin={{ top: 12, right: 120, bottom: 12, left: 0 }}
              >
                <Tooltip
                  contentStyle={{
                    background: "#252423",
                    border: "1px solid #3b3a39",
                    fontSize: 11,
                  }}
                  formatter={(v: any) => formatUsd(Number(v))}
                />
              </Sankey>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Optimization recommendations">
          <div className="space-y-2">
            {recs.map((r) => (
              <div
                key={r.id}
                className="flex items-start justify-between gap-3 border border-ax-border bg-ax-panel2 rounded-ax p-3"
              >
                <div>
                  <div className="text-[13px] font-semibold text-ax-text">{r.title}</div>
                  <div className="text-[12px] text-ax-textDim">{r.rationale}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[16px] font-light text-ax-good">
                    {formatUsd(r.estimatedCostDeltaUsdPerMonth!)}
                  </div>
                  <div className="text-[10px] text-ax-textMute">savings / mo</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <Card title="Cost per business process">
          <div className="space-y-2">
            {workload.processes
              .map((p) => ({ p, cost: PROCESS_COST_USD[p.id] ?? 0 }))
              .filter((x) => x.cost > 0)
              .sort((a, b) => b.cost - a.cost)
              .map(({ p, cost }) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between border-b border-ax-border pb-1.5 last:border-b-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <div className="text-[12px] text-ax-text truncate">{p.name}</div>
                    <Pill tone={p.criticality === "Critical" ? "bad" : p.criticality === "High" ? "warn" : "info"} small>
                      {p.criticality}
                    </Pill>
                  </div>
                  <div className="text-[14px] text-ax-text shrink-0">
                    {formatUsd(cost)}
                    <span className="text-[10px] text-ax-textMute ml-1">/mo</span>
                  </div>
                </div>
              ))}
          </div>
        </Card>

        <Card title="Top infrastructure spend">
          <div className="space-y-2">
            {workload.infrastructureResources
              .map((r) => ({ r, cost: INFRA_COST_USD[r.id] ?? 0 }))
              .filter((x) => x.cost > 0)
              .sort((a, b) => b.cost - a.cost)
              .slice(0, 6)
              .map(({ r, cost }) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between text-[12px] border-b border-ax-border pb-1.5 last:border-b-0 last:pb-0"
                >
                  <span className="text-ax-text truncate">{r.name}</span>
                  <span className="text-ax-textDim shrink-0">{formatUsd(cost)}</span>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}

function SankeyNode({ x, y, width, height, index, payload, nodes }: any) {
  const layer = nodes[index]?.layer;
  const fill =
    layer === "infra"
      ? "#2899f5"
      : layer === "app"
      ? "#7b61ff"
      : "#5db85d";
  return (
    <Layer>
      <Rectangle x={x} y={y} width={width} height={height} fill={fill} fillOpacity={0.85} />
      <text
        textAnchor={x < 200 ? "start" : "start"}
        x={x + width + 6}
        y={y + height / 2}
        fontSize={11}
        fill="#c8c6c4"
        dominantBaseline="middle"
      >
        {payload.name}
      </text>
    </Layer>
  );
}
