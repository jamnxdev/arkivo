import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Page() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-svh bg-background">
      <div className="grid min-h-svh w-full lg:grid-cols-2">
        <section className="relative hidden overflow-hidden border-r bg-linear-to-br from-muted/70 via-background to-muted/30 p-10 lg:block">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,color-mix(in_oklch,var(--primary)_16%,transparent),transparent_42%),radial-gradient(circle_at_85%_78%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent_38%)]" />
          <div className="relative flex h-full min-h-[560px] w-full flex-col items-center justify-center text-center">
            <div className="w-full max-w-xl rounded-3xl border border-border/70 bg-card/85 p-10 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.35)] backdrop-blur">
              <div className="mb-6 inline-flex w-fit items-center rounded-full border bg-background/70 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Built for modern bookkeeping
              </div>

              {/* TODO(auth): replace these showcase values with live account/product metrics when available. */}
              <div className="space-y-7 text-left">
                <div className="space-y-3">
                  <h2 className="text-4xl font-semibold tracking-tight text-balance">
                    One place for receipts, analytics, and expense confidence
                  </h2>
                  <p className="text-base leading-7 text-muted-foreground">
                    Arkivo helps teams capture documents faster, find records
                    instantly, and understand spending without spreadsheet chaos.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border bg-background/70 p-3">
                    <p className="text-xs text-muted-foreground">Avg. capture time</p>
                    <p className="mt-1 text-xl font-semibold">6s</p>
                  </div>
                  <div className="rounded-xl border bg-background/70 p-3">
                    <p className="text-xs text-muted-foreground">Search coverage</p>
                    <p className="mt-1 text-xl font-semibold">99%</p>
                  </div>
                  <div className="rounded-xl border bg-background/70 p-3">
                    <p className="text-xs text-muted-foreground">Active categories</p>
                    <p className="mt-1 text-xl font-semibold">24+</p>
                  </div>
                </div>

                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" />
                    AI extraction for totals, merchant, and date.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" />
                    Filters and edits built for real bookkeeping workflows.
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="size-1.5 rounded-full bg-primary" />
                    Trend dashboards to catch anomalies early.
                  </li>
                </ul>
              </div>

            </div>
          </div>
          <div className="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full border border-primary/20" />
          <div className="pointer-events-none absolute -right-14 -bottom-14 size-48 rounded-full border border-primary/20" />
        </section>

        <section className="mx-auto flex w-full max-w-md flex-col justify-center gap-4 p-6 sm:p-8 lg:px-12 lg:py-10">
            <div className="space-y-1 text-center lg:text-left">
              <p className="text-xs font-medium tracking-[0.18em] text-muted-foreground uppercase">
                Arkivo
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="text-sm text-muted-foreground">
                Continue to your receipts and insights.
              </p>
            </div>

            <div className="flex justify-center lg:justify-start">
              <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" />
            </div>
        </section>
      </div>
    </main>
  );
}
