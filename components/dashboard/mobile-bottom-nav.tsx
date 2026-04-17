"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { dashboardNavItems } from "./nav-items";

type MobileBottomNavProps = {
  previewWidthClass: string;
};

export function MobileBottomNav({ previewWidthClass }: MobileBottomNavProps) {
  const pathname = usePathname();

  return (
    <nav
      className={`fixed bottom-0 left-1/2 z-50 w-full ${previewWidthClass} -translate-x-1/2 border-x border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60`}
    >
      <ul className="grid grid-cols-4">
        {dashboardNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <li key={item.href}>
              {item.enabled ? (
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-16 w-full flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  <Icon size={20} weight={"duotone"} />
                  {item.label}
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="flex h-16 w-full flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground"
                >
                  <Icon size={20} weight="duotone" />
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
