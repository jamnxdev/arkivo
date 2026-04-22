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
      <OverviewCards refreshToken={refreshToken} />
      <ReceiptCaptureSection
        onReceiptSaved={() => setRefreshToken((current) => current + 1)}
      />
      <AnalyticsChartSection refreshToken={refreshToken} />
      <ActionCenterSection refreshToken={refreshToken} />
    </DashboardShell>
  );
}
