"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

interface ActionCenterSectionProps {
  refreshToken?: number;
}

interface ReceiptItem {
  id: string;
  merchant: string | null;
  total: string | number | null;
  date: string | null;
  category: string | null;
  createdAt?: string | null;
}

const REALTIME_REFRESH_INTERVAL_MS = 10_000;
// TODO: Make this interval configurable from user settings/preferences.

function parseAmount(value: string | number | null) {
  const numeric = Number(value);

  return Number.isNaN(numeric) ? 0 : numeric;
}

function formatReceiptDate(value: string | null) {
  if (!value) {
    return "Unknown date";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

export function ActionCenterSection({ refreshToken = 0 }: ActionCenterSectionProps) {
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadReceipts = async () => {
      const response = await fetch("/api/receipts", { cache: "no-store" });
      const payload = await response.json();

      if (!isMounted) {
        return;
      }

      const rows = Array.isArray(payload.data) ? payload.data : [];
      const recentRows = rows
        .sort((a: ReceiptItem, b: ReceiptItem) => {
          const aTimestamp = new Date(
            a.date ?? a.createdAt ?? "1970-01-01T00:00:00.000Z",
          ).getTime();
          const bTimestamp = new Date(
            b.date ?? b.createdAt ?? "1970-01-01T00:00:00.000Z",
          ).getTime();

          return bTimestamp - aTimestamp;
        })
        .slice(0, 3);

      setReceipts(recentRows);
    };

    void loadReceipts();
    const intervalId = window.setInterval(loadReceipts, REALTIME_REFRESH_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [refreshToken]);

  const totalRecentSpend = useMemo(
    () => receipts.reduce((sum, receipt) => sum + parseAmount(receipt.total), 0),
    [receipts],
  );

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Recent receipts</h2>
          <p className="text-xs text-muted-foreground">
            Latest synced expenses and categories
          </p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard/receipts">
          View all
          </Link>
        </Button>
      </div>

      <div className="space-y-2 rounded-xl border bg-card p-4">
        {receipts.length > 0 ? (
          receipts.map((receipt) => (
            <article
              key={receipt.id}
              className="rounded-lg border border-border/70 bg-background/70 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">
                    {receipt.merchant ?? "Unknown merchant"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {formatReceiptDate(receipt.date)} · {receipt.category ?? "Uncategorized"}
                  </p>
                </div>
                <p className="text-sm font-semibold tracking-tight">
                  {/* TODO: Format with receipt currency when multi-currency support lands. */}
                  ${parseAmount(receipt.total).toFixed(2)}
                </p>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-lg border border-dashed border-border/70 bg-background/60 p-3">
            <p className="text-sm text-muted-foreground">No receipts yet.</p>
          </div>
        )}

        <div className="flex items-center justify-between rounded-lg border border-dashed border-border/70 bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">
            Total from latest receipts
          </p>
          <p className="text-sm font-semibold">
            {/* TODO: Format with account currency once currency preferences are available. */}
            ${totalRecentSpend.toFixed(2)}
          </p>
        </div>
      </div>
    </section>
  );
}
