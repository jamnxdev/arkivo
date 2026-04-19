"use client";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { SettingsPageContent } from "@/components/settings/settings-page-content";

export default function DashboardSettingsPage() {
  return (
    <DashboardShell>
      <SettingsPageContent />
    </DashboardShell>
  );
}
