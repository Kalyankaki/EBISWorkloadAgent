"use client";

import {
  Home,
  Star,
  Layers,
  Server,
  Database,
  Network,
  ShieldCheck,
  DollarSign,
  Activity,
  ChevronLeft,
  ChevronRight,
  PlusSquare,
  Megaphone,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ax } from "@/theme/tokens";

const ITEMS = [
  { icon: PlusSquare, label: "Create a resource", href: "/" },
  { icon: Home, label: "Home", href: "/" },
  { icon: Star, label: "Favorites", href: "/" },
  { icon: Layers, label: "Workload Virtual Instance", href: "/workloads" },
  { icon: Megaphone, label: "Exec overview & pitch", href: "/pitch" },
  { icon: Server, label: "All resources", href: "/" },
  { icon: Database, label: "Oracle DB@Azure", href: "/" },
  { icon: Server, label: "Virtual machines", href: "/" },
  { icon: Network, label: "Networking", href: "/" },
  { icon: ShieldCheck, label: "Microsoft Defender for Cloud", href: "/" },
  { icon: DollarSign, label: "Cost Management", href: "/" },
  { icon: Activity, label: "Monitor", href: "/" },
];

export function LeftRail() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <div
      className="shrink-0 border-r flex flex-col"
      style={{
        background: ax.navBg,
        borderColor: ax.border,
        width: collapsed ? 48 : 220,
        transition: "width 0.15s ease-out",
      }}
    >
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="self-end p-2 text-ax-textMute hover:text-ax-text"
        title={collapsed ? "Expand" : "Collapse"}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
      <nav className="flex-1 overflow-y-auto pb-3">
        {ITEMS.map((it, i) => {
          const Icon = it.icon;
          const active =
            it.href === "/workloads"
              ? pathname.startsWith("/workloads")
              : it.href === "/pitch"
              ? pathname.startsWith("/pitch")
              : pathname === it.href;
          return (
            <Link
              key={i}
              href={it.href}
              className={
                "flex items-center gap-2.5 px-3 py-1.5 text-[12px] " +
                (active
                  ? "text-white border-l-2 border-ax-accent bg-white/[0.06]"
                  : "text-ax-textDim hover:bg-white/[0.04] border-l-2 border-transparent")
              }
              title={it.label}
            >
              <Icon size={14} className="shrink-0" />
              {!collapsed && <span className="truncate">{it.label}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
