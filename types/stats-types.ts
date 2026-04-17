export type ViewKey = "overview" | "category" | "payment" | "forecast";
export type MetricMode = "amount" | "count";
export type TopCount = "3" | "all";
export type SortMode = "value" | "alphabetical";
export type RingScale = "fixed" | "relative";
export type TrendBarMode = "spending" | "receipts" | "both";
export type TrendOrder = "asc" | "desc";
export type TrendAreaMode = "spending" | "receipts";
export type AreaVisualMode = "soft" | "bold";
export type TopNMode = "3" | "all";
export type BarOrientation = "vertical" | "horizontal";
export type PieHoleSize = "compact" | "wide";
export type RingTopMode = "2" | "4";

/** Preset window relative to the stats reference “today” (TODO: server). */
export type DateRangePreset =
  | "7d"
  | "14d"
  | "30d"
  | "90d"
  | "this_month"
  | "last_month"
  | "ytd";

/** Bucket size after the date range is applied. */
export type TimeGrain = "day" | "week" | "month";
