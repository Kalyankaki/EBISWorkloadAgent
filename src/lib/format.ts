// ============================================================
// Currency
// ============================================================

export function formatUsd(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export function formatUsdPerHour(n: number): string {
  return `${formatUsd(n)}/hr`;
}

export function formatUsdPerDay(n: number): string {
  return `${formatUsd(n)}/day`;
}

export function formatUsdPerMonth(n: number): string {
  return `${formatUsd(n)}/mo`;
}

export function formatRevenueAtRisk(rar: { value: number; unit: string }): string {
  if (rar.unit === "compliance") return "compliance / SOX";
  if (rar.unit === "foundation") return "foundation";
  if (rar.value === 0) return "—";
  if (rar.unit === "USD/hr") return formatUsdPerHour(rar.value);
  if (rar.unit === "USD/day") return formatUsdPerDay(rar.value);
  return `${formatUsd(rar.value)} · ${rar.unit}`;
}

// ============================================================
// Numbers
// ============================================================

export function shortNumber(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function pluralize(n: number, singular: string, plural?: string): string {
  return n === 1 ? singular : plural ?? singular + "s";
}
