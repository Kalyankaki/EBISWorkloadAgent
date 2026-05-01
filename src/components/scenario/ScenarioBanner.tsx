"use client";

import { AlertTriangle, Sparkles, Activity, CheckCircle2 } from "lucide-react";
import { useWvi } from "@/store/useWvi";
import { SCENARIO_STEPS } from "@/data/archetypes";

export function ScenarioBanner() {
  const stepId = useWvi((s) => s.stepId);
  const step = SCENARIO_STEPS.find((s) => s.id === stepId);
  if (!step || step.id === "steady") return null;

  const tone =
    step.id === "incident" || step.id === "impact"
      ? { bg: "rgba(227,84,84,0.10)", fg: "#e35454", border: "rgba(227,84,84,0.4)", Icon: AlertTriangle }
      : step.id === "early"
      ? { bg: "rgba(240,160,32,0.10)", fg: "#f0a020", border: "rgba(240,160,32,0.4)", Icon: Activity }
      : step.id === "resolved"
      ? { bg: "rgba(93,184,93,0.10)", fg: "#5db85d", border: "rgba(93,184,93,0.4)", Icon: CheckCircle2 }
      : { bg: "rgba(40,153,245,0.10)", fg: "#2899f5", border: "rgba(40,153,245,0.4)", Icon: Sparkles };

  const Icon = tone.Icon;
  return (
    <div
      className="mx-5 mt-3 rounded-ax border px-3 py-2 flex items-center gap-3 text-[12px]"
      style={{ background: tone.bg, borderColor: tone.border }}
    >
      <Icon size={14} style={{ color: tone.fg }} />
      <div className="font-semibold" style={{ color: tone.fg }}>
        {step.time} · {step.label}
      </div>
      <div className="text-ax-textDim">{step.description}</div>
    </div>
  );
}
