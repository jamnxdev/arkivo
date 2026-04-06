import { parseReceipt } from "@/lib/parser/engine";
import type { PrasedReceipt } from "@/types/receipt";

import { generateReceiptAI } from "../ai/client";

function isWeak(parsed: PrasedReceipt) {
  return !parsed.total || !parsed.items || parsed.items.length === 0;
}

export async function ingestReceipt(text: string): Promise<PrasedReceipt> {
  const parsed = parseReceipt(text);

  if (!isWeak(parsed)) {
    return parsed;
  }

  try {
    const enriched = await generateReceiptAI({
      text,
      parsed,
    });

    return {
      ...parsed,
      ...enriched,
    };
  } catch {
    return parsed;
  }
}
