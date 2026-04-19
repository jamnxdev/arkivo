"use client";

import { useMediaQuery } from "@/hooks/use-media-query";
import { env } from "@/lib/env";

import { DashboardPreviewFrame } from "./dashboard-preview-frame";
import { MobileBottomNav } from "./mobile-bottom-nav";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const isTabletViewport = useMediaQuery("(max-width: 1023px)");
  const previewWidthClass = isTabletViewport ? "w-full" : "max-w-2xl";

  return (
    <div className="min-h-screen">
      {isTabletViewport ? (
        <>
          <DashboardPreviewFrame
            isMobile={isTabletViewport}
            previewWidthClass={previewWidthClass}
          >
            {children}
          </DashboardPreviewFrame>
          <MobileBottomNav previewWidthClass={previewWidthClass} />
        </>
      ) : (
        <DashboardPreviewFrame
          isMobile={isTabletViewport}
          previewWidthClass={previewWidthClass}
        >
          {children}
        </DashboardPreviewFrame>
      )}
    </div>
  );
}
