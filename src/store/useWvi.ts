"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PersonaId, ScenarioStepId, WorkloadId } from "@/data/schema";

interface WviState {
  persona: PersonaId;
  stepId: ScenarioStepId;
  currentWorkloadId: WorkloadId;
  copilotOpen: boolean;
  autoplay: boolean;
  setPersona: (persona: PersonaId) => void;
  setStepId: (stepId: ScenarioStepId) => void;
  setWorkloadId: (id: WorkloadId) => void;
  toggleCopilot: () => void;
  setCopilotOpen: (open: boolean) => void;
  setAutoplay: (v: boolean) => void;
  reset: () => void;
}

export const useWvi = create<WviState>()(
  persist(
    (set) => ({
      persona: "csa",
      stepId: "steady",
      currentWorkloadId: "ebs-prod",
      copilotOpen: false,
      autoplay: false,
      setPersona: (persona) => set({ persona }),
      setStepId: (stepId) => set({ stepId }),
      setWorkloadId: (id) => set({ currentWorkloadId: id }),
      toggleCopilot: () => set((s) => ({ copilotOpen: !s.copilotOpen })),
      setCopilotOpen: (open) => set({ copilotOpen: open }),
      setAutoplay: (v) => set({ autoplay: v }),
      reset: () =>
        set({
          persona: "csa",
          stepId: "steady",
          currentWorkloadId: "ebs-prod",
          copilotOpen: false,
          autoplay: false,
        }),
    }),
    {
      name: "wvi-state",
      // Persona/scenario/workload only; do not persist UI flags
      partialize: (s) => ({
        persona: s.persona,
        stepId: s.stepId,
        currentWorkloadId: s.currentWorkloadId,
      }),
    }
  )
);
