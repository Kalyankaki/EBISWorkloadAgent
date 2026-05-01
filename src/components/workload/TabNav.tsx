"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { id: "overview", label: "Overview", path: "" },
  { id: "topology", label: "Workload IQ · Topology", path: "/topology" },
  { id: "application", label: "Application IQ", path: "/application" },
  { id: "infrastructure", label: "Infrastructure IQ", path: "/infrastructure" },
  { id: "recommendations", label: "Recommendations", path: "/recommendations" },
  { id: "incidents", label: "Active incident", path: "/incidents" },
  { id: "onboarding", label: "Onboarding", path: "/onboarding" },
  { id: "cost", label: "Cost map", path: "/cost" },
];

export function TabNav({ workloadId }: { workloadId: string }) {
  const pathname = usePathname();
  const base = `/workloads/${workloadId}`;

  return (
    <div className="px-3 border-b border-ax-border bg-ax-panel/30 flex items-center gap-1 h-9 overflow-x-auto">
      {TABS.map((t) => {
        const href = base + t.path;
        const active = pathname === href || (t.path === "" && pathname === base);
        return (
          <Link
            key={t.id}
            href={href}
            className={
              "px-3 h-9 text-[12px] flex items-center whitespace-nowrap border-b-2 -mb-px " +
              (active
                ? "border-ax-accent text-ax-text font-semibold"
                : "border-transparent text-ax-textDim hover:text-ax-text")
            }
          >
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
