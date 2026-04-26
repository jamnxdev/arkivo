"use client";

import { useEffect, useState } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  AreaSpendingTrendSection,
  DenseSpendingTrendSection,
  PieBreakdownSection,
  RingProgressSection,
  SegmentBarSection,
} from "@/components/stats";
import { buildStatsAnalyticsData } from "@/components/stats/stats-mock-data";

type ReceiptApiItem = {
  total?: number | string | null;
  date?: string | Date | null;
  createdAt?: string | Date | null;
  category?: string | null;
  metadata?: Record<string, unknown> | null;
};

export default function DashboardStatsPage() {
  const [data, setData] = useState(() => buildStatsAnalyticsData([]));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/receipts")
      .then((res) => res.json())
      .then((payload) => {
        if (!payload.success) {
          throw new Error(payload.error || "Failed to load stats data");
        }
        setData(
          buildStatsAnalyticsData(
            Array.isArray(payload.data)
              ? (payload.data as ReceiptApiItem[])
              : [],
          ),
        );
        setError(null);
      })
      .catch((fetchError: unknown) => {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load stats data",
        );
      });
  }, []);

  return (
    <DashboardShell>
      <section className="space-y-4 lg:space-y-6">
        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="rounded-2xl border bg-card p-5 lg:hidden">
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Insights
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Desktop view prioritizes trend charts and category distribution side
            by side for faster analysis.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
          <div className="space-y-4 lg:col-span-8">
            <DenseSpendingTrendSection
              dailySpending={data.dailySpending}
              todayIso={data.todayIso}
            />
            <AreaSpendingTrendSection
              dailySpending={data.dailySpending}
              todayIso={data.todayIso}
            />
            <SegmentBarSection breakdownByView={data.breakdownByView} />
          </div>

          <div className="space-y-4 lg:col-span-4">
            <PieBreakdownSection breakdownByView={data.breakdownByView} />
            <RingProgressSection breakdownByView={data.breakdownByView} />
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
