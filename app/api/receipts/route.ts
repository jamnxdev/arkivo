import { getCurrentUser } from "@/lib/auth";
import { createReceipt, getReceipts } from "@/lib/db/queries/receipts";
import { setRlsUserContext } from "@/lib/db/rls";
import { normalizeReceiptTotal } from "@/lib/receipts/normalize-total";
import { deleteCloudinaryAsset } from "@/lib/storage/cloudinary";
import {
  type ReviewedReceiptSaveInput,
  reviewedReceiptSaveSchema,
} from "@/lib/validators";

function toReceiptDate(value: string | null) {
  if (!value) {
    return null;
  }

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (dateOnlyMatch) {
    const year = Number(dateOnlyMatch[1]);
    const monthIndex = Number(dateOnlyMatch[2]) - 1;
    const day = Number(dateOnlyMatch[3]);
    return new Date(Date.UTC(year, monthIndex, day, 12, 0, 0));
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ success: false, error: "Unauthorized" });
    }

    await setRlsUserContext(user.id);
    const body: unknown = await req.json();
    const validated: ReviewedReceiptSaveInput =
      reviewedReceiptSaveSchema.parse(body);
    const roundedItems = validated.items?.map((item) => ({
      ...item,
      price: roundToTwo(item.price),
    }));
    const roundedTax = validated.tax
      ? Object.fromEntries(
          Object.entries(validated.tax).map(([key, amount]) => [
            key,
            roundToTwo(amount),
          ]),
        )
      : null;
    const normalizedTotal = normalizeReceiptTotal({
      total: validated.total,
      items: roundedItems,
      tax: roundedTax,
    });

    const receipt = await createReceipt({
      userId: user.id,
      merchant: validated.merchant,
      merchantBrand: validated.merchantBrand,
      total: normalizedTotal?.toString() ?? null,
      currency: validated.currency,
      date: toReceiptDate(validated.date),
      time: validated.time,
      category: validated.category,
      items: roundedItems,
      tax: roundedTax,
      metadata: validated.metadata,
      parserConfigId: validated.parserConfigId,
    });

    if (validated.cloudinaryPublicId) {
      try {
        await deleteCloudinaryAsset({
          publicId: validated.cloudinaryPublicId,
        });
      } catch {}
    }

    return Response.json({ success: true, data: receipt });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to save receipt",
      },
      { status: 400 },
    );
  }
}

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json({ success: false, error: "Unauthorized" });
  }

  await setRlsUserContext(user.id);
  const data = await getReceipts(user.id);

  return Response.json({ success: true, data });
}
