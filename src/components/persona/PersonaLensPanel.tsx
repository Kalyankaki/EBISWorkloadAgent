"use client";

import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/primitives/Card";
import { Pill } from "@/components/primitives/Pill";
import { useWvi } from "@/store/useWvi";
import { personaById, personaLens } from "@/data/personas";
import { getRecommendationsFor, getWorkload } from "@/data/workloads";
import { getScenarioState } from "@/data/scenarios";
import type { PersonaPanelItem } from "@/data/schema";

export function PersonaLensPanel() {
  const router = useRouter();
  const persona = useWvi((s) => s.persona);
  const stepId = useWvi((s) => s.stepId);
  const workloadId = useWvi((s) => s.currentWorkloadId);

  const personaObj = personaById(persona);
  const workload = getWorkload(workloadId)!;
  const state = getScenarioState(workloadId, stepId);
  const recs = getRecommendationsFor(workloadId);
  const items = personaLens(persona, workload, state, recs);

  const navigate = (target?: string) => {
    if (!target) return;
    const path = target === "overview" ? "" : `/${target}`;
    router.push(`/workloads/${workloadId}${path}`);
  };

  return (
    <Card
      title={
        <span className="flex items-center gap-2">
          <span
            className="w-5 h-5 rounded-full grid place-items-center text-[10px] font-semibold text-white"
            style={{ background: personaObj.color }}
          >
            {personaObj.initials}
          </span>
          Today · {personaObj.name}
        </span>
      }
      right={
        <span className="text-ax-textMute italic text-[11px]">
          {personaObj.tagline}
        </span>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {items.map((it: PersonaPanelItem, i) => {
          const tone = it.tone;
          return (
            <div
              key={i}
              className="border border-ax-border bg-ax-panel2 rounded-ax p-3 flex flex-col gap-2"
            >
              <div className="flex items-start gap-2">
                <Pill
                  tone={
                    tone === "good"
                      ? "good"
                      : tone === "warn"
                      ? "warn"
                      : tone === "critical"
                      ? "bad"
                      : "info"
                  }
                  small
                >
                  {tone === "good"
                    ? "OK"
                    : tone === "warn"
                    ? "Watch"
                    : tone === "critical"
                    ? "Action"
                    : "Info"}
                </Pill>
                <div className="text-[13px] text-ax-text font-semibold leading-tight">
                  {it.title}
                </div>
              </div>
              {it.metric && (
                <div className="text-[20px] font-light text-ax-text leading-none">
                  {it.metric}
                  {it.metricSub && (
                    <span className="text-[11px] text-ax-textMute ml-2">
                      {it.metricSub}
                    </span>
                  )}
                </div>
              )}
              <div className="text-[12px] text-ax-textDim leading-relaxed">
                {it.body}
              </div>
              {it.cta && (
                <button
                  onClick={() => navigate(it.target)}
                  className="self-start mt-1 inline-flex items-center gap-1 text-[11px] text-ax-accent hover:text-white"
                >
                  {it.cta} <ChevronRight size={11} />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
