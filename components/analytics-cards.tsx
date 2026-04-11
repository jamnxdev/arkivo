"use client";

import { useEffect, useState } from "react";

interface AnalyticsCardsProps {
  refreshToken?: number;
}

interface AnalyticsSummary {
  total_spent: number | string;
  total_receipts: number;
}

export function AnalyticsCards({ refreshToken = 0 }: AnalyticsCardsProps) {
  const [data, setData] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    fetch("/api/analytics/summary")
      .then((res) => res.json())
      .then((res) => setData(res.data));
  }, [refreshToken]);

  if (!data) return null;

  return (
    <div className={"grid grid-cols-2 gap-4"}>
      <div className={"rounded border p-4"}>
        <p>Total Spent</p>
        <h2>{data.total_spent}</h2>
      </div>
      <div className={"rounded border p-4"}>
        <p>Receipts</p>
        <h2>{data.total_receipts}</h2>
      </div>
    </div>
  );
}
