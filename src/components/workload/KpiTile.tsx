import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export function KpiTile({
  Icon,
  label,
  value,
  trend,
  tone = "info",
}: {
  Icon?: LucideIcon;
  label: string;
  value: ReactNode;
  trend?: ReactNode;
  tone?: "info" | "good" | "warn" | "bad";
}) {
  const toneCol =
    tone === "good"
      ? "#5db85d"
      : tone === "warn"
      ? "#f0a020"
      : tone === "bad"
      ? "#e35454"
      : "#2899f5";
  return (
    <div className="border border-ax-border bg-ax-panel rounded-ax px-4 py-3 flex flex-col gap-1.5 min-h-[100px]">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-ax-textMute font-semibold">
        {Icon && <Icon size={12} style={{ color: toneCol }} />}
        {label}
      </div>
      <div className="text-[26px] font-light text-ax-text leading-tight">
        {value}
      </div>
      {trend && <div className="text-[11px] text-ax-textMute">{trend}</div>}
    </div>
  );
}
