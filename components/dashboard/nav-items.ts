import {
  ChartBarIcon,
  GearSixIcon,
  HouseIcon,
  type Icon,
  ReceiptIcon,
} from "@phosphor-icons/react";

export type DashboardNavItem = {
  label: string;
  href: string;
  icon: Icon;
  enabled: boolean;
};

export const dashboardNavItems: DashboardNavItem[] = [
  {
    label: "Home",
    href: "/dashboard",
    icon: HouseIcon,
    enabled: true,
  },
  {
    label: "Receipts",
    href: "/dashboard/receipts",
    icon: ReceiptIcon,
    enabled: true,
  },
  {
    label: "Stats",
    href: "/dashboard/stats",
    icon: ChartBarIcon,
    enabled: true,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: GearSixIcon,
    enabled: true,
  },
];
