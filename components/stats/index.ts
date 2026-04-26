/** Presentational blocks and helpers for dashboard (and future desktop) analytics. */
export type * from "../../types/stats-types";
export { AreaSpendingTrendSection } from "./area-spending-trend-section";
export { DenseSpendingTrendSection } from "./dense-spending-trend-section";
export { StatsFilterBar } from "./filter-bar";
export { PieBreakdownSection } from "./pie-breakdown-section";
export { RingProgressSection } from "./ring-progress-section";
export { SegmentBarSection } from "./segment-bar-section";
export { StatsDateRangeGrainControls } from "./stats-date-range-grain-controls";
export {
  formatCurrency,
  formatMonthYear,
  formatShortDate,
} from "./stats-format";
export type {
  BreakdownRow,
  SpendingPoint,
  StatsAnalyticsData,
} from "./stats-mock-data";
export { buildStatsAnalyticsData, STATS_VIEW_KEYS } from "./stats-mock-data";
export { StatsSectionCard } from "./stats-section-card";
export type { ChartSpendingPoint } from "./stats-series";
export {
  buildOrderedTrendChart,
  DATE_RANGE_OPTIONS,
  getDateRangeBounds,
  sliceDailyByRange,
  summarizeDailySlice,
  summarizeTrendChartSeries,
  TIME_GRAIN_OPTIONS,
} from "./stats-series";
