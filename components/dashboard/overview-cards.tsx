"use client";

import { useEffect, useMemo, useState } from "react";

interface OverviewCardsProps {
  refreshToken?: number;
}

interface SummaryResponse {
  total_spent: number | string;
  total_receipts: number;
}

interface CategoryPoint {
  category: string;
  total: number;
}

export function OverviewCards({ refreshToken = 0 }: OverviewCardsProps) {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [categories, setCategories] = useState<CategoryPoint[]>([]);

  useEffect(() => {
    fetch("/api/analytics/summary")
      .then((res) => res.json())
      .then((res) => setSummary(res.data));
    fetch("/api/analytics/categories")
      .then((res) => res.json())
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : []));
  }, [refreshToken]);

  const totalSpent = Number(summary?.total_spent ?? 0);
  const totalReceipts = summary?.total_receipts ?? 0;
  const averageReceipt = totalReceipts > 0 ? totalSpent / totalReceipts : 0;

  const topCategory = useMemo(() => {
    if (categories.length === 0 || totalSpent <= 0) {
      return { name: "No data", share: 0 };
    }

    const sorted = [...categories].sort((a, b) => b.total - a.total);
    const top = sorted[0];

    return {
      name: top.category,
      share: (top.total / totalSpent) * 100,
    };
  }, [categories, totalSpent]);

  const OVERVIEW_METRICS = [
    {
      label: "Total Spending",
      value: `€${totalSpent.toFixed(2)}`,
      helper: "All receipts",
    },
    {
      label: "Receipts",
      value: `${totalReceipts}`,
      helper: "Saved receipts",
    },
    {
      label: "Average Receipt",
      value: `€${averageReceipt.toFixed(2)}`,
      helper: "Per receipt",
    },
    {
      label: "Top Category",
      value: topCategory.name,
      helper: `${topCategory.share.toFixed(0)}% of spend`,
    },
  ] as const;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Overview</h2>
      <div className="grid grid-cols-2 gap-3">
        {OVERVIEW_METRICS.map((metric) => (
          <article key={metric.label} className="rounded-xl border bg-card p-4">
            <p className="text-xs text-muted-foreground">{metric.label}</p>
            <p className="mt-2 text-xl font-semibold tracking-tight">
              {metric.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {metric.helper}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
