"use client";

import { useClerk, useUser } from "@clerk/nextjs";
import { SignOutIcon, UserCircleIcon } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import * as React from "react";

import { StatsSectionCard } from "@/components/stats/stats-section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function SettingsPageContent() {
  const { user, isLoaded: userLoaded } = useUser();
  const { openUserProfile, signOut } = useClerk();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [themeMounted, setThemeMounted] = React.useState(false);
  const [defaultCurrency, setDefaultCurrency] = React.useState("EUR");
  const [dateLocale, setDateLocale] = React.useState("en-US");
  const [dateFormat, setDateFormat] = React.useState("dd/mm/yyyy");
  const [defaultTaxRate, setDefaultTaxRate] = React.useState("0");
  const [preferencesHydrated, setPreferencesHydrated] = React.useState(false);

  React.useEffect(() => {
    setThemeMounted(true);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // TODO(settings): move these preferences to a server-backed user settings table.
    const storedCurrency = window.localStorage.getItem(
      "settings.defaultCurrency",
    );
    const storedDateLocale = window.localStorage.getItem("settings.dateLocale");
    const storedDateFormat = window.localStorage.getItem("settings.dateFormat");
    const storedTaxRate = window.localStorage.getItem(
      "settings.defaultTaxRate",
    );

    if (storedCurrency) {
      setDefaultCurrency(storedCurrency);
    }
    if (storedDateLocale) {
      setDateLocale(storedDateLocale);
    }
    if (storedDateFormat) {
      setDateFormat(storedDateFormat);
    }
    if (storedTaxRate) {
      setDefaultTaxRate(storedTaxRate);
    }
    setPreferencesHydrated(true);
  }, []);

  const displayName =
    user?.fullName ??
    user?.username ??
    user?.primaryEmailAddress?.emailAddress ??
    "Account";

  const email = user?.primaryEmailAddress?.emailAddress ?? null;

  const themeValue = themeMounted ? (theme ?? "system") : "system";

  React.useEffect(() => {
    if (!preferencesHydrated || typeof window === "undefined") {
      return;
    }

    // TODO(settings): replace localStorage writes with authenticated API updates.
    window.localStorage.setItem("settings.defaultCurrency", defaultCurrency);
    window.localStorage.setItem("settings.dateLocale", dateLocale);
    window.localStorage.setItem("settings.dateFormat", dateFormat);
    window.localStorage.setItem("settings.defaultTaxRate", defaultTaxRate);
  }, [
    dateFormat,
    dateLocale,
    defaultCurrency,
    defaultTaxRate,
    preferencesHydrated,
  ]);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs font-medium tracking-[0.16em] text-muted-foreground uppercase">
          Settings
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">Preferences</h1>
        <p className="text-sm text-muted-foreground">
          Account, appearance, and session. Data export and account deletion
          will ship in a later release.
        </p>
      </header>

      <div className="grid gap-4">
        <StatsSectionCard
          title="Account"
          subtitle="Profile and security are managed by Clerk."
        >
          {!userLoaded ? (
            <p className="text-sm text-muted-foreground">Loading account…</p>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt=""
                    width={48}
                    height={48}
                    className="size-12 shrink-0 rounded-full border border-border object-cover"
                  />
                ) : (
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full border border-dashed border-border bg-muted/40">
                    <UserCircleIcon
                      size={28}
                      className="text-muted-foreground"
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium">{displayName}</p>
                  {email ? (
                    <p className="truncate text-sm text-muted-foreground">
                      {email}
                    </p>
                  ) : null}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="shrink-0 self-start sm:self-center"
                onClick={() => openUserProfile()}
              >
                Manage profile
              </Button>
            </div>
          )}
        </StatsSectionCard>

        <StatsSectionCard
          title="Appearance"
          subtitle="Theme follows this device until you change it."
        >
          <div className="space-y-3">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Color mode
              </p>
              <Select
                value={themeValue}
                onValueChange={(value) => setTheme(String(value ?? "system"))}
              >
                <SelectTrigger className="max-w-xs">
                  <SelectValue placeholder="System" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              Tip: press{" "}
              <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[0.7rem]">
                D
              </kbd>{" "}
              anywhere outside a field to toggle light and dark (
              {themeMounted ? (resolvedTheme ?? "…") : "…"} preview).
            </p>
          </div>
        </StatsSectionCard>

        <StatsSectionCard
          title="Data & privacy"
          subtitle="Control over your receipt data."
        >
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              {/* TODO(settings): wire export of user receipts (API + download). */}
              Export receipts — coming soon.
            </li>
            <li>
              {/* TODO(settings): document Clerk account deletion + optional DB purge. */}
              Delete account — use Clerk account settings for now; local data
              cleanup TBD.
            </li>
          </ul>
        </StatsSectionCard>

        <StatsSectionCard
          title="Regional defaults"
          subtitle="Formatting used when displaying money and dates."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Default currency
              </p>
              <Select
                value={defaultCurrency}
                onValueChange={(value) => setDefaultCurrency(String(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="INR">INR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Locale
              </p>
              <Select
                value={dateLocale}
                onValueChange={(value) => setDateLocale(String(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select locale" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="de-DE">German (DE)</SelectItem>
                  <SelectItem value="fr-FR">French (FR)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </StatsSectionCard>

        <StatsSectionCard
          title="Receipt defaults"
          subtitle="Pre-filled values for quick manual entries."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Date format
              </p>
              <Select
                value={dateFormat}
                onValueChange={(value) => setDateFormat(String(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select date format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">
                Default tax rate (%)
              </p>
              <Input
                inputMode="decimal"
                value={defaultTaxRate}
                onChange={(event) => setDefaultTaxRate(event.target.value)}
                placeholder="e.g. 20"
              />
            </div>
          </div>
        </StatsSectionCard>

        <StatsSectionCard title="Session" subtitle="Sign out on this device.">
          <Button
            type="button"
            variant="destructive"
            className="gap-2"
            onClick={() => signOut({ redirectUrl: "/" })}
          >
            <SignOutIcon size={18} />
            Sign out
          </Button>
        </StatsSectionCard>
      </div>
    </section>
  );
}
