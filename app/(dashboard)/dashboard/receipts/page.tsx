import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ReceiptsPageContent } from "@/components/receipts/receipts-page-content";

export default function ReceiptsPage() {
  return (
    <DashboardShell>
      <ReceiptsPageContent />
    </DashboardShell>
  );
}
