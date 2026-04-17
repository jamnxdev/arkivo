"use client";

import { Button } from "@/components/ui/button";

const RECENT_RECEIPTS = [
  {
    merchant: "Market Basket",
    date: "Today",
    category: "Groceries",
    amount: 86.42,
  },
  {
    merchant: "Shell Fuel Station",
    date: "Yesterday",
    category: "Transport",
    amount: 52.0,
  },
  {
    merchant: "Amazon Business",
    date: "Apr 15",
    category: "Office",
    amount: 129.9,
  },
] as const;

export function ActionCenterSection() {
  const totalRecentSpend = RECENT_RECEIPTS.reduce(
    (sum, receipt) => sum + receipt.amount,
    0,
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
        <Button size="sm" variant="outline">
          View all
        </Button>
      </div>

      <div className="space-y-2 rounded-xl border bg-card p-4">
        {RECENT_RECEIPTS.map((receipt) => (
          <article
            key={`${receipt.merchant}-${receipt.date}`}
            className="rounded-lg border border-border/70 bg-background/70 p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">{receipt.merchant}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {receipt.date} · {receipt.category}
                </p>
              </div>
              <p className="text-sm font-semibold tracking-tight">
                ${receipt.amount.toFixed(2)}
              </p>
            </div>
          </article>
        ))}

        <div className="flex items-center justify-between rounded-lg border border-dashed border-border/70 bg-background/60 p-3">
          <p className="text-xs text-muted-foreground">
            Total from latest receipts
          </p>
          <p className="text-sm font-semibold">
            ${totalRecentSpend.toFixed(2)}
          </p>
        </div>
      </div>
    </section>
  );
}
