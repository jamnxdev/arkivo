"use client";

import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";

interface UploadButtonProps {
  onUploadComplete?: () => void;
}

export function UploadButton({ onUploadComplete }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);

  async function cleanupUploadedAsset(publicId: string) {
    try {
      await fetch("/api/uploads/cloudinary/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicId }),
      });
    } catch {}
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    let uploadedPublicId: string | null = null;

    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const signatureRes = await fetch("/api/uploads/cloudinary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      const signaturePayload = await signatureRes.json();

      if (!signatureRes.ok || !signaturePayload.success) {
        throw new Error(
          signaturePayload.error || "Failed to prepare receipt upload",
        );
      }

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("api_key", signaturePayload.data.apiKey);
      uploadFormData.append(
        "timestamp",
        String(signaturePayload.data.timestamp),
      );
      uploadFormData.append("signature", signaturePayload.data.signature);
      uploadFormData.append("folder", signaturePayload.data.folder);
      uploadFormData.append("public_id", signaturePayload.data.publicId);

      const uploadRes = await fetch(signaturePayload.data.uploadUrl, {
        method: "POST",
        body: uploadFormData,
      });

      const uploadPayload = await uploadRes.json();

      if (!uploadRes.ok || !uploadPayload.secure_url) {
        throw new Error("Failed to upload receipt image");
      }

      uploadedPublicId = uploadPayload.public_id ?? signaturePayload.data.publicId;

      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageUrl: uploadPayload.secure_url,
          filename: file.name,
          publicId: uploadedPublicId,
        }),
      });

      const payload = await res.json();

      if (!res.ok || !payload.success) {
        throw new Error(payload.error || "Failed to process receipt");
      }

      setResult(payload.data.parsed);
      onUploadComplete?.();
    } catch (uploadError) {
      if (uploadedPublicId) {
        await cleanupUploadedAsset(uploadedPublicId);
      }

      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Failed to process receipt",
      );
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleUpload}
          disabled={isUploading}
          className="hidden"
        />
        <div>
          <Button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? "Uploading and processing..." : "Select a receipt image"}
          </Button>
        </div>
      </div>
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : null}
      {result ? (
        <pre className="mt-4 whitespace-pre-wrap break-words rounded-md border p-4 text-sm leading-6">
          {JSON.stringify(result, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}
