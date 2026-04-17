"use client";

import { Camera, UploadSimple } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

export function ReceiptCaptureSection() {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedFileName(file?.name ?? null);
  };

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Add receipt</h2>
        <p className="text-xs text-muted-foreground">
          Upload an image or capture one with your camera
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => uploadInputRef.current?.click()}
            size="sm"
            variant="outline"
          >
            <UploadSimple />
            Upload image
          </Button>

          <Button onClick={() => cameraInputRef.current?.click()} size="sm">
            <Camera />
            Take image
          </Button>
        </div>

        <input
          accept="image/*"
          className="hidden"
          onChange={handleImageSelect}
          ref={uploadInputRef}
          type="file"
        />
        <input
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageSelect}
          ref={cameraInputRef}
          type="file"
        />

        <p className="mt-3 text-xs text-muted-foreground">
          {selectedFileName ? `Selected: ${selectedFileName}` : "No image selected"}
        </p>
      </div>
    </section>
  );
}
