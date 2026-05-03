// A stable "now" for the demo so date-relative content (e.g. "flagged 9 days ago")
// is deterministic. Aligned with Phase 2 spec.
export const DEMO_NOW = new Date("2026-05-03T12:00:00Z");

export function daysAgo(n: number): string {
  const d = new Date(DEMO_NOW.getTime() - n * 24 * 60 * 60 * 1000);
  return d.toISOString();
}

export function hoursAgo(n: number): string {
  const d = new Date(DEMO_NOW.getTime() - n * 60 * 60 * 1000);
  return d.toISOString();
}
