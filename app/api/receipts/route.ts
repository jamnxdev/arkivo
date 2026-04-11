import { getCurrentUser } from "@/lib/auth";
import { createReceipt, getReceipts } from "@/lib/db/queries/receipts";
import type { ReceiptInsert } from "@/lib/db/schema";

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ success: false, error: "Unauthorized" });
  }

  const body = (await req.json()) as Omit<ReceiptInsert, "userId">;

  const receipt = await createReceipt({
    userId: user.id,
    ...body,
  });

  return Response.json({ success: true, data: receipt });
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ success: false, error: "Unauthorized" });
  }

  const data = await getReceipts(user.id);

  return Response.json({ success: true, data });
}
