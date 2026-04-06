export interface ReceiptItem {
  name: string;
  price: number;
  category?: string;
}

export interface PrasedReceipt {
  merchant: string | null;
  merchant_brand: string | null;

  total: number | null;
  currency: string;

  date: string | null;
  time: string | null;

  category: string | null;

  items: ReceiptItem[];
  tax: Record<string, number>;

  raw_text?: string;
}
