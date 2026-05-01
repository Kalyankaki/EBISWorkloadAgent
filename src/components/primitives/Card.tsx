import type { ReactNode } from "react";

export function Card({
  title,
  right,
  children,
  className = "",
  noPadding,
}: {
  title?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <div
      className={
        "border border-ax-border bg-ax-panel rounded-ax " + className
      }
    >
      {title && (
        <div className="flex items-center justify-between px-3.5 py-2 border-b border-ax-border">
          <div className="text-[13px] font-semibold text-ax-text">{title}</div>
          {right && <div className="text-[12px] text-ax-textMute">{right}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-3.5"}>{children}</div>
    </div>
  );
}

export function PropertyRow({
  label,
  value,
}: {
  label: ReactNode;
  value: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-1 border-b border-ax-border last:border-b-0">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-ax-textMute w-44 shrink-0 pt-0.5">
        {label}
      </div>
      <div className="text-[13px] text-ax-text break-words">{value}</div>
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="text-[13px] font-semibold text-ax-text mb-2">
      {children}
    </div>
  );
}
