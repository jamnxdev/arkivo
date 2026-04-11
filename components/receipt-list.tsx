"use client";

import { useEffect, useState } from "react";

interface ReceiptListProps {
  refreshToken?: number;
}

interface ReceiptListItem {
  id: string;
  merchant: string | null;
  total: string | number | null;
  date: string | null;
}

export function ReceiptList({ refreshToken = 0 }: ReceiptListProps) {
  const [data, setData] = useState<ReceiptListItem[]>([]);

  useEffect(() => {
    fetch("/api/receipts")
      .then((res) => res.json())
      .then((res) => setData(res.data));
  }, [refreshToken]);

  return (
    <div className="space-y-2">
      {data.map((r) => (
        <div key={r.id} className="rounded border p-3">
          <p>{r.merchant}</p>
          <p>{r.total} €</p>
          <p>{r.date}</p>
        </div>
      ))}
    </div>
  );
}
