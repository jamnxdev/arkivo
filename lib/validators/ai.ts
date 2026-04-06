import z from "zod/v3";

export const aiReceiptSchema = z.object({
  merchant: z.string().nullable(),
  total: z.number().nullable(),
  date: z.string().nullable(),

  category: z.string().nullable(),

  items: z.array(
    z.object({
      name: z.string(),
      price: z.number(),
      category: z.string(),
    }),
  ),
});
