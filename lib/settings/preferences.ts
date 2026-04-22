"use client";

export type DateFormatOption = "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy-mm-dd";

export type AppPreferences = {
  currency: string;
  locale: string;
  dateFormat: DateFormatOption;
};

const DEFAULT_PREFERENCES: AppPreferences = {
  currency: "EUR",
  locale: "en-US",
  dateFormat: "dd/mm/yyyy",
};

function getStoredValue(key: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  return window.localStorage.getItem(key);
}

export function getAppPreferences(): AppPreferences {
  const currency = getStoredValue("settings.defaultCurrency");
  const locale = getStoredValue("settings.dateLocale");
  const dateFormat = getStoredValue("settings.dateFormat");

  return {
    currency: currency || DEFAULT_PREFERENCES.currency,
    locale: locale || DEFAULT_PREFERENCES.locale,
    dateFormat:
      dateFormat === "dd/mm/yyyy" ||
      dateFormat === "mm/dd/yyyy" ||
      dateFormat === "yyyy-mm-dd"
        ? dateFormat
        : DEFAULT_PREFERENCES.dateFormat,
  };
}

export function formatCurrencyByPreference(value: number): string {
  const { currency, locale } = getAppPreferences();
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}

export function getCurrencySymbolByPreference(): string {
  const { currency, locale } = getAppPreferences();
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).formatToParts(0);

  return parts.find((part) => part.type === "currency")?.value ?? currency;
}

export function formatDateByPreference(
  date: Date,
  fallbackOptions: Intl.DateTimeFormatOptions,
  options?: { useDatePreset?: boolean },
): string {
  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  const { locale, dateFormat } = getAppPreferences();
  const useDatePreset = options?.useDatePreset ?? true;

  if (!useDatePreset) {
    return new Intl.DateTimeFormat(locale, fallbackOptions).format(date);
  }

  // TODO(settings): expand this mapping when additional user date format presets are added.
  const optionsByFormat: Record<DateFormatOption, Intl.DateTimeFormatOptions> =
    {
      "dd/mm/yyyy": { day: "2-digit", month: "2-digit", year: "numeric" },
      "mm/dd/yyyy": { month: "2-digit", day: "2-digit", year: "numeric" },
      "yyyy-mm-dd": { year: "numeric", month: "2-digit", day: "2-digit" },
    };

  const baseOptions = optionsByFormat[dateFormat] ?? fallbackOptions;
  return new Intl.DateTimeFormat(locale, {
    ...baseOptions,
    ...fallbackOptions,
  }).format(date);
}
