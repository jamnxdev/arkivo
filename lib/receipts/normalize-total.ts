interface NormalizeReceiptTotalInput {
  total: number | null;
  items: Array<{ price: number }> | null | undefined;
  tax: Record<string, number> | null | undefined;
}

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}

function isApproxEqual(left: number, right: number, tolerance = 0.01) {
  return Math.abs(left - right) <= tolerance;
}

function getDerivedTotal(
  items: Array<{ price: number }> | null | undefined,
  tax: Record<string, number> | null | undefined,
) {
  if (!items?.length) {
    return null;
  }

  const itemTotal = items.reduce((sum, item) => sum + item.price, 0);
  const taxTotal = tax
    ? Object.values(tax).reduce((sum, amount) => sum + amount, 0)
    : 0;

  return roundToTwo(itemTotal + taxTotal);
}

export function normalizeReceiptTotal(parsed: NormalizeReceiptTotalInput) {
  const derivedTotal = getDerivedTotal(parsed.items, parsed.tax);

  if (parsed.total === null) {
    return derivedTotal === null ? null : roundToTwo(derivedTotal);
  }

  if (derivedTotal === null) {
    return roundToTwo(parsed.total);
  }

  if (isApproxEqual(parsed.total, derivedTotal)) {
    return roundToTwo(derivedTotal);
  }

  return roundToTwo(parsed.total);
}
