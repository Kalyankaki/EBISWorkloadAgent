"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { AlertTriangle, GitPullRequest, Sparkles } from "lucide-react";
import { Card, PropertyRow, SectionTitle } from "@/components/primitives/Card";
import { Pill } from "@/components/primitives/Pill";
import { Blade } from "@/components/primitives/Blade";
import { useWvi } from "@/store/useWvi";
import { getRecommendationsFor, getWorkload } from "@/data/workloads";
import { findComponent } from "@/lib/propagation";
import { formatUsd } from "@/lib/format";
import type { Recommendation } from "@/data/schema";

const SEVERITY_RANK = { critical: 0, high: 1, medium: 2, low: 3 } as const;

export default function RecommendationsPage() {
  const stepId = useWvi((s) => s.stepId);
  const workloadId = useWvi((s) => s.currentWorkloadId);
  const workload = getWorkload(workloadId);
  const all = getRecommendationsFor(workloadId);

  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"impact" | "severity" | "cost" | "date">("impact");
  const [selected, setSelected] = useState<Recommendation | null>(null);

  const items = useMemo(() => {
    let list = all.slice();
    if (severityFilter !== "all") list = list.filter((r) => r.severity === severityFilter);
    if (categoryFilter !== "all") list = list.filter((r) => r.category === categoryFilter);
    if (sortBy === "severity") {
      list.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);
    } else if (sortBy === "cost") {
      list.sort((a, b) => (a.estimatedCostDeltaUsdPerMonth ?? 0) - (b.estimatedCostDeltaUsdPerMonth ?? 0));
    } else if (sortBy === "date") {
      list.sort((a, b) => a.flaggedAt.localeCompare(b.flaggedAt));
    } else {
      // impact: criticality of affected processes, then severity
      const criticalityScore = (r: Recommendation) =>
        r.affectedProcesses.reduce((acc, pid) => {
          const p = workload.processes.find((x) => x.id === pid);
          if (!p) return acc;
          if (p.criticality === "Critical") return acc + 4;
          if (p.criticality === "High") return acc + 2;
          if (p.criticality === "Medium") return acc + 1;
          return acc;
        }, 0);
      list.sort(
        (a, b) =>
          criticalityScore(b) - criticalityScore(a) ||
          SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]
      );
    }
    return list;
  }, [all, severityFilter, categoryFilter, sortBy, workload.processes]);

  const showPostIncidentBanner = stepId === "resolved" || stepId === "impact";

  return (
    <motion.div
      initial={{ x: 8, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="px-5 pt-4 space-y-4 pb-12"
    >
      {showPostIncidentBanner && (
        <div className="border border-ax-bad/40 bg-ax-bad/5 rounded-ax px-3 py-2 flex items-start gap-2 text-[12px]">
          <AlertTriangle size={14} className="text-ax-bad shrink-0 mt-0.5" />
          <div>
            <span className="text-ax-bad font-semibold">
              1 deferred recommendation contributed to INC-4471.
            </span>{" "}
            <span className="text-ax-textDim">
              R-2271 (redo storage IOPS bump) was flagged 9 days ago and auto-deferred by policy P-4. Review your auto-defer policy.
            </span>
          </div>
        </div>
      )}

      <Card title={`Recommendations · ${all.length}`} noPadding>
        <div className="px-3 py-2 border-b border-ax-border flex flex-wrap items-center gap-2 text-[11px]">
          <span className="text-ax-textMute">Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-ax-panel2 border border-ax-border rounded-ax px-2 py-0.5"
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <span className="text-ax-textMute ml-2">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-ax-panel2 border border-ax-border rounded-ax px-2 py-0.5"
          >
            <option value="all">All</option>
            <option value="Reliability">Reliability</option>
            <option value="Security">Security</option>
            <option value="Cost">Cost</option>
            <option value="Operations">Operations</option>
            <option value="Performance">Performance</option>
            <option value="Architecture">Architecture</option>
          </select>
          <span className="text-ax-textMute ml-2">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-ax-panel2 border border-ax-border rounded-ax px-2 py-0.5"
          >
            <option value="impact">Business impact</option>
            <option value="severity">Severity</option>
            <option value="cost">Cost delta</option>
            <option value="date">Date flagged</option>
          </select>
        </div>
        <table className="w-full text-[12px]">
          <thead className="bg-ax-panel2 text-ax-textMute uppercase text-[11px]">
            <tr>
              <th className="text-left px-3 py-2 font-semibold">Severity</th>
              <th className="text-left px-3 py-2 font-semibold">Category</th>
              <th className="text-left px-3 py-2 font-semibold">Title</th>
              <th className="text-left px-3 py-2 font-semibold">Affected processes</th>
              <th className="text-right px-3 py-2 font-semibold">Cost / mo</th>
              <th className="text-left px-3 py-2 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr
                key={r.id}
                className={
                  "border-t border-ax-border hover:bg-ax-panel2 cursor-pointer " +
                  (r.id === "rec-2271" && showPostIncidentBanner
                    ? "bg-ax-bad/5"
                    : "")
                }
                onClick={() => setSelected(r)}
              >
                <td className="px-3 py-2">
                  <Pill
                    tone={
                      r.severity === "critical"
                        ? "bad"
                        : r.severity === "high"
                        ? "warn"
                        : r.severity === "medium"
                        ? "info"
                        : "neutral"
                    }
                    small
                  >
                    {r.severity}
                  </Pill>
                </td>
                <td className="px-3 py-2 text-ax-textDim">{r.category}</td>
                <td className="px-3 py-2 text-ax-text">{r.title}</td>
                <td className="px-3 py-2 text-ax-textDim">
                  {r.affectedProcesses.length === 0 ? (
                    "—"
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {r.affectedProcesses.slice(0, 2).map((pid) => {
                        const p = workload.processes.find((x) => x.id === pid);
                        if (!p) return null;
                        return (
                          <Pill
                            key={pid}
                            tone={p.criticality === "Critical" ? "bad" : p.criticality === "High" ? "warn" : "info"}
                            small
                          >
                            {p.name}
                          </Pill>
                        );
                      })}
                      {r.affectedProcesses.length > 2 && (
                        <span className="text-[10px] text-ax-textMute self-center">
                          +{r.affectedProcesses.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 text-right text-ax-textDim">
                  {r.estimatedCostDeltaUsdPerMonth == null
                    ? "—"
                    : r.estimatedCostDeltaUsdPerMonth < 0
                    ? <span className="text-ax-good">{formatUsd(r.estimatedCostDeltaUsdPerMonth)}</span>
                    : <span className="text-ax-textDim">+{formatUsd(r.estimatedCostDeltaUsdPerMonth)}</span>}
                </td>
                <td className="px-3 py-2">
                  <Pill
                    tone={
                      r.status === "applied"
                        ? "good"
                        : r.status === "deferred"
                        ? "warn"
                        : r.status === "dismissed"
                        ? "neutral"
                        : "info"
                    }
                    small
                  >
                    {r.status}
                  </Pill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Blade
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.title ?? ""}
        subtitle={selected ? `${selected.id} · ${selected.category}` : ""}
        width={600}
      >
        {selected && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Pill
                tone={
                  selected.severity === "critical"
                    ? "bad"
                    : selected.severity === "high"
                    ? "warn"
                    : "info"
                }
              >
                {selected.severity}
              </Pill>
              <Pill tone="neutral">{selected.category}</Pill>
              <Pill
                tone={
                  selected.status === "applied"
                    ? "good"
                    : selected.status === "deferred"
                    ? "warn"
                    : "info"
                }
              >
                {selected.status}
              </Pill>
            </div>

            <div>
              <SectionTitle>Rationale</SectionTitle>
              <div className="text-[12px] text-ax-textDim leading-relaxed">{selected.rationale}</div>
            </div>

            <div>
              <SectionTitle>Affected processes</SectionTitle>
              {selected.affectedProcesses.length === 0 ? (
                <div className="text-[12px] text-ax-textMute">—</div>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {selected.affectedProcesses.map((pid) => {
                    const p = findComponent(workload, pid) as any;
                    return (
                      <Pill
                        key={pid}
                        tone={p?.criticality === "Critical" ? "bad" : p?.criticality === "High" ? "warn" : "info"}
                        small
                      >
                        {p?.name ?? pid}
                      </Pill>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <SectionTitle>Affected resources</SectionTitle>
              <div className="flex flex-wrap gap-1">
                {selected.affectedResources.map((id) => {
                  const r = findComponent(workload, id);
                  return (
                    <Pill key={id} tone="neutral" small>
                      {r?.name ?? id}
                    </Pill>
                  );
                })}
              </div>
            </div>

            <div>
              <SectionTitle>Estimates</SectionTitle>
              <PropertyRow
                label="Cost delta / mo"
                value={
                  selected.estimatedCostDeltaUsdPerMonth == null
                    ? "—"
                    : selected.estimatedCostDeltaUsdPerMonth < 0
                    ? `${formatUsd(selected.estimatedCostDeltaUsdPerMonth)} (savings)`
                    : `+${formatUsd(selected.estimatedCostDeltaUsdPerMonth)}`
                }
              />
              <PropertyRow
                label="Risk reduction"
                value={selected.estimatedRiskReductionPct != null ? `${selected.estimatedRiskReductionPct}%` : "—"}
              />
              <PropertyRow label="Flagged" value={selected.flaggedAt} />
              {selected.iaCPullRequest && (
                <PropertyRow
                  label="IaC PR"
                  value={
                    <span className="inline-flex items-center gap-1 text-ax-accent">
                      <GitPullRequest size={11} />
                      {selected.iaCPullRequest}
                    </span>
                  }
                />
              )}
            </div>

            {selected.id === "rec-2271" && stepId !== "steady" && (
              <div className="border border-ax-bad/40 bg-ax-bad/5 rounded-ax px-3 py-2 text-[12px]">
                <span className="text-ax-bad font-semibold">Contributing factor:</span>{" "}
                <span className="text-ax-textDim">
                  This recommendation was deferred 9 days ago and contributed to INC-4471.
                </span>
              </div>
            )}

            <div className="flex gap-2">
              <button className="flex-1 bg-ax-accentDim hover:bg-ax-accent text-white text-[12px] h-8 rounded-ax">
                Apply
              </button>
              <button className="flex-1 bg-ax-panel2 hover:bg-ax-panelHi border border-ax-border text-ax-textDim text-[12px] h-8 rounded-ax">
                Defer
              </button>
              <button className="flex-1 bg-ax-panel2 hover:bg-ax-panelHi border border-ax-border text-ax-textDim text-[12px] h-8 rounded-ax">
                Dismiss
              </button>
            </div>
          </div>
        )}
      </Blade>
    </motion.div>
  );
}
