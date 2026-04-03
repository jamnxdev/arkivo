import { getCurrentUser } from "@/lib/auth";
import { parseReceipt } from "@/lib/parser/engine";
import { receiptSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ success: false, error: "Unauthorized" });
  }

  const { text } = await req.json();

  if (!text || typeof text !== "string") {
    return Response.json({
      success: false,
      error: "Invalid OCR text",
    });
  }

  const parsed = parseReceipt(text);
  const validated = receiptSchema.parse({
    ...parsed,
    raw_text: text,
  });

  return Response.json({
    success: true,
    data: validated,
  });
}
