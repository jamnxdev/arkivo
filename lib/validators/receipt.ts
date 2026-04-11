import z from "zod/v3";

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
