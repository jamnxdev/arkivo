"use client";

import type { RefObject } from "react";
import { useLayoutEffect, useState } from "react";

/**
 * DOM refs do not trigger re-renders when `.current` updates; read the chart
 * container in layout effects so portals (axis labels, tooltips) stay valid
 * without accessing refs during render.
 */
export function useChartPortalRoot(
  containerRef: RefObject<HTMLDivElement | null>,
  layoutReady: boolean,
  /** Re-sync when chart size updates so ref.current is re-read. */
  layoutSignal: number,
): HTMLElement | null {
  const [node, setNode] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    let cancelled = false;
    requestAnimationFrame(() => {
      if (cancelled) {
        return;
      }
      if (!layoutReady) {
        setNode(null);
        return;
      }
      setNode(containerRef.current);
    });
    return () => {
      cancelled = true;
    };
  }, [layoutReady, containerRef, layoutSignal]);

  return node;
}
