import z from "zod/v3";

function hasText(value: string | null | undefined) {
  return Boolean(value?.trim());
}

export interface ReceiptContentInput {
  merchant: string | null;
  merchantBrand: string | null;
  total: number | null;
  date: string | null;
  time: string | null;
  items:
    | Array<{
        name: string;
        price: number;
        category?: string;
      }>
    | null;
  tax: Record<string, number> | null;
}

export interface ManualReceiptRequiredInput {
  merchant: string | null;
  total: number | null;
  currency: string | null;
  date: string | null;
  category: string | null;
}

export function getManualReceiptMissingFields(input: ManualReceiptRequiredInput) {
  const missing: string[] = [];

  if (!hasText(input.merchant)) missing.push("merchant");
  if (input.total === null) missing.push("total");
  if (!hasText(input.currency)) missing.push("currency");
  if (!hasText(input.date)) missing.push("date");
  if (!hasText(input.category)) missing.push("category");

  return missing;
}

export function hasRequiredManualReceiptFields(input: ManualReceiptRequiredInput) {
  return getManualReceiptMissingFields(input).length === 0;
}

export function hasMeaningfulReceiptContent(input: ReceiptContentInput) {
  const hasItems =
    input.items?.some(
      (item) =>
        hasText(item.name) ||
        hasText(item.category) ||
        item.price !== 0,
    ) ?? false;

  const hasTax =
    Object.entries(input.tax ?? {}).some(
      ([key, amount]) => hasText(key) || amount !== 0,
    ) ?? false;

  return (
    hasText(input.merchant) ||
    hasText(input.merchantBrand) ||
    input.total !== null ||
    hasText(input.date) ||
    hasText(input.time) ||
    hasItems ||
    hasTax
  );
}

export const receiptSchema = z
  .object({
    merchant: z.string().nullable(),
    merchant_brand: z.string().nullable(),

    total: z.number().nullable(),
    currency: z.string().default("EUR"),

    date: z.string().nullable(),
    time: z.string().nullable(),

    category: z.string().nullable(),

    items: z
      .array(
        z.object({
          name: z.string(),
          price: z.number(),
          category: z.string().optional(),
        }),
      )
      .nullable(),

    tax: z.record(z.number()).nullable(),
    metadata: z.record(z.any()).optional(),

    parser_config_id: z.string().optional(),
  })
  .strict();

const reviewedReceiptSaveBaseSchema = z
  .object({
    merchant: z.string().nullable(),
    merchantBrand: z.string().nullable(),
    total: z.number().nullable(),
    currency: z.string().default("EUR"),
    date: z.string().nullable(),
    time: z.string().nullable(),
    category: z.string().nullable(),
    items: z
      .array(
        z.object({
          name: z.string(),
          price: z.number(),
          category: z.string().optional(),
        }),
      )
      .nullable(),
    tax: z.record(z.number()).nullable(),
    metadata: z.record(z.any()).nullable(),
    parserConfigId: z.string().nullable(),
    cloudinaryPublicId: z.string().nullable(),
  })
  .strict();

export type ReviewedReceiptSaveInput = z.infer<typeof reviewedReceiptSaveBaseSchema>;

export const reviewedReceiptSaveSchema = reviewedReceiptSaveBaseSchema.superRefine(
  (input, context) => {
    if (!hasMeaningfulReceiptContent(input)) {
      context.addIssue({
        code: "custom",
        message: "Add at least one receipt detail before saving.",
      });
    }

    if (
      input.cloudinaryPublicId === null &&
      !hasRequiredManualReceiptFields({
        merchant: input.merchant,
        total: input.total,
        currency: input.currency,
        date: input.date,
        category: input.category,
      })
    ) {
      context.addIssue({
        code: "custom",
        message:
          "Manual receipts require merchant, total, currency, date, and category.",
      });
    }

    if (
      input.cloudinaryPublicId === null &&
      (input.total === null || !Number.isFinite(input.total) || input.total <= 0)
    ) {
      context.addIssue({
        code: "custom",
        message: "Manual receipt total must be greater than 0.",
      });
    }
  },
);
