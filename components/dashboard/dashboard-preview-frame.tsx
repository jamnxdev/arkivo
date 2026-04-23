"use client";

type DashboardPreviewFrameProps = {
  isMobile: boolean;
  previewWidthClass: string;
  children: React.ReactNode;
};

export function DashboardPreviewFrame({
  isMobile,
  previewWidthClass,
  children,
}: DashboardPreviewFrameProps) {
  return (
    <div
      className={`${
        isMobile
          ? `mx-auto w-full ${previewWidthClass} space-y-6 p-4 pb-24`
          : "space-y-6"
      }`}
    >
      {children}
    </div>
  );
}
