import {
  formatCurrencyByPreference,
  formatDateByPreference,
} from "@/lib/settings/preferences";

export function formatCurrency(value: number): string {
  return formatCurrencyByPreference(value);
}

export function formatShortDate(dateString: string): string {
  return formatDateByPreference(new Date(dateString), {
    month: "short",
    day: "numeric",
  }, { useDatePreset: false });
}

export function formatMonthYear(dateString: string): string {
  return formatDateByPreference(new Date(`${dateString}T12:00:00`), {
    month: "short",
    year: "numeric",
  }, { useDatePreset: false });
}
