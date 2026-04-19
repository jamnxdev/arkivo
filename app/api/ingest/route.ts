import { extractReceiptFromImage } from "@/lib/ai/client";
import { getCurrentUser } from "@/lib/auth";
import { normalizeReceiptTotal } from "@/lib/receipts/normalize-total";
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

export async function POST(req: Request) {
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
    const normalizedTotal = normalizeReceiptTotal({
      total: validated.total,
      items: validated.items,
      tax: validated.tax,
    });

    return Response.json({
      success: true,
      data: {
        parsed: {
          ...validated,
          total: normalizedTotal,
        },
        cloudinaryPublicId: body.publicId,
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
  }
}
