export function formatCurrency(value: number): string {
  return `$${value.toLocaleString("en-US")}`;
}

export function formatShortDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function formatMonthYear(dateString: string): string {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
}
