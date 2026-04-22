"use client";

import {
  CalendarBlankIcon,
  CaretLeftIcon,
  CaretRightIcon,
  FunnelSimpleIcon,
  MagnifyingGlassIcon,
  StorefrontIcon,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
  formatCurrencyByPreference,
  formatDateByPreference,
  getCurrencySymbolByPreference,
} from "@/lib/settings/preferences";
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

function formatDate(value: string | null) {
  if (!value) return "No date";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return formatDateByPreference(date, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(value: string | number | null) {
  const numericValue = typeof value === "string" ? Number(value) : value;
  if (numericValue == null || Number.isNaN(numericValue)) return "N/A";

  return formatCurrencyByPreference(numericValue);
}

export function ReceiptsPageContent() {
  const [receipts, setReceipts] = useState<ReceiptListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState("all-categories");
  const [sortBy, setSortBy] = useState("newest-first");
  const currencySymbol = getCurrencySymbolByPreference() || "€";

  useEffect(() => {
    fetch("/api/receipts")
      .then((res) => res.json())
      .then((payload) => {
        if (!payload.success) {
          throw new Error(payload.error || "Failed to load receipts");
        }

        setReceipts(Array.isArray(payload.data) ? payload.data : []);
        setError(null);
      })
      .catch((fetchError: unknown) => {
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load receipts",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

  const categoryOptions = useMemo(() => {
    const categories = new Set<string>();
    for (const receipt of receipts) {
      if (receipt.category?.trim()) {
        categories.add(receipt.category.trim());
      }
    }
    return [...categories].sort((a, b) => a.localeCompare(b));
  }, [receipts]);

  const filteredReceipts = useMemo(() => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    const normalizedDate = selectedDate.trim();

    const filtered = receipts.filter((receipt) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        (receipt.merchant ?? "").toLowerCase().includes(normalizedSearch) ||
        (receipt.category ?? "").toLowerCase().includes(normalizedSearch);

      const matchesCategory =
        categoryFilter === "all-categories" ||
        (receipt.category ?? "").trim() === categoryFilter;

      const matchesDate =
        normalizedDate.length === 0 ||
        (receipt.date ? receipt.date.slice(0, 10) === normalizedDate : false);

      return matchesSearch && matchesCategory && matchesDate;
    });

    return filtered.sort((left, right) => {
      const leftAmount = Number(left.total ?? 0) || 0;
      const rightAmount = Number(right.total ?? 0) || 0;
      const leftDate = left.date ? new Date(left.date).getTime() : 0;
      const rightDate = right.date ? new Date(right.date).getTime() : 0;

      if (sortBy === "oldest-first") {
        return leftDate - rightDate;
      }
      if (sortBy === "highest-amount") {
        return rightAmount - leftAmount;
      }
      if (sortBy === "lowest-amount") {
        return leftAmount - rightAmount;
      }

      return rightDate - leftDate;
    });
  }, [categoryFilter, receipts, searchValue, selectedDate, sortBy]);

  const stats = useMemo(() => {
    const totalSpend = filteredReceipts.reduce((sum, receipt) => {
      const value =
        typeof receipt.total === "string"
          ? Number(receipt.total)
          : receipt.total;
      return Number.isFinite(value) ? sum + Number(value) : sum;
    }, 0);

    return {
      count: filteredReceipts.length,
      totalSpend,
    };
  }, [filteredReceipts]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredReceipts.length / ITEMS_PER_PAGE),
  );
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const pageEnd = pageStart + ITEMS_PER_PAGE;
  const paginatedReceipts = filteredReceipts.slice(pageStart, pageEnd);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchValue, selectedDate, categoryFilter, sortBy]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

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
          Browse your real receipts with filters, sorting, and pagination.
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
          List controls
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
                {categoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
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
              onClick={() => {
                setSearchValue("");
                setSelectedDate("");
                setCategoryFilter("all-categories");
                setSortBy("newest-first");
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border bg-card p-6 text-center text-sm text-muted-foreground">
          Loading receipts...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-center text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && filteredReceipts.length === 0 ? (
        <div className="rounded-2xl border bg-card p-6 text-center">
          <p className="font-medium">No receipts found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload receipts from the dashboard or adjust filters to see results.
          </p>
          <Link
            href="/dashboard"
            className={cn(buttonVariants(), "mt-4 inline-flex")}
          >
            Go to dashboard
          </Link>
        </div>
      ) : null}

      {!isLoading && !error && filteredReceipts.length > 0 ? (
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
                    <span className="w-4 shrink-0 text-center text-muted-foreground">
                      {currencySymbol}
                    </span>
                    {formatAmount(receipt.total)}
                  </p>

                  <p className="truncate text-sm text-muted-foreground">
                    {receipt.category ?? "Uncategorized"}
                  </p>

                  <div className="md:justify-self-end">
                    <Button variant="outline" size="sm" disabled>
                      Edit soon
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
                {Math.min(pageEnd, filteredReceipts.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">
                {filteredReceipts.length}
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
