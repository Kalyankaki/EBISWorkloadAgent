import type { ReactNode } from "react";
import { ax } from "@/theme/tokens";
import type { HealthStatus } from "@/data/schema";

type Tone = "info" | "good" | "warn" | "bad" | "neutral";

const toneColor: Record<Tone, { bg: string; fg: string; border: string }> = {
  info: { bg: "rgba(40,153,245,0.12)", fg: ax.info, border: "rgba(40,153,245,0.3)" },
  good: { bg: "rgba(93,184,93,0.12)", fg: ax.good, border: "rgba(93,184,93,0.3)" },
  warn: { bg: "rgba(240,160,32,0.12)", fg: ax.warn, border: "rgba(240,160,32,0.3)" },
  bad: { bg: "rgba(227,84,84,0.12)", fg: ax.bad, border: "rgba(227,84,84,0.3)" },
  neutral: { bg: "rgba(96,94,92,0.18)", fg: ax.textDim, border: ax.border },
};

export function Pill({
  tone = "neutral",
  children,
  small,
}: {
  tone?: Tone;
  children: ReactNode;
  small?: boolean;
}) {
  const c = toneColor[tone];
  return (
    <span
      className={
        "inline-flex items-center gap-1 border rounded-ax font-semibold " +
        (small ? "text-[10px] px-1.5 py-0" : "text-[11px] px-2 py-0.5")
      }
      style={{ background: c.bg, color: c.fg, borderColor: c.border }}
    >
      {children}
    </span>
  );
}

export function HealthDot({
  status,
  size = 8,
  pulse,
}: {
  status: HealthStatus;
  size?: number;
  pulse?: boolean;
}) {
  const color =
    status === "healthy"
      ? ax.good
      : status === "warning"
      ? ax.warn
      : status === "critical"
      ? ax.bad
      : ax.textMute;

  return (
    <span
      className={
        "inline-block rounded-full " +
        (pulse && status === "critical"
          ? "animate-pulseRing"
          : pulse && status === "warning"
          ? "animate-pulseRingWarn"
          : "")
      }
      style={{ width: size, height: size, background: color }}
    />
  );
}

export function HealthPill({ status }: { status: HealthStatus }) {
  const tone: Tone =
    status === "healthy"
      ? "good"
      : status === "warning"
      ? "warn"
      : status === "critical"
      ? "bad"
      : "neutral";
  const label =
    status === "healthy"
      ? "Healthy"
      : status === "warning"
      ? "Warning"
      : status === "critical"
      ? "Critical"
      : "Unknown";
  return (
    <Pill tone={tone}>
      <HealthDot status={status} />
      <span>{label}</span>
    </Pill>
  );
}
