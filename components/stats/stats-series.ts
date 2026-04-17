import {
  formatMonthYear,
  formatShortDate,
} from "@/components/stats/stats-format";
import type { SpendingPoint } from "@/components/stats/stats-mock-data";
import type {
  DateRangePreset,
  TimeGrain,
  TrendAreaMode,
  TrendOrder,
} from "@/types/stats-types";

export type ChartSpendingPoint = SpendingPoint & { label: string };

function parseLocalNoon(isoDay: string): number {
  return new Date(`${isoDay}T12:00:00`).getTime();
}

const MS_DAY = 86_400_000;

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1, 12, 0, 0, 0);
}

function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

function formatIsoDay(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Inclusive date window [start, end] as ISO day strings.
 * TODO: Align calendar rules with user timezone when real analytics ship.
 */
export function getDateRangeBounds(
  preset: DateRangePreset,
  todayIso: string,
): { start: string; end: string } {
  const today = new Date(`${todayIso}T12:00:00`);
  const end = formatIsoDay(today);

  if (preset === "this_month") {
    const s = startOfMonth(today);
    return { start: formatIsoDay(s), end };
  }

  if (preset === "last_month") {
    const thisM = startOfMonth(today);
    const lastMStart = addMonths(thisM, -1);
    const lastMEnd = new Date(thisM);
    lastMEnd.setDate(0);
    return {
      start: formatIsoDay(lastMStart),
      end: formatIsoDay(lastMEnd),
    };
  }

  if (preset === "ytd") {
    const s = new Date(today.getFullYear(), 0, 1, 12, 0, 0, 0);
    return { start: formatIsoDay(s), end };
  }

  const endT = parseLocalNoon(todayIso);
  let daysBack = 30;
  if (preset === "7d") {
    daysBack = 6;
  } else if (preset === "14d") {
    daysBack = 13;
  } else if (preset === "30d") {
    daysBack = 29;
  } else if (preset === "90d") {
    daysBack = 89;
  }
  const startT = endT - daysBack * MS_DAY;
  return { start: formatIsoDay(new Date(startT)), end };
}

export function sliceDailyByRange(
  daily: SpendingPoint[],
  preset: DateRangePreset,
  todayIso: string,
): SpendingPoint[] {
  const { start, end } = getDateRangeBounds(preset, todayIso);
  return daily.filter((row) => row.date >= start && row.date <= end);
}

function mondayOfWeek(isoDay: string): string {
  const d = new Date(`${isoDay}T12:00:00`);
  const dow = d.getDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  d.setDate(d.getDate() + offset);
  return formatIsoDay(d);
}

function monthKey(isoDay: string): string {
  return isoDay.slice(0, 7);
}

export function aggregateSpendingSeries(
  rows: SpendingPoint[],
  grain: TimeGrain,
): ChartSpendingPoint[] {
  if (grain === "day") {
    return rows.map((row) => ({
      ...row,
      label: formatShortDate(row.date),
    }));
  }

  if (grain === "week") {
    const map = new Map<
      string,
      { spending: number; receipts: number; sortKey: string }
    >();
    for (const row of rows) {
      const key = mondayOfWeek(row.date);
      const cur = map.get(key);
      if (cur) {
        cur.spending += row.spending;
        cur.receipts += row.receipts;
      } else {
        map.set(key, {
          spending: row.spending,
          receipts: row.receipts,
          sortKey: key,
        });
      }
    }
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([weekStart, val]) => ({
        date: weekStart,
        spending: val.spending,
        receipts: val.receipts,
        label: `Week ${formatShortDate(weekStart)}`,
      }));
  }

  const map = new Map<
    string,
    { spending: number; receipts: number; monthStart: string }
  >();
  for (const row of rows) {
    const mk = monthKey(row.date);
    const monthStart = `${mk}-01`;
    const cur = map.get(mk);
    if (cur) {
      cur.spending += row.spending;
      cur.receipts += row.receipts;
    } else {
      map.set(mk, {
        spending: row.spending,
        receipts: row.receipts,
        monthStart,
      });
    }
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([, val]) => ({
      date: val.monthStart,
      spending: val.spending,
      receipts: val.receipts,
      label: formatMonthYear(val.monthStart),
    }));
}

export const DATE_RANGE_OPTIONS: Array<{
  id: DateRangePreset;
  label: string;
}> = [
  { id: "7d", label: "7 days" },
  { id: "14d", label: "14 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "this_month", label: "This month" },
  { id: "last_month", label: "Last month" },
  { id: "ytd", label: "Year to date" },
];

export const TIME_GRAIN_OPTIONS: Array<{ id: TimeGrain; label: string }> = [
  { id: "day", label: "By day" },
  { id: "week", label: "By week" },
  { id: "month", label: "By month" },
];

export function buildOrderedTrendChart(
  daily: SpendingPoint[],
  preset: DateRangePreset,
  grain: TimeGrain,
  order: TrendOrder,
  todayIso: string,
): ChartSpendingPoint[] {
  const sliced = sliceDailyByRange(daily, preset, todayIso);
  const agg = aggregateSpendingSeries(sliced, grain);
  return [...agg].sort((a, b) =>
    order === "asc"
      ? a.date.localeCompare(b.date)
      : b.date.localeCompare(a.date),
  );
}

export function summarizeTrendChartSeries(
  points: ChartSpendingPoint[],
  mode: TrendAreaMode,
): {
  key: "spending" | "receipts";
  total: number;
  average: number;
  delta: number;
  peak: ChartSpendingPoint;
} {
  const key = mode === "receipts" ? "receipts" : "spending";
  if (points.length === 0) {
    return {
      key,
      total: 0,
      average: 0,
      delta: 0,
      peak: {
        date: "",
        spending: 0,
        receipts: 0,
        label: "",
      },
    };
  }
  const chronological = [...points].sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  const values = chronological.map((row) => row[key]);
  const total = values.reduce((sum, v) => sum + v, 0);
  const average = total / values.length;
  const first = values[0] ?? 0;
  const last = values[values.length - 1] ?? 0;
  const delta = last - first;
  const peak = chronological.reduce(
    (best, item) => (item[key] > best[key] ? item : best),
    chronological[0],
  );
  return { key, total, average, delta, peak };
}

export function summarizeDailySlice(daily: SpendingPoint[]): {
  totalSpending: number;
  totalReceipts: number;
  avgSpending: number;
  peakDay: SpendingPoint | null;
} {
  if (daily.length === 0) {
    return {
      totalSpending: 0,
      totalReceipts: 0,
      avgSpending: 0,
      peakDay: null,
    };
  }
  const totalSpending = daily.reduce((s, r) => s + r.spending, 0);
  const totalReceipts = daily.reduce((s, r) => s + r.receipts, 0);
  const peakDay = daily.reduce(
    (best, item) => (item.spending > best.spending ? item : best),
    daily[0],
  );
  return {
    totalSpending,
    totalReceipts,
    avgSpending: totalSpending / daily.length,
    peakDay,
  };
}
