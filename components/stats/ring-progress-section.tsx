"use client";

import { useMemo, useState } from "react";

import { Ring } from "@/components/charts/ring";
import { RingCenter } from "@/components/charts/ring-center";
import { RingChart } from "@/components/charts/ring-chart";
import { StatsFilterBar } from "@/components/stats/filter-bar";
import { formatCurrency } from "@/components/stats/stats-format";
import {
  BREAKDOWN_BY_VIEW,
  STATS_VIEW_KEYS,
} from "@/components/stats/stats-mock-data";
import { StatsSectionCard } from "@/components/stats/stats-section-card";
import type {
  MetricMode,
  RingScale,
  RingTopMode,
  ViewKey,
} from "@/types/stats-types";
import { Button } from "@/components/ui/button";

export function RingProgressSection() {
  const [view, setView] = useState<ViewKey>("payment");
  const [metric, setMetric] = useState<MetricMode>("amount");
  const [scale, setScale] = useState<RingScale>("relative");
  const [top, setTop] = useState<RingTopMode>("4");

  const rows = BREAKDOWN_BY_VIEW[view];

  const ringData = useMemo(
    () =>
      rows.slice(0, top === "2" ? 2 : 4).map((item) => ({
        label: item.segment,
        value: metric === "amount" ? item.amount : item.count,
      })),
    [rows, metric, top],
  );

  const ringDataWithScale = useMemo(() => {
    if (scale === "fixed") {
      const maxValue = metric === "amount" ? 1600 : 45;
      return ringData.map((item) => ({ ...item, maxValue }));
    }
    const maxObserved = Math.max(...ringData.map((item) => item.value), 1);
    const relativeMax = Math.ceil(maxObserved * 1.2);
    return ringData.map((item) => ({ ...item, maxValue: relativeMax }));
  }, [ringData, metric, scale]);

  return (
    <StatsSectionCard
      subtitle="Progress rings for the largest segments in the mock slice."
      title="Ring progress"
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
          onClick={() => setScale("fixed")}
          size="sm"
          variant={scale === "fixed" ? "default" : "outline"}
        >
          Fixed scale
        </Button>
        <Button
          onClick={() => setScale("relative")}
          size="sm"
          variant={scale === "relative" ? "default" : "outline"}
        >
          Relative scale
        </Button>
        <Button
          onClick={() => setTop("2")}
          size="sm"
          variant={top === "2" ? "default" : "outline"}
        >
          Top 2
        </Button>
        <Button
          onClick={() => setTop("4")}
          size="sm"
          variant={top === "4" ? "default" : "outline"}
        >
          Top 4
        </Button>
      </StatsFilterBar>
      <div className="mx-auto max-w-[280px]">
        <RingChart data={ringDataWithScale}>
          {ringDataWithScale.map((item, index) => (
            <Ring index={index} key={item.label} />
          ))}
          <RingCenter
            defaultLabel="Segment total"
            formatOptions={{
              notation: metric === "amount" ? "compact" : "standard",
              maximumFractionDigits: 0,
            }}
            prefix={metric === "amount" ? "$" : undefined}
          />
        </RingChart>
      </div>
      <div className="grid gap-1 pt-1">
        {ringDataWithScale.map((item) => {
          const progress = item.maxValue
            ? (item.value / item.maxValue) * 100
            : 0;
          return (
            <div
              className="flex items-center justify-between rounded-md bg-muted/40 px-2 py-1"
              key={item.label}
            >
              <span className="text-sm">{item.label}</span>
              <span className="text-sm font-medium tabular-nums">
                {metric === "amount" ? formatCurrency(item.value) : item.value}{" "}
                <span className="text-muted-foreground">
                  ({progress.toFixed(0)}%)
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </StatsSectionCard>
  );
}
