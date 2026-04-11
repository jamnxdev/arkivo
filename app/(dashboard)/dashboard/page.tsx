"use client";

import { useState } from "react";

import { AnalyticsCards } from "@/components/analytics-cards";
import { Charts } from "@/components/charts";
import { ReceiptList } from "@/components/receipt-list";
import { UploadButton } from "@/components/upload-button";

export default function DashboardPage() {
  const [refreshToken, setRefreshToken] = useState(0);

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-semibold">Arkivo</h1>

      <UploadButton onUploadComplete={() => setRefreshToken((value) => value + 1)} />

      <AnalyticsCards refreshToken={refreshToken} />

      <Charts refreshToken={refreshToken} />

      <ReceiptList refreshToken={refreshToken} />
    </div>
  );
}
