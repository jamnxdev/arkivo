"use client";

import { ActionCenterSection } from "@/components/dashboard/action-center-section";
import { AnalyticsChartSection } from "@/components/dashboard/analytics-chart-section";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { ReceiptCaptureSection } from "@/components/dashboard/receipt-capture-section";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <OverviewCards />
      <ReceiptCaptureSection />
      <AnalyticsChartSection />
      <ActionCenterSection />
    </DashboardShell>
  );
}
