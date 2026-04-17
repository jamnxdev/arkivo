"use client";

const OVERVIEW_METRICS = [
  {
    label: "Total Spending",
    value: "$4,860.25",
    helper: "This month",
  },
  {
    label: "Receipts",
    value: "128",
    helper: "Uploaded so far",
  },
  {
    label: "Average Receipt",
    value: "$37.97",
    helper: "Per receipt",
  },
  {
    label: "Top Category",
    value: "Groceries",
    helper: "42% of spend",
  },
] as const;

export function OverviewCards() {
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
