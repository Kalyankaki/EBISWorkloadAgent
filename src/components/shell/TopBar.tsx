"use client";

import {
  Search,
  Bell,
  Settings,
  HelpCircle,
  Sparkles,
  PlayCircle,
  PauseCircle,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useWvi } from "@/store/useWvi";
import { PERSONAS } from "@/data/personas";
import { SCENARIO_STEPS } from "@/data/archetypes";
import { ax } from "@/theme/tokens";

export function TopBar() {
  const persona = useWvi((s) => s.persona);
  const setPersona = useWvi((s) => s.setPersona);
  const stepId = useWvi((s) => s.stepId);
  const setStepId = useWvi((s) => s.setStepId);
  const toggleCopilot = useWvi((s) => s.toggleCopilot);
  const reset = useWvi((s) => s.reset);
  const autoplay = useWvi((s) => s.autoplay);
  const setAutoplay = useWvi((s) => s.setAutoplay);

  // Autoplay: advance every 8s when on, stops at "resolved"
  useEffect(() => {
    if (!autoplay) return;
    const order = SCENARIO_STEPS.map((s) => s.id);
    const i = order.indexOf(stepId);
    if (i < 0 || i >= order.length - 1) {
      setAutoplay(false);
      return;
    }
    const t = setTimeout(() => setStepId(order[i + 1]), 8000);
    return () => clearTimeout(t);
  }, [autoplay, stepId, setAutoplay, setStepId]);

  const personaObj = PERSONAS.find((p) => p.id === persona) ?? PERSONAS[0];

  return (
    <div
      className="sticky top-0 z-40 flex items-center gap-4 px-4 h-12 border-b"
      style={{ background: ax.topBg, borderColor: "rgba(255,255,255,0.12)" }}
    >
      <Link href="/" className="flex items-center gap-2 shrink-0">
        <div className="w-5 h-5 grid grid-cols-2 grid-rows-2 gap-[1px]">
          <div className="bg-[#f25022]" />
          <div className="bg-[#7fba00]" />
          <div className="bg-[#00a4ef]" />
          <div className="bg-[#ffb900]" />
        </div>
        <span className="text-white text-[13px] font-normal whitespace-nowrap">
          Microsoft Azure
        </span>
      </Link>

      <div className="flex-1 max-w-xl">
        <div className="flex items-center gap-2 bg-white/10 hover:bg-white/15 rounded-ax px-3 h-7 text-white/90 text-[12px] cursor-text">
          <Search size={13} />
          <span className="text-white/70">
            Search resources, services and docs
          </span>
        </div>
      </div>

      {/* Scenario scrubber */}
      <div className="hidden md:flex items-center gap-1 bg-white/10 rounded-ax px-1 h-7">
        {SCENARIO_STEPS.map((s) => {
          const active = s.id === stepId;
          return (
            <button
              key={s.id}
              onClick={() => setStepId(s.id)}
              className={
                "px-2.5 h-6 rounded-ax text-[11px] font-semibold transition-colors " +
                (active
                  ? "bg-white text-[#0078d4]"
                  : "text-white/85 hover:bg-white/10")
              }
              title={s.description}
            >
              {s.time}
            </button>
          );
        })}
        <button
          onClick={() => setAutoplay(!autoplay)}
          className="ml-1 text-white/85 hover:text-white"
          title={autoplay ? "Pause autoplay" : "Autoplay scenario"}
        >
          {autoplay ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
        </button>
        <button
          onClick={() => {
            reset();
          }}
          className="text-white/85 hover:text-white"
          title="Reset to Steady"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {/* Persona switcher */}
      <select
        value={persona}
        onChange={(e) => setPersona(e.target.value as typeof persona)}
        className="bg-white/10 text-white text-[12px] h-7 rounded-ax px-2 border-0 outline-none cursor-pointer hover:bg-white/15"
        title="Switch persona"
      >
        {PERSONAS.map((p) => (
          <option key={p.id} value={p.id} className="text-black">
            {p.short}
          </option>
        ))}
      </select>

      <button
        onClick={toggleCopilot}
        className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 text-white text-[12px] h-7 px-2.5 rounded-ax"
        title="Copilot"
      >
        <Sparkles size={13} />
        <span>Copilot</span>
      </button>

      <div className="hidden md:flex items-center gap-3 text-white/85">
        <Bell size={14} />
        <Settings size={14} />
        <HelpCircle size={14} />
      </div>

      <div
        className="w-7 h-7 rounded-full grid place-items-center text-[11px] font-semibold text-white"
        style={{ background: personaObj.color }}
        title={personaObj.name}
      >
        {personaObj.initials}
      </div>
    </div>
  );
}
