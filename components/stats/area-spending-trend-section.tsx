"use client";

import { useMemo, useState } from "react";

import { Area } from "@/components/charts/area";
import { AreaChart } from "@/components/charts/area-chart";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { YAxis } from "@/components/charts/y-axis";
import { StatsFilterBar } from "@/components/stats/filter-bar";
import { StatsDateRangeGrainControls } from "@/components/stats/stats-date-range-grain-controls";
import { formatCurrency } from "@/components/stats/stats-format";
import type { SpendingPoint } from "@/components/stats/stats-mock-data";
import { StatsSectionCard } from "@/components/stats/stats-section-card";
import {
  buildOrderedTrendChart,
  summarizeTrendChartSeries,
} from "@/components/stats/stats-series";
import { Button } from "@/components/ui/button";
import type {
  AreaVisualMode,
  DateRangePreset,
  TimeGrain,
  TrendAreaMode,
} from "@/types/stats-types";

interface AreaSpendingTrendSectionProps {
  dailySpending: SpendingPoint[];
  todayIso: string;
}

export function AreaSpendingTrendSection({
  dailySpending,
  todayIso,
}: AreaSpendingTrendSectionProps) {
  const [range, setRange] = useState<DateRangePreset>("90d");
  const [grain, setGrain] = useState<TimeGrain>("week");
  const [mode, setMode] = useState<TrendAreaMode>("spending");
  const [visual, setVisual] = useState<AreaVisualMode>("soft");
  const chartData = useMemo(
    () =>
      buildOrderedTrendChart(
        dailySpending,
        range,
        grain,
        "asc",
        todayIso,
      ),
    [dailySpending, grain, range, todayIso],
  );

  const areaSummary = useMemo(
    () => summarizeTrendChartSeries(chartData, mode),
    [chartData, mode],
  );

  return (
    <StatsSectionCard
      subtitle="Smoothed trend for the selected range with independent grouping controls."
      title="Area trend"
    >
      <StatsDateRangeGrainControls
        grain={grain}
        onGrainChange={setGrain}
        onRangeChange={setRange}
        range={range}
      />
      <StatsFilterBar>
        <Button
          onClick={() => setMode("spending")}
          size="sm"
          variant={mode === "spending" ? "default" : "outline"}
        >
          Spending
        </Button>
        <Button
          onClick={() => setMode("receipts")}
          size="sm"
          variant={mode === "receipts" ? "default" : "outline"}
        >
          Receipts
        </Button>
        <Button
          onClick={() => setVisual("soft")}
          size="sm"
          variant={visual === "soft" ? "default" : "outline"}
        >
          Soft fill
        </Button>
        <Button
          onClick={() => setVisual("bold")}
          size="sm"
          variant={visual === "bold" ? "default" : "outline"}
        >
          Bold fill
        </Button>
      </StatsFilterBar>
      <AreaChart
        aspectRatio="16 / 7"
        data={chartData}
        margin={{ top: 14, right: 12, bottom: 30, left: 56 }}
        xDataKey="label"
      >
        <Grid horizontal numTicksRows={3} />
        <Area
          dataKey={mode === "receipts" ? "receipts" : "spending"}
          fadeEdges={visual === "soft"}
          fillOpacity={visual === "bold" ? 0.55 : 0.32}
          showLine
        />
        <YAxis
          formatValue={
            mode === "receipts"
              ? (value) => `${Math.round(value)}`
              : (value) => `$${Math.round(value).toLocaleString("en-US")}`
          }
          numTicks={4}
        />
        <XAxis numTicks={5} />
        <ChartTooltip />
      </AreaChart>
      <div className="grid gap-1 pt-1 sm:grid-cols-2">
        <div className="rounded-md bg-muted/40 px-2 py-1 text-sm">
          <span className="text-muted-foreground">Total:</span>{" "}
          <span className="font-medium tabular-nums">
            {areaSummary.key === "spending"
              ? formatCurrency(areaSummary.total)
              : areaSummary.total}
          </span>
        </div>
        <div className="rounded-md bg-muted/40 px-2 py-1 text-sm">
          <span className="text-muted-foreground">Average:</span>{" "}
          <span className="font-medium tabular-nums">
            {areaSummary.key === "spending"
              ? formatCurrency(Math.round(areaSummary.average))
              : Math.round(areaSummary.average)}
          </span>
        </div>
        <div className="rounded-md bg-muted/40 px-2 py-1 text-sm">
          <span className="text-muted-foreground">Net change:</span>{" "}
          <span className="font-medium tabular-nums">
            {areaSummary.delta >= 0 ? "+" : ""}
            {areaSummary.key === "spending"
              ? formatCurrency(areaSummary.delta)
              : areaSummary.delta}
          </span>
        </div>
        <div className="rounded-md bg-muted/40 px-2 py-1 text-sm">
          <span className="text-muted-foreground">Peak:</span>{" "}
          <span className="font-medium tabular-nums">
            {areaSummary.peak.date
              ? `${areaSummary.peak.label} (${areaSummary.key === "spending" ? formatCurrency(areaSummary.peak.spending) : areaSummary.peak.receipts})`
              : "-"}
          </span>
        </div>
      </div>
    </StatsSectionCard>
  );
}
