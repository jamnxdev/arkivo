"use client";

import { motion } from "motion/react";
import { useMemo } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

import { useChart } from "./chart-context";
import { useChartPortalRoot } from "./use-chart-portal-root";
import { useIsClient } from "./use-is-client";

export interface BarXAxisProps {
  /** Width of the date ticker box for fade calculation. Default: 50 */
  tickerHalfWidth?: number;
  /** Whether to show all labels or skip some for dense data. Default: false */
  showAllLabels?: boolean;
  /** Maximum number of labels to show. Default: 12 */
  maxLabels?: number;
}

interface BarXAxisLabelProps {
  label: string;
  x: number;
  crosshairX: number | null;
  isHovering: boolean;
  tickerHalfWidth: number;
}

function BarXAxisLabel({
  label,
  x,
  crosshairX,
  isHovering,
  tickerHalfWidth,
}: BarXAxisLabelProps) {
  const fadeBuffer = 20;
  const fadeRadius = tickerHalfWidth + fadeBuffer;

  let opacity = 1;
  if (isHovering && crosshairX !== null) {
    const distance = Math.abs(x - crosshairX);
    if (distance < tickerHalfWidth) {
      opacity = 0;
    } else if (distance < fadeRadius) {
      opacity = (distance - tickerHalfWidth) / fadeBuffer;
    }
  }

  // Zero-width container approach for perfect centering
  return (
    <div
      className="absolute"
      style={{
        left: x,
        bottom: 12,
        width: 0,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <motion.span
        animate={{ opacity }}
        className={cn("text-xs whitespace-nowrap text-chart-label")}
        initial={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
      >
        {label}
      </motion.span>
    </div>
  );
}

export function BarXAxis({
  tickerHalfWidth = 50,
  showAllLabels = false,
  maxLabels = 12,
}: BarXAxisProps) {
  const {
    margin,
    tooltipData,
    containerRef,
    barScale,
    bandWidth,
    barXAccessor,
    data,
    width,
    height,
  } = useChart();
  const isClient = useIsClient();
  const portalRoot = useChartPortalRoot(containerRef, isClient, width + height);

  // Generate labels for each bar
  const labelsToShow = useMemo(() => {
    if (!(barScale && bandWidth && barXAccessor)) {
      return [];
    }

    const allLabels = data.map((d) => {
      const label = barXAccessor(d);
      const bandX = barScale(label) ?? 0;
      // Center the label under the bar group
      const x = bandX + bandWidth / 2 + margin.left;
      return { label, x };
    });

    const plotWidth = Math.max(1, width - margin.left - margin.right);
    const autoMaxLabels = Math.max(2, Math.floor(plotWidth / 72));
    const resolvedMaxLabels = Math.min(maxLabels, autoMaxLabels);

    // If showAllLabels is true or we have fewer than maxLabels, show all
    if (showAllLabels || allLabels.length <= resolvedMaxLabels) {
      return allLabels;
    }

    // Otherwise, skip some labels to avoid crowding while keeping first and last.
    const step = Math.ceil((allLabels.length - 1) / (resolvedMaxLabels - 1));
    const sampled = allLabels.filter((_, i) => i % step === 0);
    const last = allLabels[allLabels.length - 1];
    if (last && sampled[sampled.length - 1]?.x !== last.x) {
      sampled.push(last);
    }
    return sampled;
  }, [
    barScale,
    bandWidth,
    barXAccessor,
    data,
    width,
    margin.left,
    margin.right,
    showAllLabels,
    maxLabels,
  ]);

  const isHovering = tooltipData !== null;
  const crosshairX = tooltipData ? tooltipData.x + margin.left : null;

  if (!(isClient && portalRoot)) {
    return null;
  }

  // Early return if not in a BarChart
  if (!barScale) {
    return null;
  }

  return createPortal(
    <div className="pointer-events-none absolute inset-0">
      {labelsToShow.map((item) => (
        <BarXAxisLabel
          crosshairX={crosshairX}
          isHovering={isHovering}
          key={`${item.label}-${item.x}`}
          label={item.label}
          tickerHalfWidth={tickerHalfWidth}
          x={item.x}
        />
      ))}
    </div>,
    portalRoot,
  );
}

BarXAxis.displayName = "BarXAxis";

export default BarXAxis;
