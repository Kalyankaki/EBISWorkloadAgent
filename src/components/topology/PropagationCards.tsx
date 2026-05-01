"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Beaker, ArrowRight } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { Pill } from "@/components/primitives/Pill";
import type { Workload, ComponentId } from "@/data/schema";
import { blastRadius, findComponent } from "@/lib/propagation";
import { formatRevenueAtRisk } from "@/lib/format";

export function PropagationCards({ workload }: { workload: Workload }) {
  const [forwardSeed, setForwardSeed] = useState<ComponentId>("i-stg-redo");
  const [reverseSeed, setReverseSeed] = useState<ComponentId>("p-gl-close");

  const forwardBlast = blastRadius(workload, forwardSeed);
  const reverseBlast = blastRadius(workload, reverseSeed);

  const forwardImpacted = forwardBlast.forwardIds
    .map((id) => findComponent(workload, id))
    .filter(Boolean);
  const reverseDeps = reverseBlast.reverseIds
    .map((id) => findComponent(workload, id))
    .filter(Boolean);

  const totalRevenueAtRisk = forwardImpacted
    .filter((c: any) => c.layer === "process")
    .reduce((sum: number, c: any) => {
      if (c.revenueAtRisk.unit === "USD/day") return sum + c.revenueAtRisk.value;
      if (c.revenueAtRisk.unit === "USD/hr") return sum + c.revenueAtRisk.value * 24;
      return sum;
    }, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card
        title={
          <span className="flex items-center gap-1.5">
            <ArrowUp size={13} className="text-ax-bad" /> Forward propagation
          </span>
        }
      >
        <div className="text-[11px] text-ax-textMute mb-2">
          Pick infrastructure → see what business processes are at risk
        </div>
        <select
          value={forwardSeed}
          onChange={(e) => setForwardSeed(e.target.value)}
          className="w-full bg-ax-panel2 border border-ax-border rounded-ax text-[12px] text-ax-text px-2 py-1.5 mb-3"
        >
          {workload.infrastructureResources.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
          {workload.applicationComponents.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} (app)
            </option>
          ))}
        </select>
        <div className="text-[11px] uppercase tracking-wider font-semibold text-ax-textMute mb-1">
          Impacted ({forwardBlast.forwardIds.length})
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {forwardImpacted.map((c: any) => (
            <Pill
              key={c.id}
              tone={c.layer === "process" ? "bad" : "warn"}
              small
            >
              {c.name}
            </Pill>
          ))}
        </div>
        {totalRevenueAtRisk > 0 && (
          <div className="border border-ax-bad/30 bg-ax-bad/5 rounded-ax px-3 py-2 text-[12px]">
            <span className="text-ax-textMute">Combined revenue at risk: </span>
            <span className="text-ax-bad font-semibold">
              {formatRevenueAtRisk({ value: totalRevenueAtRisk, unit: "USD/day" })}
            </span>
          </div>
        )}
      </Card>

      <Card
        title={
          <span className="flex items-center gap-1.5">
            <ArrowDown size={13} className="text-ax-accent" /> Reverse propagation
          </span>
        }
      >
        <div className="text-[11px] text-ax-textMute mb-2">
          Pick a process → see what infrastructure it depends on
        </div>
        <select
          value={reverseSeed}
          onChange={(e) => setReverseSeed(e.target.value)}
          className="w-full bg-ax-panel2 border border-ax-border rounded-ax text-[12px] text-ax-text px-2 py-1.5 mb-3"
        >
          {workload.processes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <div className="text-[11px] uppercase tracking-wider font-semibold text-ax-textMute mb-1">
          Dependencies ({reverseBlast.reverseIds.length})
        </div>
        <div className="flex flex-wrap gap-1">
          {reverseDeps.map((c: any) => (
            <Pill key={c.id} tone={c.layer === "infrastructure" ? "info" : "neutral"} small>
              {c.name}
            </Pill>
          ))}
        </div>
      </Card>

      <Card
        title={
          <span className="flex items-center gap-1.5">
            <Beaker size={13} className="text-ax-accent" /> What-if explorer
          </span>
        }
      >
        <div className="text-[12px] text-ax-textDim mb-3">
          Simulate: <span className="text-ax-text font-semibold">"Patch DB Node 2 Sat 02:00 UTC"</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="border border-ax-border bg-ax-panel2 rounded-ax px-2 py-2">
            <div className="text-[10px] uppercase font-semibold text-ax-textMute">
              Processes affected
            </div>
            <div className="text-[18px] font-light text-ax-text">7</div>
          </div>
          <div className="border border-ax-border bg-ax-panel2 rounded-ax px-2 py-2">
            <div className="text-[10px] uppercase font-semibold text-ax-textMute">
              Revenue at risk
            </div>
            <div className="text-[18px] font-light text-ax-bad">$0</div>
            <div className="text-[10px] text-ax-textMute">in window</div>
          </div>
          <div className="border border-ax-border bg-ax-panel2 rounded-ax px-2 py-2">
            <div className="text-[10px] uppercase font-semibold text-ax-textMute">
              Apps tier capacity
            </div>
            <div className="text-[18px] font-light text-ax-warn">−50%</div>
            <div className="text-[10px] text-ax-textMute">for 18 min</div>
          </div>
          <div className="border border-ax-border bg-ax-panel2 rounded-ax px-2 py-2">
            <div className="text-[10px] uppercase font-semibold text-ax-textMute">
              SLO budget burn
            </div>
            <div className="text-[18px] font-light text-ax-good">2.1%</div>
            <div className="text-[10px] text-ax-textMute">within budget</div>
          </div>
        </div>
        <button className="w-full text-[12px] inline-flex items-center justify-center gap-1 bg-ax-accentDim hover:bg-ax-accent text-white px-3 h-8 rounded-ax">
          Run simulation <ArrowRight size={12} />
        </button>
      </Card>
    </div>
  );
}
