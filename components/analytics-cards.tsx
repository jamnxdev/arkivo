"use client";

import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsCardsProps {
  refreshToken?: number;
}

interface AnalyticsSummary {
  total_spent: number | string;
  total_receipts: number;
}

export function AnalyticsCards({ refreshToken = 0 }: AnalyticsCardsProps) {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch("/api/analytics/summary")
      .then((res) => res.json())
      .then((res) => setData(res.data))
      .finally(() => setIsLoading(false));
  }, [refreshToken]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={`analytics-card-skeleton-${index}`} className="rounded border p-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-2 h-7 w-24" />
          </div>
        ))}
      </div>
    );
  }

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
