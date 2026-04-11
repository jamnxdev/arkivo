import { getCurrentUser } from "@/lib/auth";
import { deleteCloudinaryAsset } from "@/lib/storage/cloudinary";

export async function POST(req: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const body = (await req.json()) as {
    publicId?: string;
  };

  if (!body.publicId || typeof body.publicId !== "string") {
    return Response.json(
      { success: false, error: "A Cloudinary public ID is required" },
      { status: 400 },
    );
  }

  await deleteCloudinaryAsset({
    publicId: body.publicId,
  });

  return Response.json({ success: true });
}
