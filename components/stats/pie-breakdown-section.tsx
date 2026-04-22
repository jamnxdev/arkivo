"use client";

import { useMemo, useState } from "react";

import { PieCenter } from "@/components/charts/pie-center";
import { PieChart } from "@/components/charts/pie-chart";
import { PieSlice } from "@/components/charts/pie-slice";
import { StatsFilterBar } from "@/components/stats/filter-bar";
import { formatCurrency } from "@/components/stats/stats-format";
import {
  type BreakdownRow,
  STATS_VIEW_KEYS,
} from "@/components/stats/stats-mock-data";
import { StatsSectionCard } from "@/components/stats/stats-section-card";
import { Button } from "@/components/ui/button";
import type {
  MetricMode,
  PieHoleSize,
  TopCount,
  ViewKey,
} from "@/types/stats-types";

interface PieBreakdownSectionProps {
  breakdownByView: Record<ViewKey, BreakdownRow[]>;
}

export function PieBreakdownSection({
  breakdownByView,
}: PieBreakdownSectionProps) {
  const [view, setView] = useState<ViewKey>("category");
  const [metric, setMetric] = useState<MetricMode>("amount");
  const [top, setTop] = useState<TopCount>("all");
  const [holeSize, setHoleSize] = useState<PieHoleSize>("compact");

  const rows = breakdownByView[view] ?? [];

  const pieData = useMemo(() => {
    const mapped = rows
      .map((item) => ({
        label: item.segment,
        value: metric === "amount" ? item.amount : item.count,
      }))
      .sort((a, b) => b.value - a.value);
    return top === "3" ? mapped.slice(0, 3) : mapped;
  }, [rows, metric, top]);

  const totalPieValue = useMemo(
    () => pieData.reduce((sum, item) => sum + item.value, 0),
    [pieData],
  );

  return (
    <StatsSectionCard
      subtitle="Share of totals for the selected perspective."
      title="Pie breakdown"
    >
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
          onClick={() => setTop("all")}
          size="sm"
          variant={top === "all" ? "default" : "outline"}
        >
          All segments
        </Button>
        <Button
          onClick={() => setTop("3")}
          size="sm"
          variant={top === "3" ? "default" : "outline"}
        >
          Top 3
        </Button>
        <Button
          onClick={() => setHoleSize("compact")}
          size="sm"
          variant={holeSize === "compact" ? "default" : "outline"}
        >
          Hole: Compact
        </Button>
        <Button
          onClick={() => setHoleSize("wide")}
          size="sm"
          variant={holeSize === "wide" ? "default" : "outline"}
        >
          Hole: Wide
        </Button>
      </StatsFilterBar>
      <div className="mx-auto max-w-[280px]">
        <PieChart data={pieData} innerRadius={holeSize === "wide" ? 72 : 58}>
          {pieData.map((item, index) => (
            <PieSlice index={index} key={item.label} />
          ))}
          <PieCenter
            defaultLabel="Total"
            formatOptions={{
              notation: metric === "amount" ? "compact" : "standard",
              maximumFractionDigits: 0,
            }}
            prefix={metric === "amount" ? "$" : undefined}
          />
        </PieChart>
      </div>
      <div className="grid gap-1 pt-1">
        {pieData.map((item) => {
          const percentage =
            totalPieValue > 0 ? (item.value / totalPieValue) * 100 : 0;
          return (
            <div
              className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1"
              key={item.label}
            >
              <span className="text-sm">{item.label}</span>
              <span className="text-sm font-medium tabular-nums">
                {metric === "amount" ? formatCurrency(item.value) : item.value}{" "}
                <span className="text-muted-foreground">
                  ({percentage.toFixed(1)}%)
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </StatsSectionCard>
  );
}
