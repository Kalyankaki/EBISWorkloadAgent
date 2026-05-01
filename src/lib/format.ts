export function formatUsd(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function pluralize(n: number, singular: string, plural?: string): string {
  return n === 1 ? singular : plural ?? singular + "s";
}

export function formatRevenueAtRisk(r: { value: number; unit: string }): string {
  if (r.unit === "compliance") return "compliance / SOX";
  if (r.unit === "foundation") return "foundation";
  if (r.value === 0) return "—";
  if (r.unit === "USD/hr") return `${formatUsd(r.value)}/hr`;
  if (r.unit === "USD/day") return `${formatUsd(r.value)}/day`;
  return `${formatUsd(r.value)} · ${r.unit}`;
}
