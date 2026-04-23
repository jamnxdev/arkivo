"use client";

import { useState } from "react";

import { ActionCenterSection } from "@/components/dashboard/action-center-section";
import { AnalyticsChartSection } from "@/components/dashboard/analytics-chart-section";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { ReceiptCaptureSection } from "@/components/dashboard/receipt-capture-section";

export default function DashboardPage() {
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <DashboardShell>
      <section className="space-y-4 lg:space-y-6">
        <div className="hidden rounded-2xl border bg-card p-6 lg:block">
          <h2 className="text-xl font-semibold tracking-tight">
            Welcome back to your finance dashboard
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track key spending metrics, capture receipts, and review recent
            activity at a glance.
          </p>
        </div>

        <OverviewCards refreshToken={refreshToken} />

        <div className="grid gap-4 lg:grid-cols-12 lg:gap-6">
          <div className="space-y-4 lg:col-span-7">
            <ReceiptCaptureSection
              onReceiptSaved={() => setRefreshToken((current) => current + 1)}
            />
            <AnalyticsChartSection refreshToken={refreshToken} />
          </div>

          <div className="lg:col-span-5">
            <ActionCenterSection refreshToken={refreshToken} />
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
