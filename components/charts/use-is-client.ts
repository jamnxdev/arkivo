"use client";

import { useSyncExternalStore } from "react";

/** True after client hydration; false during SSR. Avoids setState-in-effect for portals. */
export function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}
