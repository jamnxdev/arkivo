"use client";

import {
  CalendarBlankIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CurrencyEurIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  StorefrontIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ReceiptListItem = {
  id: string;
  merchant: string | null;
  total: string | number | null;
  date: string | null;
  category: string | null;
};

const ITEMS_PER_PAGE = 10;
const MOCK_TEMPLATE: ReceiptListItem = {
  id: "mock-template",
  merchant: "dm-drogerie markt",
  total: 5.55,
  date: "2026-03-23T10:20:00.000Z",
  category: "personal care",
};

function formatDate(value: string | null) {
  if (!value) return "No date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatAmount(value: string | number | null) {
  const numericValue = typeof value === "string" ? Number(value) : value;
  if (numericValue == null || Number.isNaN(numericValue)) return "N/A";

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(numericValue);
}

export function ReceiptsPageContent() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("all-categories");
  const [sortBy, setSortBy] = useState("newest-first");

  const receipts = useMemo(
    () =>
      Array.from({ length: 100 }, (_, index) => ({
        ...MOCK_TEMPLATE,
        id: `mock-receipt-${index + 1}`,
      })),
    [],
  );

  const stats = useMemo(() => {
    const totalSpend = receipts.reduce((sum, receipt) => {
      const value =
        typeof receipt.total === "string"
          ? Number(receipt.total)
          : receipt.total;
      return Number.isFinite(value) ? sum + Number(value) : sum;
    }, 0);

    return {
      count: receipts.length,
      totalSpend,
    };
  }, [receipts]);

  const totalPages = Math.ceil(receipts.length / ITEMS_PER_PAGE);
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageEnd = pageStart + ITEMS_PER_PAGE;
  const paginatedReceipts = receipts.slice(pageStart, pageEnd);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Receipts
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Receipt records
        </h1>
        <p className="text-sm text-muted-foreground">
          Preview of upcoming list experience with filters, sorting, and
          pagination.
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total receipts</p>
          <p className="mt-1 text-2xl font-semibold">{stats.count}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Total spend</p>
          <p className="mt-1 text-2xl font-semibold">
            {formatAmount(stats.totalSpend)}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-sm text-muted-foreground">Page</p>
          <p className="mt-1 text-2xl font-semibold">
            {currentPage}/{totalPages}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border bg-card p-4">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
          <FunnelSimpleIcon size={16} />
          List controls (preview)
        </div>
        <div className="space-y-3">
          <label className="relative block">
            <MagnifyingGlassIcon
              size={18}
              className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search merchant or item"
              className="rounded-xl pr-4 pl-11 text-base"
            />
          </label>
          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_auto]">
            <DatePicker value={selectedDate} onChange={setSelectedDate} />
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(String(value ?? ""))}
            >
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-categories">All categories</SelectItem>
                <SelectItem value="personal-care">Personal care</SelectItem>
                <SelectItem value="groceries">Groceries</SelectItem>
                <SelectItem value="household">Household</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(value) => setSortBy(String(value ?? ""))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Newest first" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest-first">Newest first</SelectItem>
                <SelectItem value="oldest-first">Oldest first</SelectItem>
                <SelectItem value="highest-amount">Highest amount</SelectItem>
                <SelectItem value="lowest-amount">Lowest amount</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              className="justify-self-start lg:justify-self-end"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {receipts.length === 0 ? (
        <div className="rounded-2xl border bg-card p-6 text-center">
          <p className="font-medium">No receipts yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload your first receipt from the dashboard to start tracking
            spend.
          </p>
          <Link
            href="/dashboard"
            className={cn(buttonVariants(), "mt-4 inline-flex")}
          >
            Go to dashboard
          </Link>
        </div>
      ) : null}

      {receipts.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="hidden border-b px-4 py-3 text-xs font-semibold tracking-[0.12em] text-muted-foreground uppercase md:block">
            <div className="grid grid-cols-[minmax(220px,2fr)_minmax(140px,1fr)_minmax(110px,0.8fr)_minmax(140px,1fr)_120px] items-center gap-3">
              <span>Merchant</span>
              <span>Date</span>
              <span>Total</span>
              <span>Category</span>
              <span className="text-right">Action</span>
            </div>
          </div>

          <ul className="divide-y">
            {paginatedReceipts.map((receipt) => (
              <li key={receipt.id} className="px-4 py-4">
                <div className="grid gap-3 md:grid-cols-[minmax(220px,2fr)_minmax(140px,1fr)_minmax(110px,0.8fr)_minmax(140px,1fr)_120px] md:items-center">
                  <div className="flex min-w-0 items-center gap-2">
                    <StorefrontIcon
                      size={16}
                      className="shrink-0 text-muted-foreground"
                    />
                    <p className="truncate font-medium">
                      {receipt.merchant ?? "Unknown merchant"}
                    </p>
                  </div>

                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarBlankIcon size={16} className="shrink-0" />
                    {formatDate(receipt.date)}
                  </p>

                  <p className="flex items-center gap-2 text-sm font-medium">
                    <CurrencyEurIcon size={16} className="shrink-0" />
                    {formatAmount(receipt.total)}
                  </p>

                  <p className="truncate text-sm text-muted-foreground">
                    {receipt.category ?? "Uncategorized"}
                  </p>

                  <div className="md:justify-self-end">
                    <Button variant="outline" size="sm" disabled>
                      View/Edit soon
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <footer className="flex flex-col gap-3 border-t px-4 py-3 text-sm md:flex-row md:items-center md:justify-between">
            <p className="text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {pageStart + 1}
              </span>
              -
              <span className="font-medium text-foreground">
                {Math.min(pageEnd, receipts.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {receipts.length}
              </span>{" "}
              receipts
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
              >
                <CaretLeftIcon size={14} />
                Prev
              </Button>

              <div className="rounded-xl border px-3 py-1.5 text-xs font-semibold tracking-wide text-muted-foreground">
                Page {currentPage} / {totalPages}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
                <CaretRightIcon size={14} />
              </Button>
            </div>
          </footer>
        </div>
      ) : null}
    </section>
  );
}
