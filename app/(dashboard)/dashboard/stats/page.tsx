"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import {
  AreaSpendingTrendSection,
  DenseSpendingTrendSection,
  PieBreakdownSection,
  RingProgressSection,
  SegmentBarSection,
  StatsPageHeader,
} from "@/components/stats";

export default function DashboardStatsPage() {
  return (
    <DashboardShell>
      <section className="space-y-4">
        <StatsPageHeader />
        <div className="grid gap-4">
          <DenseSpendingTrendSection />
          <AreaSpendingTrendSection />
          <SegmentBarSection />
          <PieBreakdownSection />
          <RingProgressSection />
        </div>
      </section>
    </DashboardShell>
  );
}
