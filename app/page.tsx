import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Page() {
  return <LandingContent />;
}

async function LandingContent() {
  const { userId } = await auth();
  const getStartedHref = userId ? "/dashboard" : "/sign-up";
  const signInHref = userId ? "/dashboard" : "/sign-in";

  return (
    <main className="min-h-svh bg-background">
      <div className="mx-auto flex min-h-svh w-full max-w-5xl items-center justify-center px-6 py-16">
        <section className="max-w-2xl space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-medium tracking-[0.24em] text-muted-foreground uppercase">
              Arkivo
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Keep receipts and business documents organized without manual
              entry.
            </h1>
            <p className="max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Arkivo helps you upload receipts, extract the important details
              with AI, and keep spending records searchable in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={getStartedHref}>
              <Button>Get started</Button>
            </Link>
            <Link href={signInHref}>
              <Button variant="outline">Sign in</Button>
            </Link>
          </div>

          <div className="grid gap-4 border-t border-border pt-8 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="space-y-1">
              <p className="font-medium text-foreground">AI extraction</p>
              <p>Turn uploaded receipt images into structured records.</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Spending visibility</p>
              <p>Track totals and categories across your saved receipts.</p>
            </div>
            <div className="space-y-1">
              <p className="font-medium text-foreground">Simple archive</p>
              <p>Keep your documents in one clean, searchable workspace.</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
