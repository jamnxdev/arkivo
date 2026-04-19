import type { ViewKey } from "@/types/stats-types";

export const STATS_VIEW_KEYS: ViewKey[] = [
  "overview",
  "category",
  "payment",
  "forecast",
];

export type SpendingPoint = {
  date: string;
  spending: number;
  receipts: number;
};

export type BreakdownRow = {
  segment: string;
  amount: number;
  count: number;
};

export type StatsAnalyticsData = {
  dailySpending: SpendingPoint[];
  todayIso: string;
  breakdownByView: Record<ViewKey, BreakdownRow[]>;
};

type ReceiptRecord = {
  total?: number | string | null;
  date?: string | Date | null;
  createdAt?: string | Date | null;
  category?: string | null;
  metadata?: Record<string, unknown> | null;
};

function toIsoDay(value: string | Date): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toISOString().slice(0, 10);
}

function buildCategoryBreakdown(receipts: ReceiptRecord[]): BreakdownRow[] {
  const map = new Map<string, BreakdownRow>();

  for (const receipt of receipts) {
    const segment = receipt.category?.trim() || "Uncategorized";
    const amount = Number(receipt.total ?? 0) || 0;
    const current = map.get(segment);

    if (current) {
      current.amount += amount;
      current.count += 1;
      continue;
    }

    map.set(segment, { segment, amount, count: 1 });
  }

  return [...map.values()].sort((a, b) => b.amount - a.amount);
}

function buildPaymentBreakdown(receipts: ReceiptRecord[]): BreakdownRow[] {
  const map = new Map<string, BreakdownRow>();

  for (const receipt of receipts) {
    const metadata = receipt.metadata ?? {};
    const paymentMethodRaw = metadata.payment_method ?? metadata.paymentMethod;
    const segment =
      typeof paymentMethodRaw === "string" && paymentMethodRaw.trim()
        ? paymentMethodRaw
        : "Unknown";
    const amount = Number(receipt.total ?? 0) || 0;
    const current = map.get(segment);

    if (current) {
      current.amount += amount;
      current.count += 1;
      continue;
    }

    map.set(segment, { segment, amount, count: 1 });
  }

  return [...map.values()].sort((a, b) => b.amount - a.amount);
}

export function buildStatsAnalyticsData(
  receipts: ReceiptRecord[],
): StatsAnalyticsData {
  const dailyMap = new Map<string, SpendingPoint>();
  let todayIso = new Date().toISOString().slice(0, 10);

  for (const receipt of receipts) {
    const day = receipt.date
      ? toIsoDay(receipt.date)
      : receipt.createdAt
        ? toIsoDay(receipt.createdAt)
        : null;
    if (!day) {
      continue;
    }

    if (day > todayIso) {
      todayIso = day;
    }

    const current = dailyMap.get(day);
    const amount = Number(receipt.total ?? 0) || 0;
    if (current) {
      current.spending += amount;
      current.receipts += 1;
    } else {
      dailyMap.set(day, { date: day, spending: amount, receipts: 1 });
    }
  }

  const dailySpending = [...dailyMap.values()].sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  const categoryBreakdown = buildCategoryBreakdown(receipts);
  const paymentBreakdown = buildPaymentBreakdown(receipts);

  // TODO: Replace fallback perspective mapping with dedicated dimensions once
  // receipts persist richer analytics dimensions for overview/forecast.
  return {
    dailySpending,
    todayIso,
    breakdownByView: {
      overview: categoryBreakdown,
      category: categoryBreakdown,
      payment: paymentBreakdown,
      forecast: categoryBreakdown,
    },
  };
}
