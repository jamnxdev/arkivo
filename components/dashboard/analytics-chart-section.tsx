"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Grid } from "@/components/charts/grid";
import { Line } from "@/components/charts/line";
import { LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { Button } from "@/components/ui/button";

interface AnalyticsChartSectionProps {
  refreshToken?: number;
}

interface TimeSeriesPoint {
  date: string | null;
  total: number;
}

export function AnalyticsChartSection({
  refreshToken = 0,
}: AnalyticsChartSectionProps) {
  const [points, setPoints] = useState<TimeSeriesPoint[]>([]);

  useEffect(() => {
    fetch("/api/analytics/timeseries")
      .then((res) => res.json())
      .then((res) => setPoints(Array.isArray(res.data) ? res.data : []));
  }, [refreshToken]);

  const chartData = useMemo(
    () =>
      points
        .map((point) => {
          const parsedDate = point.date ? new Date(point.date) : null;
          const timestamp = parsedDate?.getTime() ?? Number.NaN;

          return {
            // Keep Date for chart scale/tooltip to avoid reparsing localized labels.
            date: parsedDate,
            spending: Number(point.total) || 0,
            rawDate: timestamp,
          };
        })
        .filter(
          (point): point is { date: Date; spending: number; rawDate: number } =>
            point.date instanceof Date && !Number.isNaN(point.rawDate),
        )
        .sort((a, b) => a.rawDate - b.rawDate),
    [points],
  );

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Analytics</h2>
          <p className="text-xs text-muted-foreground">
            Daily spending trend for the past 7 days
          </p>
        </div>
        <Button size="sm" variant="outline">
          <Link href="/dashboard/stats">View more</Link>
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <LineChart
          aspectRatio="16 / 9"
          data={chartData}
          margin={{ top: 20, right: 8, bottom: 36, left: 8 }}
        >
          <Grid horizontal numTicksRows={4} />
          <Line dataKey="spending" />
          <ChartTooltip />
          <XAxis numTicks={4} />
        </LineChart>
      </div>
    </section>
  );
}
