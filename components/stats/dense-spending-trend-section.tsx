"use client";

import { useMemo, useState } from "react";

import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip";
import { YAxis } from "@/components/charts/y-axis";
import { StatsFilterBar } from "@/components/stats/filter-bar";
import { StatsDateRangeGrainControls } from "@/components/stats/stats-date-range-grain-controls";
import {
  formatCurrency,
  formatShortDate,
} from "@/components/stats/stats-format";
import {
  MOCK_DAILY_SPENDING,
  STATS_REFERENCE_TODAY,
} from "@/components/stats/stats-mock-data";
import { StatsSectionCard } from "@/components/stats/stats-section-card";
import {
  buildOrderedTrendChart,
  sliceDailyByRange,
  summarizeDailySlice,
} from "@/components/stats/stats-series";
import type {
  DateRangePreset,
  TimeGrain,
  TrendBarMode,
  TrendOrder,
} from "@/types/stats-types";
import { Button } from "@/components/ui/button";

export function DenseSpendingTrendSection() {
  const [range, setRange] = useState<DateRangePreset>("30d");
  const [grain, setGrain] = useState<TimeGrain>("day");
  const [barMode, setBarMode] = useState<TrendBarMode>("both");
  const [order, setOrder] = useState<TrendOrder>("asc");

  const dailyInRange = useMemo(
    () => sliceDailyByRange(MOCK_DAILY_SPENDING, range, STATS_REFERENCE_TODAY),
    [range],
  );

  const chartData = useMemo(
    () =>
      buildOrderedTrendChart(
        MOCK_DAILY_SPENDING,
        range,
        grain,
        order,
        STATS_REFERENCE_TODAY,
      ),
    [range, grain, order],
  );

  const summary = useMemo(
    () => summarizeDailySlice(dailyInRange),
    [dailyInRange],
  );

  return (
    <StatsSectionCard
      subtitle="Spending and receipts across the selected window, grouped by day, week, or month."
      title="Spending bar trend"
    >
      <StatsDateRangeGrainControls
        grain={grain}
        onGrainChange={setGrain}
        onRangeChange={setRange}
        range={range}
      />
      <StatsFilterBar>
        <Button
          onClick={() => setBarMode("spending")}
          size="sm"
          variant={barMode === "spending" ? "default" : "outline"}
        >
          Spending
        </Button>
        <Button
          onClick={() => setBarMode("receipts")}
          size="sm"
          variant={barMode === "receipts" ? "default" : "outline"}
        >
          Receipts
        </Button>
        <Button
          onClick={() => setBarMode("both")}
          size="sm"
          variant={barMode === "both" ? "default" : "outline"}
        >
          Both
        </Button>
        <Button
          onClick={() => setOrder("asc")}
          size="sm"
          variant={order === "asc" ? "default" : "outline"}
        >
          Oldest first
        </Button>
        <Button
          onClick={() => setOrder("desc")}
          size="sm"
          variant={order === "desc" ? "default" : "outline"}
        >
          Newest first
        </Button>
      </StatsFilterBar>
      <BarChart
        aspectRatio="4 / 3"
        barGap={0.08}
        data={chartData}
        margin={{ top: 20, right: 12, bottom: 36, left: 56 }}
        xDataKey="label"
      >
        <Grid horizontal numTicksRows={4} />
        {(barMode === "spending" || barMode === "both") && (
          <Bar dataKey="spending" />
        )}
        {(barMode === "receipts" || barMode === "both") && (
          <Bar dataKey="receipts" fill="var(--chart-line-secondary)" />
        )}
        <YAxis
          formatValue={
            barMode === "receipts"
              ? (value) => `${value} items`
              : formatCurrency
          }
          numTicks={4}
        />
        <BarXAxis maxLabels={grain === "month" ? 6 : 10} />
        <ChartTooltip />
      </BarChart>
      <div className="grid gap-1 pt-1 sm:grid-cols-2">
        <div className="rounded-md bg-muted/40 px-2 py-1 text-sm">
          <span className="text-muted-foreground">Total spending:</span>{" "}
          <span className="font-medium tabular-nums">
            {formatCurrency(summary.totalSpending)}
          </span>
        </div>
        <div className="rounded-md bg-muted/40 px-2 py-1 text-sm">
          <span className="text-muted-foreground">Total receipts:</span>{" "}
          <span className="font-medium tabular-nums">
            {summary.totalReceipts}
          </span>
        </div>
        <div className="rounded-md bg-muted/40 px-2 py-1 text-sm">
          <span className="text-muted-foreground">Avg / day in range:</span>{" "}
          <span className="font-medium tabular-nums">
            {formatCurrency(Math.round(summary.avgSpending))}
          </span>
        </div>
        <div className="rounded-md bg-muted/40 px-2 py-1 text-sm">
          <span className="text-muted-foreground">Peak day:</span>{" "}
          <span className="font-medium tabular-nums">
            {summary.peakDay
              ? `${formatShortDate(summary.peakDay.date)} (${formatCurrency(summary.peakDay.spending)})`
              : "-"}
          </span>
        </div>
      </div>
    </StatsSectionCard>
  );
}
