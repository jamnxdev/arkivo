"use client";

import { useMemo } from "react";
import { createPortal } from "react-dom";

import { useChart } from "./chart-context";
import { useChartPortalRoot } from "./use-chart-portal-root";
import { useIsClient } from "./use-is-client";

export interface YAxisProps {
  /** Number of ticks to show. Default: 5 */
  numTicks?: number;
  /** Format large numbers (e.g. 1000 as "1k"). Default: true */
  formatLargeNumbers?: boolean;
  /** Custom formatter for tick labels (e.g. USD). Overrides formatLargeNumbers when set. */
  formatValue?: (value: number) => string;
}

function formatLabel(
  value: number,
  formatLargeNumbers: boolean,
  formatValue?: (value: number) => string,
): string {
  if (formatValue) {
    return formatValue(value);
  }
  if (formatLargeNumbers && value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  }
  return String(value);
}

export function YAxis({
  numTicks = 5,
  formatLargeNumbers = true,
  formatValue,
}: YAxisProps) {
  const { yScale, margin, containerRef, width, height } = useChart();
  const isClient = useIsClient();
  const portalRoot = useChartPortalRoot(containerRef, isClient, width + height);

  const ticks = useMemo(() => {
    const tickValues: number[] = yScale.ticks(numTicks);
    return tickValues.map((value) => ({
      value,
      y: (yScale(value) ?? 0) + margin.top,
      label: formatLabel(value, formatLargeNumbers, formatValue),
    }));
  }, [yScale, margin.top, numTicks, formatLargeNumbers, formatValue]);

  if (!(isClient && portalRoot)) {
    return null;
  }

  return createPortal(
    <div
      className="pointer-events-none absolute top-0 bottom-0"
      style={{ left: 0, width: margin.left }}
    >
      {ticks.map((tick) => (
        <div
          className="absolute right-0 flex items-center justify-end pr-2"
          key={tick.value}
          style={{ top: tick.y, transform: "translateY(-50%)" }}
        >
          <span className="text-xs text-chart-label">{tick.label}</span>
        </div>
      ))}
    </div>,
    portalRoot,
  );
}

YAxis.displayName = "YAxis";

export default YAxis;
