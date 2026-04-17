import type { ReactNode } from "react";

export function StatsFilterBar({ children }: { children: ReactNode }) {
  return (
    <div className="-mx-1 flex flex-wrap gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:overflow-visible sm:px-0 sm:pb-0">
      {children}
    </div>
  );
}
