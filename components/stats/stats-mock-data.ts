import type { ViewKey } from "@/types/stats-types";

export const STATS_VIEW_KEYS: ViewKey[] = [
  "overview",
  "category",
  "payment",
  "forecast",
];

// TODO: Replace with analytics API (daily points + breakdowns).

export type SpendingPoint = {
  date: string;
  spending: number;
  receipts: number;
};

/** Fixed “today” for deterministic mock slicing until real data exists. */
export const STATS_REFERENCE_TODAY = "2026-04-17";

export const BREAKDOWN_BY_VIEW: Record<
  ViewKey,
  Array<{ segment: string; amount: number; count: number }>
> = {
  overview: [
    { segment: "Food", amount: 1280, count: 33 },
    { segment: "Transport", amount: 640, count: 21 },
    { segment: "Shopping", amount: 1140, count: 17 },
    { segment: "Bills", amount: 860, count: 9 },
    { segment: "Health", amount: 430, count: 7 },
  ],
  category: [
    { segment: "Groceries", amount: 970, count: 26 },
    { segment: "Dining", amount: 670, count: 19 },
    { segment: "Entertainment", amount: 530, count: 11 },
    { segment: "Subscriptions", amount: 310, count: 8 },
    { segment: "Utilities", amount: 780, count: 9 },
  ],
  payment: [
    { segment: "UPI", amount: 1320, count: 38 },
    { segment: "Credit Card", amount: 1560, count: 19 },
    { segment: "Debit Card", amount: 690, count: 13 },
    { segment: "Cash", amount: 420, count: 10 },
    { segment: "Wallet", amount: 360, count: 7 },
  ],
  forecast: [
    { segment: "Essentials", amount: 1420, count: 35 },
    { segment: "Lifestyle", amount: 980, count: 18 },
    { segment: "Travel", amount: 760, count: 8 },
    { segment: "Health", amount: 510, count: 7 },
    { segment: "Education", amount: 390, count: 5 },
  ],
};

const MS_DAY = 86_400_000;

function parseLocalNoon(isoDay: string): number {
  return new Date(`${isoDay}T12:00:00`).getTime();
}

function formatIsoDay(t: number): string {
  return new Date(t).toISOString().slice(0, 10);
}

function buildMockDaily(): SpendingPoint[] {
  const end = parseLocalNoon(STATS_REFERENCE_TODAY);
  const out: SpendingPoint[] = [];
  for (let i = 0; i < 220; i++) {
    const t = end - i * MS_DAY;
    const date = formatIsoDay(t);
    out.push({
      date,
      spending: Math.round(
        480 + Math.sin(i * 0.11) * 140 + (i % 11) * 18 + (i % 7) * 22
      ),
      receipts: 10 + (i % 13) + Math.floor((i % 44) / 11),
    });
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

export const MOCK_DAILY_SPENDING: SpendingPoint[] = buildMockDaily();
