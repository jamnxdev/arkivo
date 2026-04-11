import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText, Output } from "ai";
import z from "zod/v3";

import { env } from "@/lib/env";

const google = createGoogleGenerativeAI({
  apiKey: env.GEMINI_API_KEY,
});

const receiptExtractionSchema = z.object({
  merchant: z.string().nullable(),
  merchant_brand: z.string().nullable(),
  total: z.number().nullable(),
  currency: z.string().nullable(),
  date: z.string().nullable(),
  time: z.string().nullable(),
  category: z.string().nullable(),
  raw_text: z.string().nullable(),
  items: z
    .array(
      z.object({
        name: z.string(),
        price: z.number(),
        category: z.string().nullable(),
      }),
    )
    .nullable(),
  tax: z.record(z.number()).nullable(),
});

export async function extractReceiptFromImage(input: {
  image: Buffer;
  mimeType: string;
  filename?: string;
}) {
  const result = await generateText({
    model: google("gemini-3.1-flash-lite-preview"),
    output: Output.object({ schema: receiptExtractionSchema }),
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Extract the receipt into JSON.

Rules:
- Return only values you can infer from the receipt image.
- Use null for missing fields.
- Keep numeric values as numbers, not strings.
- Use ISO date format YYYY-MM-DD when the date is visible.
- Use 24-hour time format HH:mm when the time is visible.
- Use item-level categories only when reasonably clear.
- Put any OCR-like full receipt text into raw_text when available.
- Assume currency is EUR unless the receipt clearly shows another currency.
- Do not invent taxes or items.
- No need to extract unnecessary details.
- The total will be written as Zu Zahlen or whatever it is called in Germany.
- The whole receipt will be in German, so expect German words for merchant, total, date, time, etc.`,
          },
          {
            type: "image",
            image: input.image,
            mediaType: input.mimeType,
          },
        ],
      },
    ],
  });

  return {
    ...result.output,
    currency: result.output.currency ?? "EUR",
    metadata: {
      extractionModel: "gemini-3.1-flash-lite",
      extractionProvider: "google",
      sourceFilename: input.filename ?? null,
      sourceMimeType: input.mimeType,
    },
  };
}
