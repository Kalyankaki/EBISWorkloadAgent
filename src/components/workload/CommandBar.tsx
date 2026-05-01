"use client";

import {
  RefreshCw,
  Settings,
  AlertTriangle,
  Network,
  Play,
  Download,
  ShieldCheck,
} from "lucide-react";

const ITEMS = [
  { icon: RefreshCw, label: "Refresh" },
  { icon: Settings, label: "Configure IQ" },
  { icon: AlertTriangle, label: "Drift report" },
  { icon: Network, label: "Reference architecture" },
  { icon: Play, label: "Run runbook" },
  { icon: ShieldCheck, label: "Compliance" },
  { icon: Download, label: "Export" },
];

export function CommandBar() {
  return (
    <div className="px-3 border-b border-ax-border bg-ax-panel/40 flex items-center gap-1 h-9 overflow-x-auto">
      {ITEMS.map((it, i) => {
        const Icon = it.icon;
        return (
          <button
            key={i}
            className="flex items-center gap-1.5 text-[12px] text-ax-textDim hover:text-ax-text px-2.5 h-7 rounded-ax hover:bg-ax-panelHi whitespace-nowrap"
          >
            <Icon size={12} />
            {it.label}
          </button>
        );
      })}
    </div>
  );
}
