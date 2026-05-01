import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Fragment, type ReactNode } from "react";

export function Breadcrumb({
  items,
}: {
  items: { label: ReactNode; href?: string }[];
}) {
  return (
    <div className="flex items-center gap-1 text-[12px] text-ax-textMute px-5 pt-3">
      {items.map((it, i) => (
        <Fragment key={i}>
          {i > 0 && <ChevronRight size={12} />}
          {it.href && i < items.length - 1 ? (
            <Link href={it.href} className="hover:text-ax-text">
              {it.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? "text-ax-textDim" : ""}>
              {it.label}
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );
}
