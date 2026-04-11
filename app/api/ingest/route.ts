import { extractReceiptFromImage } from "@/lib/ai/client";
import { getCurrentUser } from "@/lib/auth";
import { createReceipt } from "@/lib/db/queries/receipts";
import { deleteCloudinaryAsset } from "@/lib/storage/cloudinary";
import { receiptSchema } from "@/lib/validators";

function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }

  return "Failed to process receipt";
}

function getErrorStatus(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "statusCode" in error &&
    typeof error.statusCode === "number"
  ) {
    return error.statusCode;
  }

  return 500;
}

function toReceiptDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

export async function POST(req: Request) {
  let publicId: string | null = null;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = (await req.json()) as {
      imageUrl?: string;
      filename?: string;
      publicId?: string;
    };

    if (!body.imageUrl || typeof body.imageUrl !== "string") {
      return Response.json(
        {
          success: false,
          error: "A receipt image URL is required",
        },
        { status: 400 },
      );
    }

    if (!body.publicId || typeof body.publicId !== "string") {
      return Response.json(
        {
          success: false,
          error: "A Cloudinary public ID is required",
        },
        { status: 400 },
      );
    }

    publicId = body.publicId;

    const imageResponse = await fetch(body.imageUrl);

    if (!imageResponse.ok) {
      throw new Error("Failed to fetch receipt image");
    }

    const parsed = await extractReceiptFromImage({
      image: Buffer.from(await imageResponse.arrayBuffer()),
      mimeType: imageResponse.headers.get("content-type") || "image/jpeg",
      filename: body.filename,
    });

    const validated = receiptSchema.parse(parsed);

    const saved = await createReceipt({
      userId: user.id,
      merchant: validated.merchant,
      merchantBrand: validated.merchant_brand,
      total: validated.total?.toString() ?? null,
      currency: validated.currency,
      date: toReceiptDate(validated.date),
      time: validated.time,
      category: validated.category,
      rawText: validated.raw_text ?? null,
      items: validated.items,
      tax: validated.tax,
      metadata: validated.metadata ?? null,
      parserConfigId: validated.parser_config_id ?? null,
    });

    return Response.json({
      success: true,
      data: {
        parsed: validated,
        saved,
      },
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: getErrorMessage(error),
      },
      {
        status: (() => {
          const status = getErrorStatus(error);
          return status >= 400 && status < 600 ? status : 500;
        })(),
      },
    );
  } finally {
    if (publicId) {
      try {
        await deleteCloudinaryAsset({ publicId });
      } catch {}
    }
  }
}
