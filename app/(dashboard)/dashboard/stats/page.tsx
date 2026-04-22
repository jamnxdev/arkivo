"use client";

import { useEffect, useState } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { buildStatsAnalyticsData } from "@/components/stats/stats-mock-data";
import {
  AreaSpendingTrendSection,
  DenseSpendingTrendSection,
  PieBreakdownSection,
  RingProgressSection,
  SegmentBarSection,
  StatsPageHeader,
} from "@/components/stats";

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
      <section className="space-y-4">
        <StatsPageHeader />
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <div className="grid gap-4">
          <DenseSpendingTrendSection
            dailySpending={data.dailySpending}
            todayIso={data.todayIso}
          />
          <AreaSpendingTrendSection
            dailySpending={data.dailySpending}
            todayIso={data.todayIso}
          />
          <SegmentBarSection breakdownByView={data.breakdownByView} />
          <PieBreakdownSection breakdownByView={data.breakdownByView} />
          <RingProgressSection breakdownByView={data.breakdownByView} />
        </div>
      </section>
    </DashboardShell>
  );
}
