import { createHash } from "node:crypto";

import { env } from "@/lib/env";

function sanitizeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export function createCloudinaryUploadSignature(input: { filename: string }) {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = "arkivo/receipts";
  const publicId = `${crypto.randomUUID()}-${sanitizeFilename(input.filename)}`;
  const paramsToSign = `folder=${folder}&public_id=${publicId}&timestamp=${timestamp}`;
  const signature = createHash("sha1")
    .update(`${paramsToSign}${env.CLOUDINARY_API_SECRET}`)
    .digest("hex");

  return {
    apiKey: env.CLOUDINARY_API_KEY,
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    folder,
    publicId,
    signature,
    timestamp,
    uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
  };
}

export async function deleteCloudinaryAsset(input: { publicId: string }) {
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `public_id=${input.publicId}&timestamp=${timestamp}`;
  const signature = createHash("sha1")
    .update(`${paramsToSign}${env.CLOUDINARY_API_SECRET}`)
    .digest("hex");

  const formData = new FormData();
  formData.append("public_id", input.publicId);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("api_key", env.CLOUDINARY_API_KEY);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
    {
      method: "POST",
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete Cloudinary asset");
  }
}
