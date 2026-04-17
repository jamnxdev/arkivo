"use client";

import { Grid } from "@/components/charts/grid";
import { Line } from "@/components/charts/line";
import { LineChart } from "@/components/charts/line-chart";
import { ChartTooltip } from "@/components/charts/tooltip/chart-tooltip";
import { XAxis } from "@/components/charts/x-axis";
import { Button } from "@/components/ui/button";

const SPENDING_TREND: Record<string, unknown>[] = [
  { date: "2026-04-10", spending: 420 },
  { date: "2026-04-11", spending: 510 },
  { date: "2026-04-12", spending: 468 },
  { date: "2026-04-13", spending: 590 },
  { date: "2026-04-14", spending: 545 },
  { date: "2026-04-15", spending: 620 },
  { date: "2026-04-16", spending: 575 },
] as const;

export function AnalyticsChartSection() {
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
          View more
        </Button>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <LineChart
          aspectRatio="16 / 9"
          data={SPENDING_TREND}
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
