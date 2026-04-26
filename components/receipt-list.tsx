"use client";

import { useEffect, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

interface ReceiptListProps {
  refreshToken?: number;
}

interface ReceiptListItem {
  id: string;
  merchant: string | null;
  total: string | number | null;
  date: string | null;
}

function formatAmount(value: string | number | null) {
  if (value === null) {
    return "-";
  }

  const numeric = Number(value);

  if (Number.isNaN(numeric)) {
    return "-";
  }

  return numeric.toFixed(2);
}

export function ReceiptList({ refreshToken = 0 }: ReceiptListProps) {
  const [data, setData] = useState<ReceiptListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/receipts")
      .then((res) => res.json())
      .then((res) => setData(Array.isArray(res.data) ? res.data : []))
      .finally(() => setIsLoading(false));
  }, [refreshToken]);

  return (
    <div className="space-y-2">
      {isLoading
        ? Array.from({ length: 3 }).map((_, index) => (
            <div key={`receipt-list-skeleton-${index}`} className="rounded border p-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="mt-2 h-4 w-20" />
              <Skeleton className="mt-2 h-4 w-28" />
            </div>
          ))
        : data.map((r) => (
            <div key={r.id} className="rounded border p-3">
              <p>{r.merchant}</p>
              <p>{formatAmount(r.total)} €</p>
              <p>{r.date}</p>
            </div>
          ))}
    </div>
  );
}
