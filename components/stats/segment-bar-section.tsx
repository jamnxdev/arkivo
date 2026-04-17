"use client";

import { useMemo, useState } from "react";

import { Bar } from "@/components/charts/bar";
import { BarChart } from "@/components/charts/bar-chart";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { BarYAxis } from "@/components/charts/bar-y-axis";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip";
import { YAxis } from "@/components/charts/y-axis";
import { StatsFilterBar } from "@/components/stats/filter-bar";
import { formatCurrency } from "@/components/stats/stats-format";
import {
  BREAKDOWN_BY_VIEW,
  STATS_VIEW_KEYS,
} from "@/components/stats/stats-mock-data";
import { StatsSectionCard } from "@/components/stats/stats-section-card";
import { Button } from "@/components/ui/button";
import type {
  BarOrientation,
  MetricMode,
  SortMode,
  TopNMode,
  ViewKey,
} from "@/types/stats-types";

export function SegmentBarSection() {
  const [view, setView] = useState<ViewKey>("overview");
  const [metric, setMetric] = useState<MetricMode>("amount");
  const [sort, setSort] = useState<SortMode>("value");
  const [topN, setTopN] = useState<TopNMode>("all");
  const [orientation, setOrientation] = useState<BarOrientation>("vertical");

  const rows = BREAKDOWN_BY_VIEW[view];

  const barData = useMemo(
    () =>
      rows.map((item) => ({
        segment: item.segment,
        value: metric === "amount" ? item.amount : item.count,
      })),
    [rows, metric],
  );

  const sortedBarData = useMemo(() => {
    const cloned = [...barData];
    if (sort === "alphabetical") {
      return cloned.sort((a, b) =>
        orientation === "vertical"
          ? a.segment.localeCompare(b.segment)
          : b.segment.localeCompare(a.segment),
      );
    }
    return cloned.sort((a, b) => b.value - a.value);
  }, [barData, sort, orientation]);

  const limitedBarData = useMemo(() => {
    if (topN === "all") {
      return sortedBarData;
    }
    return sortedBarData.slice(0, 3);
  }, [sortedBarData, topN]);

  const barSummary = useMemo(() => {
    const total = sortedBarData.reduce((sum, item) => sum + item.value, 0);
    const top = sortedBarData[0];
    const bottom = sortedBarData[sortedBarData.length - 1];
    const spread = top && bottom ? top.value - bottom.value : 0;
    return { total, top, spread };
  }, [sortedBarData]);

  return (
    <StatsSectionCard
      subtitle="Compare segment mix for each perspective (mock breakdown)."
      title="Segment bar comparison"
    >
      <div className="space-y-2">
        <StatsFilterBar>
          {STATS_VIEW_KEYS.map((key) => (
            <Button
              key={key}
              onClick={() => setView(key)}
              size="sm"
              variant={view === key ? "default" : "outline"}
            >
              {key[0]?.toUpperCase()}
              {key.slice(1)}
            </Button>
          ))}
        </StatsFilterBar>
        <StatsFilterBar>
          <Button
            onClick={() => setMetric("amount")}
            size="sm"
            variant={metric === "amount" ? "default" : "outline"}
          >
            Amount
          </Button>
          <Button
            onClick={() => setMetric("count")}
            size="sm"
            variant={metric === "count" ? "default" : "outline"}
          >
            Count
          </Button>
          <Button
            onClick={() => setTopN("all")}
            size="sm"
            variant={topN === "all" ? "default" : "outline"}
          >
            All segments
          </Button>
          <Button
            onClick={() => setTopN("3")}
            size="sm"
            variant={topN === "3" ? "default" : "outline"}
          >
            Top 3
          </Button>
          <Button
            onClick={() => setOrientation("vertical")}
            size="sm"
            variant={orientation === "vertical" ? "default" : "outline"}
          >
            Vertical
          </Button>
          <Button
            onClick={() => setOrientation("horizontal")}
            size="sm"
            variant={orientation === "horizontal" ? "default" : "outline"}
          >
            Horizontal
          </Button>
          <Button
            onClick={() => setSort("value")}
            size="sm"
            variant={sort === "value" ? "default" : "outline"}
          >
            Sort: Value
          </Button>
          <Button
            onClick={() => setSort("alphabetical")}
            size="sm"
            variant={sort === "alphabetical" ? "default" : "outline"}
          >
            Sort: A–Z
          </Button>
        </StatsFilterBar>
      </div>
      <BarChart
        aspectRatio="16 / 8"
        className="max-h-[340px]"
        data={limitedBarData}
        margin={{
          top: 12,
          right: 12,
          bottom: 36,
          left: orientation === "horizontal" ? 108 : 70,
        }}
        orientation={orientation}
        xDataKey="segment"
      >
        <Grid horizontal />
        <Bar dataKey="value" />
        <YAxis
          formatValue={
            metric === "amount"
              ? (value) => `$${Math.round(value).toLocaleString("en-US")}`
              : (value) => `${Math.round(value)}`
          }
          numTicks={4}
        />
        {orientation === "horizontal" ? (
          <BarYAxis maxLabels={8} showAllLabels />
        ) : (
          <BarXAxis maxLabels={5} />
        )}
        <ChartTooltip />
      </BarChart>
      <div className="grid gap-1 pt-1 sm:grid-cols-3">
        <div className="rounded-md bg-muted/40 px-2 py-1 text-sm">
          <span className="text-muted-foreground">Total:</span>{" "}
          <span className="font-medium tabular-nums">
            {metric === "amount"
              ? formatCurrency(barSummary.total)
              : barSummary.total}
          </span>
        </div>
        <div className="rounded-md bg-muted/40 px-2 py-1 text-sm">
          <span className="text-muted-foreground">Top segment:</span>{" "}
          <span className="font-medium tabular-nums">
            {barSummary.top
              ? `${barSummary.top.segment} (${metric === "amount" ? formatCurrency(barSummary.top.value) : barSummary.top.value})`
              : "-"}
          </span>
        </div>
        <div className="rounded-md bg-muted/40 px-2 py-1 text-sm">
          <span className="text-muted-foreground">Spread:</span>{" "}
          <span className="font-medium tabular-nums">
            {metric === "amount"
              ? formatCurrency(barSummary.spread)
              : barSummary.spread}
          </span>
        </div>
      </div>
    </StatsSectionCard>
  );
}
