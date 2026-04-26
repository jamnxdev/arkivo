"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

import { DashboardPreviewFrame } from "./dashboard-preview-frame";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { dashboardNavItems } from "./nav-items";

type DashboardShellProps = {
  children: React.ReactNode;
};

export function DashboardShell({ children }: DashboardShellProps) {
  const isTabletViewport = useMediaQuery("(max-width: 1023px)");
  const pathname = usePathname();
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const previewWidthClass = isTabletViewport ? "w-full" : "max-w-2xl";
  const activeItem = dashboardNavItems.find((item) =>
    item.href === "/dashboard"
      ? pathname === item.href
      : pathname.startsWith(item.href),
  );
  const activeItemLabel = activeItem?.label ?? "Dashboard";
  const activeItemDescription =
    activeItem?.description ?? "Review your dashboard overview and activity.";

  if (isTabletViewport) {
    return (
      <div className="min-h-screen">
        <DashboardPreviewFrame
          isMobile={isTabletViewport}
          previewWidthClass={previewWidthClass}
        >
          {children}
        </DashboardPreviewFrame>
        <MobileBottomNav previewWidthClass={previewWidthClass} />
      </div>
    );
  }

  return (
    <SidebarProvider
      open={isDesktopSidebarOpen}
      onOpenChange={setIsDesktopSidebarOpen}
      style={
        {
          "--sidebar-width": "16rem",
        } as React.CSSProperties
      }
    >
      <Sidebar collapsible="icon" variant="inset">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Arkivo</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {dashboardNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/dashboard"
                      ? pathname === item.href
                      : pathname.startsWith(item.href);

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isActive}
                        disabled={!item.enabled}
                        tooltip={item.label}
                        render={<Link href={item.href} />}
                        className={cn(
                          !item.enabled && "pointer-events-none opacity-60",
                        )}
                      >
                        <Icon size={18} weight="duotone" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarRail />
      </Sidebar>

      <SidebarInset className="bg-muted/20">
        <div className="mx-auto w-full max-w-[1440px] p-4 lg:p-6">
          <div
            className={cn(
              "mx-auto w-full space-y-6 transition-[max-width] duration-200 ease-linear",
            )}
          >
            <header className="border-b pb-4">
              <div className="flex items-center gap-2">
                <SidebarTrigger />
                <Separator
                  orientation="vertical"
                  className="mx-1 h-4 data-vertical:self-auto"
                />
                <h1 className="text-base font-medium">{activeItemLabel}</h1>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {activeItemDescription}
              </p>
            </header>

            <DashboardPreviewFrame
              isMobile={isTabletViewport}
              previewWidthClass={previewWidthClass}
            >
              {children}
            </DashboardPreviewFrame>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
