import type { PrasedReceipt } from "@/types/receipt";

import {
  detectMerchat,
  extractDateTime,
  extractItems,
  extractTotal,
} from "./germany";

export function parseReceipt(text: string): PrasedReceipt {
  const merchant_brand = detectMerchat(text);

  const total = extractTotal(text);

  const { date, time } = extractDateTime(text);

  const items = extractItems(text);

  return {
    merchant: merchant_brand?.toUpperCase() || null,
    merchant_brand,
    total,
    currency: "EUR",
    date,
    time,
    category: "groceries",
    items,
    tax: {},
  };
}
