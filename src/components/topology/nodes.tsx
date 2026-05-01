"use client";

import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  Briefcase,
  Box,
  Database,
  Cpu,
  Network as NetIcon,
  HardDrive,
  Shield,
  Activity,
  KeyRound,
  Plug,
} from "lucide-react";
import { HealthDot } from "@/components/primitives/Pill";
import type { ResourceKind, HealthStatus, ComponentLayer } from "@/data/schema";

export interface WviNodeData extends Record<string, unknown> {
  label: string;
  layer: ComponentLayer;
  health: HealthStatus;
  sub?: string;
  kind?: ResourceKind | "ebs-module" | "ebs-runtime" | "integration";
  selected?: boolean;
  highlighted?: boolean;
}

const infraIcon: Partial<Record<ResourceKind, typeof Database>> = {
  Database: Database,
  Compute: Cpu,
  Network: NetIcon,
  Storage: HardDrive,
  Security: Shield,
  Observability: Activity,
  Identity: KeyRound,
  Integration: Plug,
};

export function ProcessNode({ data }: NodeProps<{ data: WviNodeData } & any>) {
  const d = data as WviNodeData;
  return (
    <div
      className={
        "rounded-ax border bg-ax-panel px-3 py-2 min-w-[180px] " +
        (d.health === "critical"
          ? "border-ax-bad/70"
          : d.health === "warning"
          ? "border-ax-warn/70"
          : "border-ax-border ") +
        (d.highlighted ? " ring-2 ring-ax-accent/60" : "")
      }
      style={{ boxShadow: d.health === "critical" ? "0 0 0 2px rgba(227,84,84,0.25)" : undefined }}
    >
      <Handle type="source" position={Position.Bottom} className="!bg-ax-borderHi" />
      <div className="flex items-center gap-2">
        <Briefcase size={14} className="text-ax-accent shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] uppercase font-semibold text-ax-textMute leading-none mb-0.5">
            Business process
          </div>
          <div className="text-[12px] font-semibold text-ax-text truncate">
            {d.label}
          </div>
          {d.sub && (
            <div className="text-[10px] text-ax-textMute truncate">{d.sub}</div>
          )}
        </div>
        <HealthDot status={d.health} pulse />
      </div>
    </div>
  );
}

export function AppNode({ data }: NodeProps<{ data: WviNodeData } & any>) {
  const d = data as WviNodeData;
  return (
    <div
      className={
        "rounded-ax border bg-ax-panel2 px-3 py-2 min-w-[160px] " +
        (d.health === "critical"
          ? "border-ax-bad/70"
          : d.health === "warning"
          ? "border-ax-warn/70"
          : "border-ax-border ") +
        (d.highlighted ? " ring-2 ring-ax-accent/60" : "")
      }
    >
      <Handle type="target" position={Position.Top} className="!bg-ax-borderHi" />
      <Handle type="source" position={Position.Bottom} className="!bg-ax-borderHi" />
      <div className="flex items-center gap-2">
        <Box size={13} className="text-[#7b61ff] shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase font-semibold text-ax-textMute leading-none mb-0.5">
            {d.kind === "integration" ? "Integration" : d.kind === "ebs-runtime" ? "Runtime" : "Module"}
          </div>
          <div className="text-[12px] font-semibold text-ax-text truncate">
            {d.label}
          </div>
        </div>
        <HealthDot status={d.health} pulse />
      </div>
    </div>
  );
}

export function InfraNode({ data }: NodeProps<{ data: WviNodeData } & any>) {
  const d = data as WviNodeData;
  const Icon =
    (d.kind && infraIcon[d.kind as ResourceKind]) || HardDrive;
  return (
    <div
      className={
        "rounded-ax border bg-ax-panelHi px-3 py-2 min-w-[160px] " +
        (d.health === "critical"
          ? "border-ax-bad/70"
          : d.health === "warning"
          ? "border-ax-warn/70"
          : "border-ax-border ") +
        (d.highlighted ? " ring-2 ring-ax-accent/60" : "")
      }
    >
      <Handle type="target" position={Position.Top} className="!bg-ax-borderHi" />
      <div className="flex items-center gap-2">
        <Icon size={13} className="text-ax-accent shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase font-semibold text-ax-textMute leading-none mb-0.5">
            {d.kind ?? "Infrastructure"}
          </div>
          <div className="text-[12px] font-semibold text-ax-text truncate">
            {d.label}
          </div>
          {d.sub && (
            <div className="text-[10px] text-ax-textMute truncate">{d.sub}</div>
          )}
        </div>
        <HealthDot status={d.health} pulse />
      </div>
    </div>
  );
}

export const nodeTypes = {
  process: ProcessNode,
  application: AppNode,
  infrastructure: InfraNode,
};
