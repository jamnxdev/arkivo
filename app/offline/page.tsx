import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">You are offline</h1>
      <p className="text-sm text-muted-foreground">
        Arkivo cannot reach the network right now. Reconnect to keep syncing receipts.
      </p>
      <Link
        href="/dashboard"
        className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent"
      >
        Try again
      </Link>
    </main>
  );
}
