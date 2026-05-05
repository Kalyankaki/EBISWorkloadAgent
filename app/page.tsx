import Link from "next/link";
import { ArrowRight, Layers, Network, Sparkles, Zap } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { Pill } from "@/components/primitives/Pill";
import { WORKLOAD_LIST } from "@/data/workloads";

export default function HomePage() {
  return (
    <div className="px-5 pt-5 pb-12 max-w-[1400px]">
      <div className="text-[22px] font-light text-ax-text mb-1">
        Workload Virtual Instance
      </div>
      <div className="text-[12px] text-ax-textMute mb-5">
        Bind business processes, applications, and Azure infrastructure into a
        single graph. Surface the same truth through any persona.
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Welcome" right={<Pill tone="info">Preview</Pill>}>
          <div className="text-[13px] text-ax-textDim leading-relaxed">
            Workload IQ propagates infrastructure signals across the graph so
            every persona — from CSA to FinOps — sees the same incident through
            their own lens, reading from the same data.
          </div>
          <div className="mt-3">
            <Link
              href="/workloads"
              className="inline-flex items-center gap-1.5 text-[12px] text-ax-accent hover:text-white"
            >
              Open all workloads <ArrowRight size={12} />
            </Link>
          </div>
        </Card>

        <Card title="Recent workloads">
          <div className="space-y-2">
            {WORKLOAD_LIST.map((w) => (
              <Link
                key={w.id}
                href={`/workloads/${w.id}`}
                className="flex items-center justify-between gap-2 px-2 py-2 rounded-ax border border-ax-border bg-ax-panel2 hover:bg-ax-panelHi"
              >
                <div className="min-w-0">
                  <div className="text-[13px] text-ax-text truncate">
                    {w.name}
                  </div>
                  <div className="text-[11px] text-ax-textMute truncate">
                    {w.archetype.name}
                  </div>
                </div>
                <Pill tone={w.tier === 1 ? "bad" : w.tier === 2 ? "warn" : "info"} small>
                  Tier {w.tier}
                </Pill>
              </Link>
            ))}
          </div>
        </Card>

        <Card title="What's new">
          <ul className="space-y-2 text-[12px] text-ax-textDim">
            <li className="flex items-start gap-2">
              <Layers size={13} className="mt-0.5 text-ax-accent shrink-0" />
              <span>Cross-stack causal propagation: infra → app → process.</span>
            </li>
            <li className="flex items-start gap-2">
              <Network size={13} className="mt-0.5 text-ax-accent shrink-0" />
              <span>Reference architecture conformance scoring &amp; drift.</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles size={13} className="mt-0.5 text-ax-accent shrink-0" />
              <span>AI Agent persona with approval-gated autonomous actions.</span>
            </li>
            <li className="flex items-start gap-2">
              <Zap size={13} className="mt-0.5 text-ax-accent shrink-0" />
              <span>Auto-staged runbooks based on telemetry patterns.</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
