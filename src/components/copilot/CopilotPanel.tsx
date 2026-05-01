"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Send, Sparkles, X, Quote } from "lucide-react";
import { useState } from "react";
import { useWvi } from "@/store/useWvi";
import { COPILOT_SUGGESTIONS, COPILOT_TURNS } from "@/data/copilot";
import { getWorkload } from "@/data/workloads";
import { personaById } from "@/data/personas";
import { findComponent } from "@/lib/propagation";

export function CopilotPanel() {
  const open = useWvi((s) => s.copilotOpen);
  const setOpen = useWvi((s) => s.setCopilotOpen);
  const stepId = useWvi((s) => s.stepId);
  const persona = useWvi((s) => s.persona);
  const workloadId = useWvi((s) => s.currentWorkloadId);

  const [draft, setDraft] = useState("");
  const turns = COPILOT_TURNS[stepId];
  const workload = getWorkload(workloadId);
  const personaObj = personaById(persona);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 40, opacity: 0 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed top-12 right-0 bottom-0 z-30 w-[400px] border-l border-ax-border bg-ax-panel flex flex-col"
        >
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-ax-border">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-ax-accent" />
              <div className="text-[13px] font-semibold text-ax-text">
                Copilot · Workload IQ
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-ax-textMute hover:text-ax-text"
              aria-label="Close"
            >
              <X size={14} />
            </button>
          </div>
          <div className="px-4 py-2 border-b border-ax-border text-[11px] text-ax-textMute">
            Reasoning over <span className="text-ax-textDim">{workload.name}</span>{" "}
            · scoped to <span className="text-ax-textDim">{personaObj.name}</span> view
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {turns.map((t, i) => (
              <div
                key={i}
                className={
                  "rounded-ax border " +
                  (t.role === "assistant"
                    ? "border-ax-border bg-ax-panel2"
                    : "border-transparent bg-ax-accentDim/20")
                }
              >
                <div className="px-3 py-2 text-[12px] text-ax-text leading-relaxed">
                  {t.role === "assistant" && (
                    <div className="text-[10px] uppercase tracking-wide text-ax-accent font-semibold mb-1">
                      Workload IQ
                    </div>
                  )}
                  {t.role === "user" && (
                    <div className="text-[10px] uppercase tracking-wide text-ax-textMute font-semibold mb-1">
                      You
                    </div>
                  )}
                  {t.text}
                </div>
                {t.citations && t.citations.length > 0 && (
                  <div className="px-3 pb-2 flex flex-wrap gap-1">
                    {t.citations.map((c, j) => {
                      const comp = findComponent(workload, c.componentId);
                      return (
                        <span
                          key={j}
                          className="inline-flex items-center gap-1 text-[10px] bg-ax-panelHi text-ax-textDim px-1.5 py-0.5 rounded-ax border border-ax-border"
                          title={comp?.name}
                        >
                          <Quote size={10} />
                          {c.label}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="px-4 pt-2 pb-1 border-t border-ax-border">
            <div className="text-[10px] uppercase tracking-wide text-ax-textMute font-semibold mb-1.5">
              Try a question
            </div>
            <div className="flex flex-wrap gap-1 mb-2">
              {COPILOT_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setDraft(s)}
                  className="text-[11px] text-ax-textDim bg-ax-panel2 hover:bg-ax-panelHi border border-ax-border rounded-ax px-2 py-0.5 truncate max-w-full text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="px-4 pb-4 pt-2 border-t border-ax-border">
            <div className="flex items-end gap-2 bg-ax-panel2 border border-ax-border rounded-ax px-2 py-1.5">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask Copilot…"
                rows={2}
                className="flex-1 bg-transparent outline-none text-[12px] text-ax-text resize-none placeholder:text-ax-textMute"
              />
              <button
                className="text-ax-accent hover:text-white"
                onClick={() => setDraft("")}
                title="Send"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
