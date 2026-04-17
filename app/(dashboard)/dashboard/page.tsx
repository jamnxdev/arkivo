"use client";

import { ActionCenterSection } from "@/components/dashboard/action-center-section";
import { AnalyticsChartSection } from "@/components/dashboard/analytics-chart-section";
import { DashboardPreviewFrame } from "@/components/dashboard/dashboard-preview-frame";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { ReceiptCaptureSection } from "@/components/dashboard/receipt-capture-section";
import { useMediaQuery } from "@/hooks/use-media-query";
import { env } from "@/lib/env";

export default function DashboardPage() {
  let isTabletViewport = useMediaQuery("(max-width: 1023px)");
  const previewWidthClass = isTabletViewport ? "w-full" : "max-w-2xl";

  isTabletViewport = env.DEV;

  return (
    <div className="min-h-screen">
      {isTabletViewport ? (
        <>
          <DashboardPreviewFrame
            isMobile={isTabletViewport}
            previewWidthClass={previewWidthClass}
          >
            <OverviewCards />
            <ReceiptCaptureSection />
            <AnalyticsChartSection />
            <ActionCenterSection />
          </DashboardPreviewFrame>
          <MobileBottomNav previewWidthClass={previewWidthClass} />
        </>
      ) : null}
    </div>
  );
}
