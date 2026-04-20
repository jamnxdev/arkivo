"use client";

import { Camera, NotePencil, UploadSimple } from "@phosphor-icons/react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getManualReceiptMissingFields,
  hasMeaningfulReceiptContent,
  hasRequiredManualReceiptFields,
} from "@/lib/validators";

interface ReceiptCaptureSectionProps {
  onReceiptSaved?: () => void;
}

interface ParsedReceipt {
  merchant: string | null;
  merchant_brand: string | null;
  total: number | null;
  currency: string;
  date: string | null;
  time: string | null;
  category: string | null;
  items: Array<{
    name: string;
    price: number;
    category?: string;
  }> | null;
  tax: Record<string, number> | null;
  metadata?: Record<string, unknown>;
  parser_config_id?: string;
}

interface ReceiptDraft {
  merchant: string | null;
  merchantBrand: string | null;
  total: number | null;
  currency: string;
  date: string | null;
  time: string | null;
  category: string | null;
  items: Array<{
    name: string;
    price: number;
    category?: string;
  }> | null;
  tax: Record<string, number> | null;
  metadata: Record<string, unknown> | null;
  parserConfigId: string | null;
}

interface NotificationToast {
  id: number;
  title: string;
  description: string;
  tone: "error" | "success";
}

const EMPTY_RECEIPT_DRAFT: ReceiptDraft = {
  merchant: null,
  merchantBrand: null,
  total: null,
  currency: "EUR",
  date: null,
  time: null,
  category: "misc",
  items: [],
  tax: {},
  metadata: null,
  parserConfigId: null,
};

function roundToTwo(value: number) {
  return Math.round(value * 100) / 100;
}

function toTwoDecimalString(value: number | null) {
  if (value === null || Number.isNaN(value)) {
    return "";
  }

  return roundToTwo(value).toFixed(2);
}

// TODO: Replace with user-configurable categories when taxonomy settings land.
const CATEGORY_OPTIONS = [
  "groceries",
  "dining",
  "transport",
  "shopping",
  "utilities",
  "health",
  "travel",
  "misc",
] as const;

const TIME_OPTIONS = Array.from({ length: 48 }, (_, index) => {
  const hour = String(Math.floor(index / 2)).padStart(2, "0");
  const minute = index % 2 === 0 ? "00" : "30";
  return `${hour}:${minute}`;
});

function normalizeTimeValue(value: string | null) {
  if (!value) {
    return null;
  }

  const [hour = "", minute = ""] = value.split(":");
  if (!hour || !minute) {
    return null;
  }

  return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
}

export function ReceiptCaptureSection({
  onReceiptSaved,
}: ReceiptCaptureSectionProps) {
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationToast[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [pendingPublicId, setPendingPublicId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReceiptDraft | null>(null);

  const addNotification = (
    title: string,
    description: string,
    tone: NotificationToast["tone"],
  ) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setNotifications((prev) => [...prev, { id, title, description, tone }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, 5000);
  };

  const parseApiError = (
    response: Response,
    payload: unknown,
    fallback: string,
  ): string => {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : fallback;

    if (response.status !== 429) {
      return message;
    }

    const retryAfter = response.headers.get("Retry-After");
    return retryAfter
      ? `${message}. Rate limit reached. Retry in about ${retryAfter}s.`
      : `${message}. Rate limit reached. Please wait and retry.`;
  };

  const cleanupUploadedAsset = async (publicId: string) => {
    try {
      await fetch("/api/uploads/cloudinary/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicId }),
      });
    } catch {}
  };

  const toDraft = (parsed: ParsedReceipt): ReceiptDraft => ({
    merchant: parsed.merchant,
    merchantBrand: parsed.merchant_brand,
    total: parsed.total === null ? null : roundToTwo(parsed.total),
    currency: parsed.currency || "EUR",
    date: parsed.date,
    time: parsed.time,
    category: parsed.category,
    items: parsed.items?.map((item) => ({
      ...item,
      price: roundToTwo(item.price),
    })) ?? null,
    tax: parsed.tax
      ? Object.fromEntries(
          Object.entries(parsed.tax).map(([key, value]) => [key, roundToTwo(value)]),
        )
      : null,
    metadata: parsed.metadata ?? null,
    parserConfigId: parsed.parser_config_id ?? null,
  });

  const getRoundedDraft = (input: ReceiptDraft): ReceiptDraft => ({
    ...input,
    total: input.total === null ? null : roundToTwo(input.total),
    items:
      input.items?.map((item) => ({
        ...item,
        price: roundToTwo(item.price),
      })) ?? null,
    tax: input.tax
      ? Object.fromEntries(
          Object.entries(input.tax).map(([key, value]) => [key, roundToTwo(value)]),
        )
      : null,
  });

  const openManualReceiptEntry = async () => {
    if (pendingPublicId) {
      await cleanupUploadedAsset(pendingPublicId);
    }

    setPendingPublicId(null);
    setSelectedFileName(null);
    setError(null);
    setDraft({ ...EMPTY_RECEIPT_DRAFT, items: [], tax: {} });
    setReviewOpen(true);
  };

  const isDraftEmpty = draft
    ? !hasMeaningfulReceiptContent({
        merchant: draft.merchant,
        merchantBrand: draft.merchantBrand,
        total: draft.total,
        date: draft.date,
        time: draft.time,
        items: draft.items,
        tax: draft.tax,
      })
    : true;
  const isManualDraft = pendingPublicId === null;
  const isManualDraftMissingRequiredFields = draft
    ? !hasRequiredManualReceiptFields({
        merchant: draft.merchant,
        total: draft.total,
        currency: draft.currency,
        date: draft.date,
        category: draft.category,
      })
    : true;

  const resetReviewState = () => {
    setReviewOpen(false);
    setDraft(null);
    setPendingPublicId(null);
    setError(null);
  };

  const clearPendingAssetAndReview = async () => {
    if (pendingPublicId) {
      await cleanupUploadedAsset(pendingPublicId);
    }
    resetReviewState();
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    void (async () => {
      const file = event.target.files?.[0];
      let uploadedPublicId: string | null = null;

      if (!file) {
        return;
      }

      setSelectedFileName(file.name);
      setError(null);
      setIsUploading(true);

      try {
        if (pendingPublicId) {
          await cleanupUploadedAsset(pendingPublicId);
          setPendingPublicId(null);
          setReviewOpen(false);
        }

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
            parseApiError(
              signatureRes,
              signaturePayload,
              "Failed to prepare receipt upload",
            ),
          );
        }

        const uploadFormData = new FormData();
        uploadFormData.append("file", file);
        uploadFormData.append("api_key", signaturePayload.data.apiKey);
        uploadFormData.append("timestamp", String(signaturePayload.data.timestamp));
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

        uploadedPublicId =
          uploadPayload.public_id ?? signaturePayload.data.publicId;

        const ingestRes = await fetch("/api/ingest", {
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

        const ingestPayload = await ingestRes.json();

        if (!ingestRes.ok || !ingestPayload.success) {
          throw new Error(
            parseApiError(ingestRes, ingestPayload, "Failed to process receipt"),
          );
        }

        setDraft(toDraft(ingestPayload.data.parsed as ParsedReceipt));
        setPendingPublicId(
          (ingestPayload.data.cloudinaryPublicId as string) ?? uploadedPublicId,
        );
        setReviewOpen(true);
      } catch (uploadError) {
        if (uploadedPublicId) {
          await cleanupUploadedAsset(uploadedPublicId);
        }

        setError(
          uploadError instanceof Error
            ? uploadError.message
            : "Failed to process receipt",
        );
        addNotification(
          "Receipt processing failed",
          uploadError instanceof Error
            ? uploadError.message
            : "Failed to process receipt",
          "error",
        );
      } finally {
        setIsUploading(false);
        event.target.value = "";
      }
    })();
  };

  const handleSave = async () => {
    if (!draft) {
      return;
    }

    if (isDraftEmpty) {
      const message = "Add at least one receipt detail before saving.";
      setError(message);
      addNotification("Receipt is empty", message, "error");
      return;
    }

    if (isManualDraft && isManualDraftMissingRequiredFields) {
      const missingFields = getManualReceiptMissingFields({
        merchant: draft.merchant,
        total: draft.total,
        currency: draft.currency,
        date: draft.date,
        category: draft.category,
      });
      const message = `Manual receipts require: ${missingFields.join(", ")}.`;
      setError(message);
      addNotification("Missing required fields", message, "error");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const roundedDraft = getRoundedDraft(draft);
      setDraft(roundedDraft);

      const saveRes = await fetch("/api/receipts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...roundedDraft,
          cloudinaryPublicId: pendingPublicId,
        }),
      });
      const savePayload = await saveRes.json();

      if (!saveRes.ok || !savePayload.success) {
        throw new Error(parseApiError(saveRes, savePayload, "Failed to save receipt"));
      }

      resetReviewState();
      onReceiptSaved?.();
      addNotification("Receipt saved", "Your receipt has been stored.", "success");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Failed to save receipt",
      );
      addNotification(
        "Save failed",
        saveError instanceof Error ? saveError.message : "Failed to save receipt",
        "error",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-3">
      <div className="fixed top-4 right-4 z-60 flex w-[320px] flex-col gap-2">
        {notifications.map((note) => (
          <div
            key={note.id}
            className={
              note.tone === "error"
                ? "rounded-lg border border-destructive/40 bg-destructive/10 p-3"
                : "rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3"
            }
          >
            <p className="text-sm font-semibold">{note.title}</p>
            <p className="text-xs text-muted-foreground">{note.description}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold">Add receipt</h2>
        <p className="text-xs text-muted-foreground">
          Upload an image, capture one with your camera, or add a receipt manually
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <Button
            onClick={() => uploadInputRef.current?.click()}
            size="sm"
            variant="outline"
            disabled={isUploading || isSaving}
          >
            <UploadSimple />
            {isUploading ? "Processing..." : "Upload image"}
          </Button>

          <Button
            onClick={() => cameraInputRef.current?.click()}
            size="sm"
            disabled={isUploading || isSaving}
          >
            <Camera />
            {isUploading ? "Processing..." : "Take image"}
          </Button>

          <Button
            onClick={() => {
              void openManualReceiptEntry();
            }}
            size="sm"
            variant="secondary"
            disabled={isUploading || isSaving}
          >
            <NotePencil />
            Add manually
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
          {selectedFileName
            ? `Selected: ${selectedFileName}`
            : "No image selected"}
        </p>
        {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      </div>

      <Dialog
        open={reviewOpen}
        onOpenChange={(open) => {
          if (open) {
            setReviewOpen(true);
            return;
          }

          void clearPendingAssetAndReview();
        }}
      >
        <DialogContent
          className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-2xl"
          showCloseButton={false}
        >
          <DialogHeader className="px-6 pt-6">
            <DialogTitle>Review receipt details</DialogTitle>
            <DialogDescription>
              Edit the receipt details before saving this record.
            </DialogDescription>
          </DialogHeader>

          {draft ? (
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    value={draft.merchant ?? ""}
                    onChange={(event) =>
                      setDraft((prev) =>
                        prev
                          ? { ...prev, merchant: event.target.value || null }
                          : prev,
                      )
                    }
                    placeholder="Merchant"
                  />
                  <Input
                    value={draft.merchantBrand ?? ""}
                    onChange={(event) =>
                      setDraft((prev) =>
                        prev
                          ? { ...prev, merchantBrand: event.target.value || null }
                          : prev,
                      )
                    }
                    placeholder="Brand"
                  />
                  <Input
                    type="number"
                    step="0.01"
                    value={toTwoDecimalString(draft.total)}
                    onChange={(event) =>
                      setDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              total:
                                event.target.value === ""
                                  ? null
                                  : Number(event.target.value),
                            }
                          : prev,
                      )
                    }
                    onBlur={() =>
                      setDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              total: prev.total === null ? null : roundToTwo(prev.total),
                            }
                          : prev,
                      )
                    }
                    placeholder="Total"
                  />
                  <Input
                    value={draft.currency}
                    onChange={(event) =>
                      setDraft((prev) =>
                        prev ? { ...prev, currency: event.target.value || "EUR" } : prev,
                      )
                    }
                    placeholder="Currency"
                  />
                  <DatePicker
                    value={draft.date ?? ""}
                    onChange={(value) =>
                      setDraft((prev) => (prev ? { ...prev, date: value || null } : prev))
                    }
                    placeholder="Select date"
                  />
                  <Select
                    value={normalizeTimeValue(draft.time) ?? undefined}
                    onValueChange={(value) =>
                      setDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              time: String(value),
                            }
                          : prev,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {TIME_OPTIONS.map((timeOption) => (
                        <SelectItem key={timeOption} value={timeOption}>
                          {timeOption}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Category</p>
                <Select
                  value={draft.category ?? "misc"}
                  onValueChange={(value) =>
                    setDraft((prev) =>
                      prev ? { ...prev, category: String(value) } : prev,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Tax lines</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              tax: {
                                ...(prev.tax ?? {}),
                                [`tax-${Object.keys(prev.tax ?? {}).length + 1}`]: 0,
                              },
                            }
                          : prev,
                      )
                    }
                  >
                    Add tax
                  </Button>
                </div>
                <div className="space-y-2">
                  {Object.entries(draft.tax ?? {}).map(([key, value]) => (
                    <div key={key} className="grid gap-2 sm:grid-cols-3">
                      <Input
                        value={key}
                        onChange={(event) =>
                          setDraft((prev) => {
                            if (!prev?.tax) return prev;

                            const nextTax = { ...prev.tax };
                            const amount = nextTax[key];
                            delete nextTax[key];
                            nextTax[event.target.value || key] = amount;

                            return { ...prev, tax: nextTax };
                          })
                        }
                        placeholder="Tax label"
                      />
                      <Input
                        type="number"
                        step="0.01"
                        value={toTwoDecimalString(value)}
                        onChange={(event) =>
                          setDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  tax: {
                                    ...(prev.tax ?? {}),
                                    [key]: Number(event.target.value) || 0,
                                  },
                                }
                              : prev,
                          )
                        }
                        onBlur={() =>
                          setDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  tax: {
                                    ...(prev.tax ?? {}),
                                    [key]: roundToTwo((prev.tax ?? {})[key] ?? 0),
                                  },
                                }
                              : prev,
                          )
                        }
                        placeholder="Amount"
                      />
                      <Button
                        variant="destructive"
                        onClick={() =>
                          setDraft((prev) => {
                            if (!prev?.tax) return prev;

                            const nextTax = { ...prev.tax };
                            delete nextTax[key];

                            return { ...prev, tax: nextTax };
                          })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Items</p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              items: [...(prev.items ?? []), { name: "", price: 0 }],
                            }
                          : prev,
                      )
                    }
                  >
                    Add item
                  </Button>
                </div>
                <div className="space-y-2">
                  {(draft.items ?? []).map((item, index) => (
                    <div key={`${item.name}-${index}`} className="grid gap-2 sm:grid-cols-3">
                      <Input
                        value={item.name}
                        placeholder="Item name"
                        onChange={(event) =>
                          setDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  items: (prev.items ?? []).map((entry, entryIndex) =>
                                    entryIndex === index
                                      ? { ...entry, name: event.target.value }
                                      : entry,
                                  ),
                                }
                              : prev,
                          )
                        }
                      />
                      <Input
                        type="number"
                        step="0.01"
                        value={toTwoDecimalString(item.price)}
                        placeholder="Price"
                        onChange={(event) =>
                          setDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  items: (prev.items ?? []).map((entry, entryIndex) =>
                                    entryIndex === index
                                      ? {
                                          ...entry,
                                          price: Number(event.target.value) || 0,
                                        }
                                      : entry,
                                  ),
                                }
                              : prev,
                          )
                        }
                        onBlur={() =>
                          setDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  items: (prev.items ?? []).map((entry, entryIndex) =>
                                    entryIndex === index
                                      ? {
                                          ...entry,
                                          price: roundToTwo(entry.price),
                                        }
                                      : entry,
                                  ),
                                }
                              : prev,
                          )
                        }
                      />
                      <Button
                        variant="destructive"
                        onClick={() =>
                          setDraft((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  items: (prev.items ?? []).filter(
                                    (_, entryIndex) => entryIndex !== index,
                                  ),
                                }
                              : prev,
                          )
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </div>
          ) : null}

          <DialogFooter className="border-t bg-background px-6 py-4">
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={() => {
                void clearPendingAssetAndReview();
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={
                isSaving ||
                !draft ||
                isDraftEmpty ||
                (isManualDraft && isManualDraftMissingRequiredFields)
              }
              onClick={handleSave}
            >
              {isSaving ? "Saving..." : "Save receipt"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
