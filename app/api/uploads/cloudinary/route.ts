import { getCurrentUser } from "@/lib/auth";
import { createCloudinaryUploadSignature } from "@/lib/storage/cloudinary";

const MAX_RECEIPT_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = (await req.json()) as {
    filename?: string;
    contentType?: string;
    size?: number;
  };

  if (!body.filename || !body.contentType || typeof body.size !== "number") {
    return Response.json(
      { success: false, error: "Invalid upload request" },
      { status: 400 },
    );
  }

  if (!ALLOWED_IMAGE_TYPES.has(body.contentType)) {
    return Response.json(
      { success: false, error: "Unsupported file type" },
      { status: 400 },
    );
  }

  if (body.size <= 0 || body.size > MAX_RECEIPT_SIZE_BYTES) {
    return Response.json(
      { success: false, error: "Receipt image is too large" },
      { status: 400 },
    );
  }

  return Response.json({
    success: true,
    data: createCloudinaryUploadSignature({
      filename: body.filename,
    }),
  });
}
