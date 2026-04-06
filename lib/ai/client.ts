import { generateText, Output } from "ai";

import type { PrasedReceipt } from "@/types/receipt";

import { aiReceiptSchema } from "../validators/ai";

export async function generateReceiptAI(input: {
  text: string;
  parsed: PrasedReceipt;
}) {
  const prompt = `You are a receipt processing system.
    Fix and enrich this receipt.

    Rules:
    - Keep numbers accurate
    - Fix missing values
    - Assign categories to items

    OCR TEXT:
    ${input.text}

    CURRENT PARSED DATA:
    ${JSON.stringify(input.parsed)}
    `;

  try {
    const result = await generateText({
      model: "openai/gpt-4o-mini",
      output: Output.object({
        schema: aiReceiptSchema,
      }),
      prompt,
    });

    return result.output;
  } catch {
    const result = await generateText({
      model: "google/gemini-2.5-flash-lite",
      output: Output.object({
        schema: aiReceiptSchema,
      }),
      prompt,
    });

    return result.output;
  }
}
