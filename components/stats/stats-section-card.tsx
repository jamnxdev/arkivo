import type { ReactNode } from "react";

export function StatsSectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-xl border bg-card p-3 md:p-4">
      <div>
        <h2 className="font-semibold text-base">{title}</h2>
        <p className="text-muted-foreground text-xs">{subtitle}</p>
      </div>
      {children}
    </section>
  );
}
