"use client";

const BUDGET_ITEMS = [
  { category: "Groceries", spent: 420, limit: 600 },
  { category: "Transport", spent: 180, limit: 250 },
  { category: "Dining", spent: 310, limit: 280 },
  { category: "Utilities", spent: 140, limit: 200 },
] as const;

export function BudgetProgress() {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Budget Progress</h2>
        <span className="text-xs text-muted-foreground">This month</span>
      </div>

      <div className="space-y-3 rounded-xl border bg-card p-4">
        {BUDGET_ITEMS.map((item) => {
          const ratio = item.spent / item.limit;
          const percent = Math.round(ratio * 100);
          const isOver = ratio > 1;

          return (
            <div key={item.category} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{item.category}</span>
                <span
                  className={
                    isOver ? "text-destructive" : "text-muted-foreground"
                  }
                >
                  ${item.spent} / ${item.limit}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${
                    isOver ? "bg-destructive" : "bg-primary"
                  }`}
                  style={{ width: `${Math.min(percent, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
