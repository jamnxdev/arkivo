"use client";

import {
  ChartBarIcon,
  ChecksIcon,
  HouseIcon,
  UserCircleIcon,
} from "@phosphor-icons/react";
import Link from "next/link";

type MobileBottomNavProps = {
  previewWidthClass: string;
};

export function MobileBottomNav({ previewWidthClass }: MobileBottomNavProps) {
  return (
    <nav
      className={`fixed bottom-0 left-1/2 z-50 w-full ${previewWidthClass} -translate-x-1/2 border-x border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60`}
    >
      <ul className="grid grid-cols-4">
        <li>
          <Link
            href="/dashboard"
            className="flex h-16 flex-col items-center justify-center gap-1 text-xs font-medium text-foreground"
          >
            <HouseIcon size={20} weight="duotone" />
            Home
          </Link>
        </li>
        <li>
          <button
            type="button"
            className="flex h-16 w-full flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground"
          >
            <ChecksIcon size={20} weight="duotone" />
            Tasks
          </button>
        </li>
        <li>
          <button
            type="button"
            className="flex h-16 w-full flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground"
          >
            <ChartBarIcon size={20} weight="duotone" />
            Stats
          </button>
        </li>
        <li>
          <button
            type="button"
            className="flex h-16 w-full flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground"
          >
            <UserCircleIcon size={20} weight="duotone" />
            Profile
          </button>
        </li>
      </ul>
    </nav>
  );
}
