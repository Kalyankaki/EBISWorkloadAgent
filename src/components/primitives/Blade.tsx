"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Blade({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 520,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  width?: number;
}) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed top-0 right-0 bottom-0 z-50 bg-ax-panel border-l border-ax-border flex flex-col"
            style={{ width }}
          >
            <div className="flex items-start justify-between gap-3 px-4 py-3 border-b border-ax-border">
              <div className="min-w-0">
                <div className="text-[14px] font-semibold text-ax-text truncate">
                  {title}
                </div>
                {subtitle && (
                  <div className="text-[12px] text-ax-textMute truncate">
                    {subtitle}
                  </div>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-ax-textDim hover:text-ax-text p-1 rounded-ax hover:bg-ax-panelHi"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
